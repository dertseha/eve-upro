var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');
var schema = require('js-schema');

var Component = require('../components/Component.js');
var UuidFactory = require('../util/UuidFactory.js');
var clientEvents = require('../model/ClientEvents').clientEvents;
var clientRequests = require('../model/ClientRequests').clientRequests;
var clientBroadcastEvents = require('../model/ClientBroadcastEvents').clientBroadcastEvents;
var busMessages = require('../model/BusMessages.js');

var LogInRequest = require('./LogInRequest.js');
var EveInfoExtractorNull = require('./EveInfoExtractorNull.js');
var EveInfoExtractorHeaders = require('./EveInfoExtractorHeaders.js');

function ClientSessionComponent(services, options)
{
   ClientSessionComponent.super_.call(this);

   this.amqp = services['amqp'];
   this.characterAgent = services['character-agent'];
   this.eveapiMsg = services['eveapi-msg'];
   this.httpServer = services['http-server'];

   this.correlationIdCounter = 0;
   this.logInRequests = {};

   this.dataPorts = {};
   this.options = options;

   /** {@inheritDoc} */
   this.start = function()
   {
      var self = this;

      this.amqp.on('broadcast', function(header, body)
      {
         self.onBroadcast(header, body);
      });
      this.registerBroadcastHandler(busMessages.Broadcasts.EveApiResponse.name);

      this.characterAgent.on('SessionAdded', function(character, sessionId)
      {
         self.onCharacterSessionAdded(character, sessionId);
      });
      this.characterAgent.on('CharacterGroupMemberRemoved', function(character, groupId)
      {
         self.onCharacterGroupMemberRemoved(character, groupId);
      });

      this.httpServer.setSessionHandler(this);

      this.onStarted();
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
    * Generic broadcast handler This one checks whether the broadcast has some share information (interest) that matches
    * to any existing data port connection. If matching, the body is forwarded to the client.
    */
   this.onBroadcast = function(broadcastHeader, broadcastBody)
   {
      if (broadcastHeader.sessionId)
      {
         this.restartDataPortTimer(broadcastHeader.sessionId);
      }

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
               dataPort.sendFunction(eventBodyString, clientEvents.Broadcast.name);
            }
         }
         else
         { // generic interest based broadcast
            for ( var sessionId in this.dataPorts)
            {
               dataPort = this.dataPorts[sessionId];
               if (dataPort.character && dataPort.character.hasInterestIn(broadcastHeader.interest)
                     && !dataPort.character.hasInterestIn(broadcastHeader.disinterest))
               {
                  dataPort.sendFunction(eventBodyString, clientEvents.Broadcast.name);
               }
            }
         }
      }
   };

   /**
    * Character state handler. If the client is known to this session component, the client is notified of its allocated
    * session ID. This is done in the handler here to ensure the system knows about the session ID before the client is
    * able to start using it.
    */
   this.onCharacterSessionAdded = function(character, sessionId)
   {
      var dataPort = this.dataPorts[sessionId];

      if (dataPort)
      {
         var eventData =
         {
            sessionId: sessionId,
            user: dataPort.user
         };

         dataPort.character = character;
         dataPort.sendFunction(JSON.stringify(eventData), clientEvents.Session.name);
      }
   };

   /**
    * Character state handler. This one is necessary as the CharacterAgentComponent already removes the group membership
    * from the Character before this broadcast is handled and sent in the general broadcast handler. Since this is a
    * local problem of the ClientSessionComponent, it is handled here.
    */
   this.onCharacterGroupMemberRemoved = function(character, groupId)
   {
      var characterId = character.getCharacterId();
      var eventBody =
      {
         header:
         {
            type: busMessages.Broadcasts.GroupMembership.name
         },
         body:
         {
            groupId: groupId,
            removed:
            {
               members: [ characterId ]
            }
         }
      };
      var eventBodyString = JSON.stringify(eventBody);
      var dataPort = null;

      for ( var sessionId in this.dataPorts)
      {
         dataPort = this.dataPorts[sessionId];
         if (dataPort.character && (dataPort.character.getCharacterId() == characterId))
         {
            dataPort.sendFunction(eventBodyString, clientEvents.Broadcast.name);
         }
      }
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastEveApiResponse = function(header, body)
   {
      var correlationId = header.correlationId;
      var request = this.logInRequests[correlationId];
      var struct =
      {
         response: body.response
      };

      if (request)
      {
         if (request.onEveApiMessage(struct))
         {
            delete this.logInRequests[correlationId];
         }
      }
      else
      {
         logger.warn('Received message without correlating request, ID: ' + correlationId);
      }
   };

   /**
    * Checks whether the given user is allowed to access the service
    * 
    * @param user the user object identifying character and corporation
    * @returns true if allowed
    */
   this.isUserAllowed = function(user)
   {
      var rCode = true;

      if (!this.isSecuritySetEmpty(this.options.security.allowed))
      {
         rCode = this.isUserInSecuritySet(user, this.options.security.allowed);
      }
      if (!this.isSecuritySetEmpty(this.options.security.denied))
      {
         rCode = !this.isUserInSecuritySet(user, this.options.security.denied);
      }

      return rCode;
   };

   /**
    * @returns true if given security set is empty (not defined)
    */
   this.isSecuritySetEmpty = function(set)
   {
      var rCode = true;

      if (set)
      {
         rCode = (!set.characterIds || (set.characterIds.length == 0))
               && (!set.corporationIds || (set.corporationIds.length == 0))
               && (!set.allianceIds || (set.allianceIds.length == 0));
      }

      return rCode;
   };

   /**
    * @returns true if given user is within the given security set
    */
   this.isUserInSecuritySet = function(user, set)
   {
      var rCode = false;

      if (set.characterIds && (set.characterIds.indexOf(user.characterId) >= 0))
      {
         rCode = true;
      }
      if (set.corporationIds && (set.corporationIds.indexOf(user.corporationId) >= 0))
      {
         rCode = true;
      }
      if (set.allianceIds && user.allianceId && (set.allianceIds.indexOf(user.allianceId) >= 0))
      {
         rCode = true;
      }

      return rCode;
   };

   /**
    * Log-In request
    * 
    * @param keyId keyID for the API request
    * @param vCode vCode for the API request
    * @param done callback on completion
    */
   this.onLogInRequest = function(keyId, vCode, done)
   {
      var parameters =
      {
         keyId: keyId,
         vCode: vCode
      };
      var id = this.correlationIdCounter++;
      var request = new LogInRequest(this, id, done);

      this.logInRequests[id] = request;

      this.eveApiRequest('AccountApiKeyInfo', parameters, id);
   };

   this.eveApiRequest = function(name, parameters, id)
   {
      this.eveapiMsg.request(name, parameters, id);
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

         dataPort.timer = setTimeout(function()
         {
            self.onDataPortTimeout(sessionId);
         }, 15000);
         this.dataPorts[sessionId] = dataPort;
      }
      { // register close handler
         stream.on('close', function()
         {
            self.onDataPortClosed(sessionId);
         });
      }
      this.broadcastClientConnectionStatus(busMessages.Broadcasts.ClientConnected.name, sessionId, dataPort.user,
            this.amqp.getLocalQueueName());
   };

   this.restartDataPortTimer = function(sessionId)
   {
      var dataPort = this.dataPorts[sessionId];
      var self = this;

      if (dataPort)
      {
         clearTimeout(dataPort.timer);
         dataPort.timer = setTimeout(function()
         {
            self.onDataPortTimeout(sessionId);
         }, 15000);
      }
   };

   this.onDataPortTimeout = function(sessionId)
   {
      var dataPort = this.dataPorts[sessionId];

      if (dataPort)
      {
         logger.verbose('Timeout of session [' + sessionId + ']');
         dataPort.stream.end();
         this.deleteAndNotifyDataPort(sessionId, dataPort);
      }
   };

   this.onDataPortClosed = function(sessionId)
   {
      var dataPort = this.dataPorts[sessionId];

      if (dataPort)
      {
         if (dataPort.timer)
         {
            clearTimeout(dataPort.timer);
         }
         this.deleteAndNotifyDataPort(sessionId, dataPort);
      }
   };

   this.deleteAndNotifyDataPort = function(sessionId, dataPort)
   {
      delete this.dataPorts[sessionId];
      this.broadcastClientConnectionStatus(busMessages.Broadcasts.ClientDisconnected.name, sessionId, dataPort.user);
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

      logger.info('ConnectionStatus change: ' + type + '[' + sessionId + '] for character ' + user.characterId + ' ['
            + user.characterName + ']');
      this.amqp.broadcast(header, body);
   };

   /**
    * This method is the generic handler of an incoming client request via the external interface
    * 
    * @param clientRequest the request object consisting of at least { header: { type: '' }, body: {...} }
    */
   this.onClientRequest = function(clientRequest)
   {
      var rCode = 'OK';
      var requestInfo = clientRequests[clientRequest.header.type];

      if (!requestInfo)
      {
         logger.warn('Unregistered client request [' + clientRequest.header.type + ']');
         rCode = 'Unknown Request';
      }
      else if (!this.isRequestValid(requestInfo, clientRequest))
      {
         logger.warn('Invalid client request received: [' + clientRequest.header.type + ']');
         rCode = 'Invalid Request';
      }
      else
      {
         var handler = this['onClientRequest' + clientRequest.header.type];

         if (handler)
         {
            rCode = handler.call(this, clientRequest);
         }
         else
         {
            this.onGenericClientRequest(clientRequest);
         }
      }

      return rCode;
   };

   /**
    * Checks whether the given request is valid according to the request information
    * 
    * @param requestInfo the request definition
    * @param clientRequest the request to check
    * @returns true if valid
    */
   this.isRequestValid = function(requestInfo, clientRequest)
   {
      var rCode = false;

      if (!requestInfo.header.isValid)
      {
         requestInfo.header.isValid = schema(requestInfo.header.schema);
      }
      if (!requestInfo.body.isValid)
      {
         requestInfo.body.isValid = schema(requestInfo.body.schema);
      }
      rCode = requestInfo.header.isValid(clientRequest.header) && requestInfo.body.isValid(clientRequest.body);

      return rCode;
   };

   /**
    * Client request handler
    */
   this.onClientRequestStatus = function(clientRequest)
   {
      var rCode = 'OK';
      var eveInfo = this.extractEveInfo(clientRequest);

      if (eveInfo && eveInfo.trusted && (eveInfo.characterId == clientRequest.user.characterId))
      {
         var header =
         {
            type: busMessages.Broadcasts.EveStatusUpdateRequest.name,
            sessionId: clientRequest.header.sessionId
         };
         var body =
         {
            eveInfo: eveInfo
         };

         this.amqp.broadcast(header, body);
      }
      else
      {
         var header =
         {
            type: busMessages.Broadcasts.SessionKeepAlive.name,
            sessionId: clientRequest.header.sessionId
         };
         var body = {};

         this.amqp.broadcast(header, body);
      }

      return rCode;
   };

   /**
    * Extracts EVE information (IGB header data) from given client request
    * 
    * @param clientRequest the client request to read header data from
    * @returns an object containing the data
    */
   this.extractEveInfo = function(clientRequest)
   {
      var result = null;
      var extractor = new EveInfoExtractorNull();
      var headerToInfoMap =
      {
         trusted:
         {
            name: "trusted",
            converter: function(value)
            {
               return value == 'Yes';
            }
         },
         charid:
         {
            name: "characterId",
            converter: parseInt
         },
         charname:
         {
            name: "characterName",
            converter: String
         },
         corpid:
         {
            name: "corporationId",
            converter: parseInt
         },
         corpname:
         {
            name: "corporationName",
            converter: String
         },
         solarsystemid:
         {
            name: "solarSystemId",
            converter: parseInt
         }
      };

      if (clientRequest.eveHeaders)
      {
         extractor = new EveInfoExtractorHeaders(clientRequest.eveHeaders);
      }

      for ( var headerName in headerToInfoMap)
      {
         var info = headerToInfoMap[headerName];
         var value = extractor.get(headerName);

         if (value)
         {
            if (!result)
            {
               result = {};
            }
            result[info.name] = info.converter(value);
         }
      }

      return result;
   },

   /**
    * Client request handler (Default)
    */
   this.onGenericClientRequest = function(clientRequest)
   {
      var header =
      {
         type: 'ClientRequest' + clientRequest.header.type,
         sessionId: clientRequest.header.sessionId
      };
      var body = clientRequest.body;

      this.amqp.broadcast(header, body);
   };
}
util.inherits(ClientSessionComponent, Component);

module.exports = ClientSessionComponent;
