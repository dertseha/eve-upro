var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var Component = require('../components/Component.js');
var UuidFactory = require('../util/UuidFactory.js');
var clientEvents = require('../model/ClientEvents');
var clientRequests = require('../model/ClientRequests');
var busMessages = require('../model/BusMessages.js');

function ClientSessionComponent(services)
{
   ClientSessionComponent.super_.call(this);

   this.amqp = services['amqp'];
   this.characterAgent = services['character-agent'];
   this.eveapiMsg = services['eveapi-msg'];
   this.httpServer = services['http-server'];

   this.correlationIdCounter = 0;
   this.logInRequests = {};

   this.dataPorts = {};

   /** {@inheritDoc} */
   this.start = function()
   {
      var self = this;

      this.amqp.allocateResponseQueue(function(queue)
      {
         self.onResponseQueue(queue);
      });

      this.registerBroadcastHandler(busMessages.Broadcasts.ClientConnected);
      this.amqp.on('broadcast', function(header, body)
      {
         self.onBroadcast(header, body);
      });

      this.characterAgent.on('SessionAdded', function(character, sessionId)
      {
         self.onCharacterSessionAdded(character, sessionId);
      });
   };

   this.registerBroadcastHandler = function(broadcastName)
   {
      var self = this;
      var handler = this['onBroadcast' + broadcastName];

      this.amqp.on('broadcast:' + broadcastName, function(header, body)
      {
         handler.call(self, header, body);
      });
   };

   /**
    * Broadcast handler. If the client is known to this session component, the client is notified of its allocated
    * session ID. This is done in the handler here to ensure the system knows about the session ID before the client is
    * able to start using it.
    */
   this.onBroadcastClientConnected = function(header, body)
   {
      var dataPort = this.dataPorts[body.sessionId];

      if (dataPort)
      {
         var eventData =
         {
            sessionId: body.sessionId,
            user: body.user
         };

         dataPort.sendFunction(JSON.stringify(eventData), clientEvents.EventNames.Session);
      }
   };

   /**
    * Generic broadcast handler This one checks whether the broadcast has some share information (interest) that matches
    * to any existing data port connection. If matching, the body is forwarded to the client.
    */
   this.onBroadcast = function(broadcastHeader, broadcastBody)
   {
      if (broadcastHeader.interest)
      {
         var dataPort = null;
         var eventBody =
         {
            header:
            {
               type: broadcastHeader.type
            },
            body: broadcastBody
         };
         var eventBodyString = JSON.stringify(eventBody);

         if ((broadcastHeader.interest.length == 1) && (broadcastHeader.interest[0].scope === 'Session'))
         { // explicit session identification
            dataPort = this.dataPorts[broadcastHeader.interest[0].id];
            if (dataPort && dataPort.character)
            {
               dataPort.sendFunction(eventBodyString, clientEvents.EventNames.Broadcast);
            }
         }
         else
         { // generic interest based broadcast
            for ( var sessionId in this.dataPorts)
            {
               dataPort = this.dataPorts[sessionId];
               if (dataPort.character && dataPort.character.hasInterestIn(broadcastHeader.interest))
               {
                  dataPort.sendFunction(eventBodyString, clientEvents.EventNames.Broadcast);
               }
            }
         }
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterSessionAdded = function(character, sessionId)
   {
      var dataPort = this.dataPorts[sessionId];

      if (dataPort)
      {
         dataPort.character = character;
      }
   };

   /**
    * Callback for the allocation of a response queue from EVE API
    * 
    * @param queue the response queue
    */
   this.onResponseQueue = function(queue)
   {
      var self = this;

      this.responseQueue = queue;
      this.responseQueue.subscribe(function(message, headers, deliveryInfo)
      {
         self.onMessage(message, headers, deliveryInfo);
      });

      this.onStartProgress();
   };

   /** Start progress */
   this.onStartProgress = function()
   {
      if (this.responseQueue)
      {
         this.httpServer.setSessionHandler(this);
         this.onStarted();
      }
   };

   /**
    * a message received from the response queue
    * 
    * @param message the message object
    * @param headers message headers
    * @param deliveryInfo routing of message
    */
   this.onMessage = function(message, headers, deliveryInfo)
   {
      var correlationId = deliveryInfo.correlationId;
      var request = this.logInRequests[correlationId];
      var struct = JSON.parse(message.data);

      delete this.logInRequests[correlationId];

      if (struct.err)
      {
         logger.error('Failed to request data: ' + JSON.stringify(struct.err));
         request.done('Request Error', null);
      }
      else if (struct.response.err)
      {
         request.done(null, false);
      }
      else if ((struct.response.key.accessMask === 0) && (struct.response.key.type == "Character")
            && (struct.response.characters.length == 1))
      {
         var character = struct.response.characters[0];
         var user =
         {
            characterId: character.characterID,
            characterName: character.characterName,
            corporationId: character.corporationID,
            corporationName: character.corporationName
         };

         request.done(null, user);
      }
      else
      {
         request.done(null, false);
      }
   };

   /**
    * Log-In request
    * 
    * @param keyId keyID for the API request
    * @param vCode vCode for the API request
    * @param done callback on completion
    */
   this.onLogInRequest = function(eveData, keyId, vCode, done)
   {
      var parameter =
      {
         keyId: keyId,
         vCode: vCode
      };
      var id = this.correlationIdCounter++;

      this.logInRequests[id] =
      {
         done: done,
         eveData: eveData
      };

      this.eveapiMsg.request('AccountApiKeyInfo', parameter, this.responseQueue.name, id);
   };

   this.onDataPortOpened = function(user, stream, sendFunction)
   {
      var sessionId = UuidFactory.v4();
      var self = this;

      { // set up data port entry
         var dataPort =
         {
            user: user,
            stream: stream,
            sendFunction: sendFunction,
            character: null
         };

         this.dataPorts[sessionId] = dataPort;
      }
      { // register close handler
         stream.on('close', function()
         {
            self.onDataPortClosed(sessionId);
         });
      }
      this.broadcastClientConnectionStatus(busMessages.Broadcasts.ClientConnected, sessionId, dataPort.user, this.amqp
            .getLocalQueueName());
   };

   this.onDataPortClosed = function(sessionId)
   {
      var dataPort = this.dataPorts[sessionId];

      delete this.dataPorts[sessionId];
      this.broadcastClientConnectionStatus(busMessages.Broadcasts.ClientDisconnected, sessionId, dataPort.user);
   };

   /**
    * Broadcasts the client connection status
    * 
    * @param type the message type
    * @param sessionId the sessionId of the connection
    * @param user the corresponding user info
    * @param responseQueue optional queue name for direct information
    */
   this.broadcastClientConnectionStatus = function(type, sessionId, user, responseQueue)
   {
      var header =
      {
         type: type
      };
      var body =
      {
         sessionId: sessionId,
         responseQueue: responseQueue,
         user: user
      };

      this.amqp.broadcast(header, body);
   };

   this.onClientRequest = function(clientRequest)
   {
      var rCode = 'OK';

      if (clientRequests.RequestNames[clientRequest.header.type])
      {
         var handler = this['onClientRequest' + clientRequest.header.type];

         if (handler)
         {
            rCode = handler.call(this, clientRequest);
         }
         else
         {
            logger.warn('Unhandled, registered request: ' + clientRequest.header.type);
            rCode = 'Unhandled Request';
         }
      }
      else
      {
         rCode = 'Unknown Request';
      }

      return rCode;
   };

   /**
    * Client request handler
    */
   this.onClientRequestStatus = function(clientRequest)
   {
      var rCode = 'OK';

      if (clientRequest.eveHeaders)
      {
         var header =
         {
            type: busMessages.Broadcasts.EveStatusUpdateRequest
         };
         var body =
         {
            sessionId: clientRequest.header.sessionId,
            eveInfo: clientRequest.eveHeaders
         };

         this.amqp.broadcast(header, body);
      }

      return rCode;
   };
}
util.inherits(ClientSessionComponent, Component);

module.exports = ClientSessionComponent;
