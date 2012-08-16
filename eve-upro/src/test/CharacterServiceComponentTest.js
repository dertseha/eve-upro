var EventEmitter = require('events').EventEmitter;
var util = require('util');

var UuidFactory = require("../util/UuidFactory.js");
var busMessages = require('../model/BusMessages.js');
var CharacterAgentComponent = require('../character-agent-component/CharacterAgentComponent.js');
var CharacterServiceComponent = require('../character-service-component/CharacterServiceComponent.js');

var AbstractServiceComponentFixture = require('./TestSupport/AbstractServiceComponentFixture.js');

function Fixture()
{
   Fixture.super_.call(this);

   this.characterService = new CharacterServiceComponent(
   {
      amqp: this.amqp,
      mongodb: this.mongodb,
      'character-agent': this.characterAgent
   });

   this.initCharacterServiceData = function(character)
   {
      this.characterService.onCharacterOnline(character);
   };

   this.givenCharacterHasActiveGalaxy = function(charId, galaxyId)
   {
      var serviceData = this.characterAgent.characters[charId].serviceData['character-service'];

      serviceData.rawData.activeGalaxyId = galaxyId;
   };

   this.givenCharacterHasIgbSessionWithControl = function(charId, sessionId, activeControl)
   {
      var serviceData = this.characterAgent.characters[charId].serviceData['character-service'];

      serviceData.igbSessions[sessionId] =
      {
         activeControl: activeControl
      };
   };

   this.expectingCharacterClientControlSelection = function(test, charId, activeSessionId)
   {
      this.amqp.broadcast = function(header, body)
      {
         if (header.type == busMessages.Broadcasts.CharacterClientControlSelection)
         {
            if (body.active)
            {
               test.deepEqual(header.interest, [
               {
                  scope: 'Session',
                  id: activeSessionId
               } ]);
            }
            else
            {
               test.deepEqual(header.interest, [
               {
                  scope: 'Character',
                  id: charId
               } ]);

            }
         }
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

   this.expectingCharacterIgnoredSolarSystems = function(test, charId, ignoredSolarSystems, interest)
   {
      this.amqp.broadcast = function(header, body)
      {
         if (header.type == busMessages.Broadcasts.CharacterIgnoredSolarSystems)
         {
            test.equal(body.ignoredSolarSystems, ignoredSolarSystems);
            if (interest)
            {
               test.deepEqual(header.interest, interest);
            }
         }
      };
   };

   this.whenBroadcastSetIgnoredSolarSystemIsReceived = function(sessionId, solarSystemId, ignore)
   {
      this.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestSetIgnoredSolarSystem, sessionId,
      {
         solarSystemId: solarSystemId,
         ignore: ignore
      });
   };
}
util.inherits(Fixture, AbstractServiceComponentFixture);

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

exports.testCharacterActiveGalaxyEmittedOnlyOnce_WhenRequestReceivedIdentical = function(test)
{
   var charId = 7788;
   var sessionId = UuidFactory.v4();
   var galaxyId = 3344;
   var broadcastBody =
   {
      galaxyId: galaxyId
   };

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterHasActiveGalaxy(charId, galaxyId);

   this.fixture.expectingCharacterActiveGalaxy(test, charId, galaxyId);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestSetActiveGalaxy, sessionId, broadcastBody);

   test.expect(0);
   test.done();
};

