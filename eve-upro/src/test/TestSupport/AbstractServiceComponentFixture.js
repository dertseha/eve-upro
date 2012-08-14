var EventEmitter = require('events').EventEmitter;

var log4js = require('log4js');
var logger = log4js.getLogger();

var busMessages = require('../../model/BusMessages.js');

var Character = require('../../character-agent-component/Character.js');
var CharacterAgentComponent = require('../../character-agent-component/CharacterAgentComponent.js');

function AbstractServiceComponentFixture()
{
   this.amqp = new EventEmitter();
   this.amqp.broadcast = function(header, body)
   {
      this.emit('broadcast', header, body);
      this.emit('broadcast:' + header.type, header, body);
   };

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

   this.givenExistingCharacterSession = function(charId, sessionId)
   {
      this.givenExistingCharacterSessions(charId, [ sessionId ]);
   };

   this.givenExistingCharacterSessions = function(charId, sessionIds)
   {
      var character = new Character(charId, 'name');
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
      this.mongodb.delayedData[collectionName] = emitter;
   };

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

      this.amqp.emit('broadcast', header, body);
      this.amqp.emit('broadcast:' + header.type, header, body);
   };

   this.whenClientConnected = function(charId, sessionId, responseQueue)
   {
      this.broadcastClientStatus(busMessages.Broadcasts.ClientConnected, charId, sessionId, responseQueue);
   };

   this.whenClientDisconnected = function(charId, sessionId, responseQueue)
   {
      this.broadcastClientStatus(busMessages.Broadcasts.ClientDisconnected, charId, sessionId);
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
}

module.exports = AbstractServiceComponentFixture;
