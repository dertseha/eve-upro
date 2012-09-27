var EventEmitter = require('events').EventEmitter;

var winston = require('winston');
var logger = winston.loggers.get('root');

var UuidFactory = require('../../util/UuidFactory.js');
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
      self.broadcast(header, body);
   };

   this.broadcast = function(header, body)
   {
      this.amqp.emit('broadcast:' + header.type, header, body);
      this.amqp.emit('broadcast', header, body);
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
      this.callbackLists = {}; // containing the callbacks in sequence to call

      this.defineCollection = function(name, indexDef, callback)
      {
         process.nextTick(callback);
      };
      this.getData = function(collectionName, filter, callback)
      {
         var delayEvent = this.delayedData[collectionName];

         if (delayEvent)
         {
            this.callbackLists[collectionName].push(callback);
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
               callback(null, document._id, document.data);
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
      sessionIds.forEach(function(sessionId)
      {
         self.characterAgent.charactersBySession[sessionId] = character;
         character.addClientSession(sessionId);
      });
      this.initCharacterServiceData(character);
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
      var emitterToUse = emitter || new EventEmitter();
      var self = this;

      this.mongodb.storedData[collectionName] = documents;
      this.mongodb.delayedData[collectionName] = emitterToUse;
      this.mongodb.callbackLists[collectionName] = [];
      emitterToUse.on('event', function()
      {
         var callback = self.mongodb.callbackLists[collectionName].shift();

         self.mongodb.returnData(collectionName, callback);
      });
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

      this.broadcast(header, body);
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

      this.broadcast(header, body);
   };

   this.givenCharacterIsMemberOfGroups = function(charId, groupIds)
   {
      var syncId = UuidFactory.v4();
      var character = this.characterAgent.characters[charId];

      character.handleGroupDataSyncState(syncId, false);
      character.groupMemberships = groupIds;
      character.handleGroupDataSyncState(syncId, true);
      this.characterAgent.emit('CharacterGroupSyncFinished', character);
   };

   this.givenCharacterStartedGroupSync = function(charId, syncId)
   {
      this.broadcastGroupSyncState(charId, syncId, false);
   };

   this.whenCharacterFinishedGroupSync = function(charId, syncId, groupIds)
   {
      var character = this.characterAgent.characters[charId];

      character.groupMemberships = groupIds;
      this.broadcastGroupSyncState(charId, syncId, true);
   };

   this.broadcastGroupSyncState = function(charId, syncId, finished)
   {
      var header =
      {
         type: busMessages.Broadcasts.CharacterGroupDataSyncState.name,
      };
      var body =
      {
         characterId: charId,
         syncId: syncId,
         finished: finished
      };

      this.amqp.broadcast(header, body);
   };

   this.whenCharacterJoinsGroup = function(charId, groupId)
   {
      var header =
      {
         type: busMessages.Broadcasts.GroupMembership.name
      };
      var body =
      {
         groupId: groupId,
         added:
         {
            members: [ charId ]
         }
      };

      this.broadcast(header, body);
   };

   this.whenCharacterLeavesGroup = function(charId, groupId)
   {
      var header =
      {
         type: busMessages.Broadcasts.GroupMembership.name
      };
      var body =
      {
         groupId: groupId,
         removed:
         {
            members: [ charId ]
         }
      };

      this.broadcast(header, body);
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

   this.thenTheLastBroadcastShouldHaveBeen = function(test, type, body, interest, disinterest)
   {
      var lastMessage = this.findLastBroadcastOfType(type);

      if (lastMessage)
      {
         if (interest)
         {
            test.deepEqual(lastMessage.header.interest, interest);
         }
         if (disinterest)
         {
            test.deepEqual(lastMessage.header.disinterest, disinterest);
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
