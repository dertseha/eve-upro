var EventEmitter = require('events').EventEmitter;

var log4js = require('log4js');
var logger = log4js.getLogger();

var busMessages = require('../../model/BusMessages.js');

var Character = require('../../character-agent-component/Character.js');
var CharacterAgentComponent = require('../../character-agent-component/CharacterAgentComponent.js');

function AbstractServiceComponentFixture()
{
   var self = this;

   this.broadcastedMessages = [];

   this.amqp = new EventEmitter();
   this.amqp.broadcast = function(header, body)
   {
      this.emit('broadcast:' + header.type, header, body);
      this.emit('broadcast', header, body);
   };

   this.amqp.on('broadcast', function(header, body)
   {
      var message =
      {
         header: header,
         body: body
      };

      self.broadcastedMessages.push(message);
   });

   this.mongodb = new function()
   {
      this.storedData = {}; // containing the documents to return per collection name
      this.delayedData = {}; // containing the events per collection name

      this.defineCollection = function(name, indexDef, callback)
      {
         callback();
      };
      this.getData = function(collectionName, filter, callback)
      {
         var delayEvent = this.delayedData[collectionName];

         if (delayEvent)
         {
            var self = this;

            delayEvent.on('event', function()
            {
               self.returnData(collectionName, callback);
            });
         }
         else
         {
            this.returnData(collectionName, callback);
         }
      };
      this.setData = function(collectionName, id, data, callback)
      {
         callback(null);
      };
      this.delData = function(collectionName, criteria, callback)
      {
         callback(null);
      };

      this.returnData = function(collectionName, callback)
      {
         var data = this.storedData[collectionName];

         if (data)
         {
            data.forEach(function(document)
            {
               callback(null, document.id, document.data);
            });
         }

         callback(null, null, null);
      };
   };
   this.characterAgent = new CharacterAgentComponent(
   {
      amqp: this.amqp
   });

   this.givenExistingCharacterSession = function(charId, sessionId, corpId)
   {
      this.givenExistingCharacterSessions(charId, [ sessionId ], corpId);
   };

   this.givenExistingCharacterSessions = function(charId, sessionIds, corpId)
   {
      var character = new Character(charId, 'name', corpId, 'OmniCorp');
      var self = this;

      this.characterAgent.characters[charId] = character;
      this.initCharacterServiceData(character);
      sessionIds.forEach(function(sessionId)
      {
         self.characterAgent.charactersBySession[sessionId] = character;
         character.addClientSession(sessionId);
      });
   };

   this.initCharacterServiceData = function(character)
   {

   };

   this.givenStorageContainsData = function(collectionName, documents)
   {
      this.mongodb.storedData[collectionName] = documents;
   };

   this.givenStorageReturnsDataDelayed = function(collectionName, documents, emitter)
   {
      this.mongodb.storedData[collectionName] = documents;
      this.mongodb.delayedData[collectionName] = emitter || new EventEmitter();
   };

   this.whenStorageReturnsData = function(collectionName)
   {
      this.mongodb.delayedData[collectionName].emit('event');
   },

   this.whenBroadcastReceived = function(type, sessionId, body, extraHeader)
   {
      var header =
      {
         type: type,
         sessionId: sessionId
      };

      if (extraHeader)
      {
         for ( var headerName in extraHeader)
         {
            header[headerName] = extraHeader[headerName];
         }
      }

      if (!busMessages.Broadcasts[header.type])
      {
         logger.warn('TEST: Unregistered broadcast [' + header.type + ']');
      }

      this.amqp.broadcast(header, body);
   };

   this.whenClientConnected = function(charId, sessionId, responseQueue)
   {
      this.broadcastClientStatus(busMessages.Broadcasts.ClientConnected.name, charId, sessionId, responseQueue);
   };

   this.whenClientDisconnected = function(charId, sessionId, responseQueue)
   {
      this.broadcastClientStatus(busMessages.Broadcasts.ClientDisconnected.name, charId, sessionId);
   };

   this.broadcastClientStatus = function(type, charId, sessionId, responseQueue)
   {
      var header =
      {
         type: type
      };
      var body =
      {
         sessionId: sessionId,
         responseQueue: responseQueue,
         user:
         {
            characterId: charId
         }
      };

      this.amqp.emit('broadcast', header, body);
      this.amqp.emit('broadcast:' + header.type, header, body);
   };

   this.expectingBroadcastInterest = function(test, expectedType, expectedInterest)
   {
      this.amqp.broadcast = function(header, body)
      {
         if (header.type && (header.type == expectedType))
         {
            test.deepEqual(header.interest, expectedInterest);
         }
      };
   };

   this.findLastBroadcastOfType = function(type)
   {
      var found = null;
      var i;

      for (i = this.broadcastedMessages.length - 1; !found && (i >= 0); i--)
      {
         var temp = this.broadcastedMessages[i];

         if (temp.header.type == type)
         {
            found = temp;
         }
      }

      return found;
   };

   this.thenTheLastBroadcastShouldHaveBeen = function(test, type, body, interest)
   {
      var lastMessage = this.findLastBroadcastOfType(type);

      if (lastMessage)
      {
         if (interest)
         {
            test.deepEqual(lastMessage.header.interest, interest);
         }
         test.deepEqual(lastMessage.body, body);
      }
   };

   this.thenTheLastBroadcastShouldHaveIncluded = function(test, type, bodyParts)
   {
      var lastMessage = this.findLastBroadcastOfType(type);

      if (lastMessage)
      {
         for ( var name in bodyParts)
         {
            test.deepEqual(lastMessage.body[name], bodyParts[name]);
         }
      }
   };
}

module.exports = AbstractServiceComponentFixture;