exports.testCharacterActiveGalaxyHasCharacterScope_WhenRequestReceived = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var galaxyId = 5678;

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterHasActiveGalaxy(charId, 8899);

   this.fixture.expectingBroadcastInterest(test, busMessages.Broadcasts.CharacterActiveGalaxy, [
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

   this.fixture.expectingBroadcastInterest(test, busMessages.Broadcasts.CharacterActiveGalaxy, [
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

   this.fixture.givenStorageReturnsDataDelayed('CharacterData', [
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

   this.fixture.givenStorageReturnsDataDelayed('CharacterData', [
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

   this.fixture.givenStorageReturnsDataDelayed('CharacterData', [
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

exports.testCharacterClientControlSelection_WhenFirstStatusMessageReceived = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();

   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.expectingCharacterClientControlSelection(test, charId, sessionId);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.EveStatusUpdateRequest, sessionId,
   {
      sessionId: sessionId
   });

   test.expect(2);
   test.done();
};

exports.testCharacterClientControlSelectionNotSentAgain_WhenStatusMessageReceivedAgain = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterHasIgbSessionWithControl(charId, sessionId, true);

   this.fixture.expectingCharacterClientControlSelection(test, charId, sessionId);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.EveStatusUpdateRequest, sessionId,
   {
      sessionId: sessionId
   });

   test.expect(0);
   test.done();
};

exports.testCharacterClientControlSelectionNotChanged_WhenStatusMessageReceivedFromSecond = function(test)
{
   var charId = 1234;
   var sessionId1 = UuidFactory.v4();
   var sessionId2 = UuidFactory.v4();

   this.fixture.givenExistingCharacterSessions(charId, [ sessionId1, sessionId2 ]);
   this.fixture.givenCharacterHasIgbSessionWithControl(charId, sessionId1, true);

   this.fixture.expectingCharacterClientControlSelection(test, charId, sessionId2);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.EveStatusUpdateRequest, sessionId2,
   {
      sessionId: sessionId2
   });

   test.expect(0);
   test.done();
};

exports.testCharacterClientControlSelectionChanged_WhenFirstDisconnected = function(test)
{
   var charId = 1234;
   var sessionId1 = UuidFactory.v4();
   var sessionId2 = UuidFactory.v4();

   this.fixture.givenExistingCharacterSessions(charId, [ sessionId1, sessionId2 ]);
   this.fixture.givenCharacterHasIgbSessionWithControl(charId, sessionId1, true);
   this.fixture.givenCharacterHasIgbSessionWithControl(charId, sessionId2, false);

   this.fixture.expectingCharacterClientControlSelection(test, charId, sessionId2);

   this.fixture.whenClientDisconnected(charId, sessionId1);

   test.expect(2);
   test.done();
};

exports.testCharacterIgnoredSolarSystemsAreDefault_WhenInitialLogin = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var ignoredSolarSystems = [ 30000142 ]; // Jita

   this.fixture.givenStorageReturnsDataDelayed('CharacterData', []);
   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.whenStorageReturnsData('CharacterData');

   test.expect(1);
   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, 'CharacterIgnoredSolarSystems',
   {
      ignoredSolarSystems: ignoredSolarSystems
   });

   test.done();
};

exports.testCharacterIgnoredSolarSystemsAreDefault_WhenStorageMissesEntry = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var ignoredSolarSystems = [ 30000142 ]; // Jita

   this.fixture.givenStorageReturnsDataDelayed('CharacterData', [ {} ]);
   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.whenStorageReturnsData('CharacterData');

   test.expect(1);
   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, 'CharacterIgnoredSolarSystems',
   {
      ignoredSolarSystems: ignoredSolarSystems
   });

   test.done();
};

exports.testCharacterIgnoredSolarSystemsAreReadFromStorage_WhenStorageReturns = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var ignoredSolarSystems = [ 123, 456, 789 ];

   this.fixture.givenStorageReturnsDataDelayed('CharacterData', [
   {
      id: charId,
      data:
      {
         ignoredSolarSystems: ignoredSolarSystems
      }
   } ]);
   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.whenStorageReturnsData('CharacterData');

   test.expect(1);
   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, 'CharacterIgnoredSolarSystems',
   {
      ignoredSolarSystems: ignoredSolarSystems
   });

   test.done();
};

exports.testCharacterIgnoredSolarSystemsSent_WhenDisabledGetsEnabled = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();

   this.fixture.givenStorageContainsData('CharacterData', [
   {
      id: charId,
      data:
      {
         ignoredSolarSystems: [ 123, 456, 789 ]
      }
   } ]);
   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.whenBroadcastSetIgnoredSolarSystemIsReceived(sessionId, 456, false);

   test.expect(1);
   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, 'CharacterIgnoredSolarSystems',
   {
      ignoredSolarSystems: [ 123, 789 ]
   });

   test.done();
};

exports.testCharacterIgnoredSolarSystemsSent_WhenEnabledGetsDisabled = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();

   this.fixture.givenStorageContainsData('CharacterData', [
   {
      id: charId,
      data:
      {
         ignoredSolarSystems: [ 456, 789 ]
      }
   } ]);
   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.whenBroadcastSetIgnoredSolarSystemIsReceived(sessionId, 123, true);

   test.expect(1);
   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, 'CharacterIgnoredSolarSystems',
   {
      ignoredSolarSystems: [ 456, 789, 123 ]
   });

   test.done();
};

exports.testCharacterIgnoredSolarSystemsSentWithModifiedData_WhenChangeRequestedBeforeStorageReturns = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();

   this.fixture.givenStorageReturnsDataDelayed('CharacterData', [
   {
      id: charId,
      data:
      {
         ignoredSolarSystems: [ 123 ]
      }
   } ]);
   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.whenBroadcastSetIgnoredSolarSystemIsReceived(sessionId, 456, true);
   this.fixture.whenStorageReturnsData('CharacterData');

   test.expect(1);
   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, 'CharacterIgnoredSolarSystems',
   {
      ignoredSolarSystems: [ 123, 456 ]
   });

   test.done();
};
