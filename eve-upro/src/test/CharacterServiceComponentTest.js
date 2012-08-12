var EventEmitter = require('events').EventEmitter;

var UuidFactory = require("../util/UuidFactory.js");
var CharacterAgentComponent = require('../character-agent-component/CharacterAgentComponent.js');
var CharacterServiceComponent = require('../character-service-component/CharacterServiceComponent.js');
var Character = require('../character-agent-component/Character.js');

var ActiveCharacterServiceDataState = require('../character-service-component/ActiveCharacterServiceDataState.js');

var busMessages = require('../model/BusMessages.js');

function Fixture()
{
   this.amqp = new EventEmitter();
   this.mongodb = new function()
   {
      this.defineCollection = function(name, indexDef, callback)
      {
         callback();
      };
      this.getData = function(collectionName, filter, callback)
      {
         callback(null, null, null);
      };
      this.setData = function(collectionName, id, data, callback)
      {
         callback(null);
      };
   };
   this.characterAgent = new CharacterAgentComponent(
   {
      amqp: this.amqp
   });

   this.characterService = new CharacterServiceComponent(
   {
      amqp: this.amqp,
      mongodb: this.mongodb,
      'character-agent': this.characterAgent
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
      character.serviceData['character-service'] = new ActiveCharacterServiceDataState(character, this.characterService);// this.characterService.getServiceDataInit();
      sessionIds.forEach(function(sessionId)
      {
         self.characterAgent.charactersBySession[sessionId] = character;
         character.addClientSession(sessionId);
      });
   };

   this.givenCharacterHasActiveGalaxy = function(charId, galaxyId)
   {
      var serviceData = this.characterAgent.characters[charId].serviceData['character-service'];

      serviceData.activeGalaxyId = galaxyId;
   };

   this.givenStorageContainsData = function(documents)
   {
      this.mongodb.getData = function(collectionName, filter, callback)
      {
         documents.forEach(function(document)
         {
            callback(null, document.id, document.data);
         });
         callback(null, null, null);
      };
   };

   this.givenStorageReturnsDataDelayed = function(documents, emitter)
   {
      this.mongodb.getData = function(collectionName, filter, callback)
      {
         emitter.on('event', function()
         {
            documents.forEach(function(document)
            {
               callback(null, document.id, document.data);
            });
            callback(null, null, null);
         });
      };
   };

   this.expectingCharacterActiveGalaxy = function(test, charId, galaxyId, interest)
   {
      this.amqp.broadcast = function(header, body)
      {
         if (header.type == busMessages.Broadcasts.CharacterActiveGalaxy)
         {
            test.equal(body.galaxyId, galaxyId);
            if (interest)
            {
               test.deepEqual(header.interest, interest);
            }
         }
      };
   };

   this.expectingCharacterActiveGalaxyScope = function(test, expectedInterest)
   {
      this.amqp.broadcast = function(header, body)
      {
         if (header.type && (header.type == busMessages.Broadcasts.CharacterActiveGalaxy))
         {
            test.deepEqual(header.interest, expectedInterest);
         }
      };
   };

   this.whenBroadcastReceived = function(type, sessionId, body)
   {
      var header =
      {
         type: type,
         sessionId: sessionId
      };

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
}

exports.setUp = function(callback)
{
   var fixture = new Fixture();

   this.fixture = fixture;

   this.fixture.characterAgent.once('started', function()
   {
      fixture.characterService.once('started', callback);
      fixture.characterService.start();
   });
   this.fixture.characterAgent.start();
};

exports.testCharacterActiveGalaxyEmitted_WhenActiveGalaxyRequested = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var galaxyId = 5678;

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterHasActiveGalaxy(charId, 2233);

   this.fixture.expectingCharacterActiveGalaxy(test, charId, galaxyId);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestSetActiveGalaxy, sessionId,
   {
      galaxyId: galaxyId
   });

   test.expect(1);
   test.done();
};

exports.testCharacterActiveGalaxyEmittedOnlyOnce_WhenRequestReceivedTwiceIdentical = function(test)
{
   var charId = 7788;
   var sessionId = UuidFactory.v4();
   var galaxyId = 3344;
   var broadcastBody =
   {
      galaxyId: galaxyId
   };

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterHasActiveGalaxy(charId, 5566);

   this.fixture.expectingCharacterActiveGalaxy(test, charId, galaxyId);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestSetActiveGalaxy, sessionId, broadcastBody);
   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestSetActiveGalaxy, sessionId, broadcastBody);

   test.expect(1);
   test.done();
};

exports.testCharacterActiveGalaxyHasCharacterScope_WhenRequestReceived = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var galaxyId = 5678;

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterHasActiveGalaxy(charId, 8899);

   this.fixture.expectingCharacterActiveGalaxyScope(test, [
   {
      scope: 'Character',
      id: charId
   } ]);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestSetActiveGalaxy, sessionId,
   {
      galaxyId: galaxyId
   });

   test.expect(1);
   test.done();
};

exports.testCharacterActiveGalaxyHasSessionScope_WhenSecondSessionEstablished = function(test)
{
   var charId = 1234;
   var sessionIdExisting = UuidFactory.v4();
   var sessionId = UuidFactory.v4();

   this.fixture.givenExistingCharacterSession(charId, sessionIdExisting);
   this.fixture.givenCharacterHasActiveGalaxy(charId, 8899);

   this.fixture.expectingCharacterActiveGalaxyScope(test, [
   {
      scope: 'Session',
      id: sessionId
   } ]);

   this.fixture.whenClientConnected(charId, sessionId);

   test.expect(1);
   test.done();
};

exports.testCharacterActiveGalaxySentDefault_WhenNoDataStored = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var emitter = new EventEmitter();

   this.fixture.givenStorageReturnsDataDelayed([
   {
      id: null,
      data: null
   } ], emitter);

   this.fixture.expectingCharacterActiveGalaxy(test, charId, 9);

   this.fixture.whenClientConnected(charId, sessionId);
   emitter.emit('event');

   test.expect(1);
   test.done();
};

exports.testCharacterActiveGalaxyEmitted_WhenDataReturnedFromStorage = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var galaxyId = 5678;
   var emitter = new EventEmitter();

   this.fixture.givenStorageReturnsDataDelayed([
   {
      id: charId,
      data:
      {
         activeGalaxyId: galaxyId
      }
   } ], emitter);

   this.fixture.expectingCharacterActiveGalaxy(test, charId, galaxyId);

   this.fixture.whenClientConnected(charId, sessionId);
   emitter.emit('event');

   test.expect(1);
   test.done();
};

exports.testCharacterActiveGalaxyEmittedWithNewData_WhenRequestsWereReceivedBeforeStorage = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var storedGalaxyId = 5678;
   var newGalaxyId = 1233;
   var emitter = new EventEmitter();

   this.fixture.givenStorageReturnsDataDelayed([
   {
      id: charId,
      data:
      {
         activeGalaxyId: storedGalaxyId
      }
   } ], emitter);

   this.fixture.expectingCharacterActiveGalaxy(test, charId, newGalaxyId);

   this.fixture.whenClientConnected(charId, sessionId);
   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestSetActiveGalaxy, sessionId,
   {
      galaxyId: newGalaxyId
   });
   emitter.emit('event');

   test.expect(1);
   test.done();
};
