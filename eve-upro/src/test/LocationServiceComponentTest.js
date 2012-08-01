var EventEmitter = require('events').EventEmitter;

var UuidFactory = require("../util/UuidFactory.js");
var CharacterAgentComponent = require('../character-agent-component/CharacterAgentComponent.js');
var LocationServiceComponent = require('../location-service-component/LocationServiceComponent.js');
var Character = require('../character-agent-component/Character.js');

var busMessages = require('../model/BusMessages.js');

function Fixture()
{
   this.amqp = new EventEmitter();
   this.characterAgent = new CharacterAgentComponent(
   {
      amqp: this.amqp
   });

   this.locationService = new LocationServiceComponent(
   {
      amqp: this.amqp,
      'character-agent': this.characterAgent
   });

   this.givenExistingCharacterSession = function(charId, sessionId)
   {
      var character = new Character(charId, 'name');

      this.characterAgent.characters[charId] = character;
      this.characterAgent.charactersBySession[sessionId] = character;
      character.addClientSession(sessionId);
   };

   this.givenCharacterIsAt = function(charId, solarSystemId)
   {
      var character = this.characterAgent.getCharacterById(charId);

      character.lastKnownLocation = solarSystemId;
   };

   this.expectingCharacterLocationStatus = function(test, charId, solarSystemId, interest)
   {
      this.amqp.broadcast = function(header, body)
      {
         if (header.type == busMessages.Broadcasts.CharacterLocationStatus)
         {
            test.equal(body.characterInfo.characterId, charId);
            test.equal(body.solarSystemId, solarSystemId);
            if (interest)
            {
               test.deepEqual(header.interest, interest);
            }
         }
      };
   };

   this.expectingCharacterLocationStatusScope = function(test, expectedInterest)
   {
      this.amqp.broadcast = function(header, body)
      {
         if (header.type == busMessages.Broadcasts.CharacterLocationStatus)
         {
            test.deepEqual(header.interest, expectedInterest);
         }
      };
   };

   this.whenBroadcastReceived = function(type, body)
   {
      var header =
      {
         type: type
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
      fixture.locationService.once('started', callback);
      fixture.locationService.start();
   });
   this.fixture.characterAgent.start();
};

exports.testCharacterLocationStatusEmitted_WhenEveStatusReceived = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var solarSystemId = 5678;

   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.expectingCharacterLocationStatus(test, charId, solarSystemId);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.EveStatusUpdateRequest,
   {
      sessionId: sessionId,
      eveInfo:
      {
         solarsystemId: solarSystemId
      }
   });

   test.expect(2);
   test.done();
};

exports.testCharacterLocationStatusEmittedOnlyOnce_WhenEveStatusReceivedTwiceIdentical = function(test)
{
   var charId = 7788;
   var sessionId = UuidFactory.v4();
   var solarSystemId = 3344;
   var broadcastBody =
   {
      sessionId: sessionId,
      eveInfo:
      {
         solarsystemId: solarSystemId
      }
   };

   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.expectingCharacterLocationStatus(test, charId, solarSystemId);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.EveStatusUpdateRequest, broadcastBody);
   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.EveStatusUpdateRequest, broadcastBody);

   test.expect(2);
   test.done();
};

exports.testCharacterLocationStatusHasCharacterScope_WhenEveStatusReceived = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var solarSystemId = 5678;

   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.expectingCharacterLocationStatusScope(test, [
   {
      scope: 'Character',
      id: charId
   } ]);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.EveStatusUpdateRequest,
   {
      sessionId: sessionId,
      eveInfo:
      {
         solarsystemId: solarSystemId
      }
   });

   test.expect(1);
   test.done();
};

exports.testCharacterLocationStatusHasSessionScope_WhenSecondSessionEstablished = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var solarSystemId = 5678;

   this.fixture.givenExistingCharacterSession(charId, UuidFactory.v4());
   this.fixture.givenCharacterIsAt(charId, solarSystemId);

   this.fixture.expectingCharacterLocationStatusScope(test, [
   {
      scope: 'Session',
      id: sessionId
   } ]);

   this.fixture.whenClientConnected(charId, sessionId);

   test.expect(1);
   test.done();
};

exports.testCharacterLocationStatusNotSent_WhenFirstSessionEstablished = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();

   this.fixture.expectingCharacterLocationStatusScope(test, [
   {
      scope: 'Session',
      id: sessionId
   } ]);

   this.fixture.whenClientConnected(charId, sessionId);

   test.expect(0);
   test.done();
};

// TODO: This one is actually meant to be for interest changes
exports.testCharacterLocationStatusEmittedForExisting_WhenSessionEstablished = function(test)
{
   var charIdA = 1234;
   // var charIdB = 5678;
   var sessionIdA = UuidFactory.v4();
   var sessionIdB = UuidFactory.v4();
   var solarSystemId = 1133;

   this.fixture.givenExistingCharacterSession(charIdA, sessionIdA);
   this.fixture.givenCharacterIsAt(charIdA, solarSystemId);

   this.fixture.expectingCharacterLocationStatus(test, charIdA, solarSystemId, [
   {
      scope: 'Session',
      id: sessionIdB
   } ]);

   this.fixture.whenClientConnected(charIdA, sessionIdB);

   test.expect(3);
   test.done();
};

exports.testCharacterLocationStatusEmittedWithUnknownLocation_WhenOffline = function(test)
{
   var charId = 2244;
   var sessionId = UuidFactory.v4();
   var solarSystemId = 1122;

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterIsAt(charId, solarSystemId);

   this.fixture.expectingCharacterLocationStatus(test, charId, undefined);

   this.fixture.whenClientDisconnected(charId, sessionId);

   test.expect(2);
   test.done();
};
