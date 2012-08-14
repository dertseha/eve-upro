var EventEmitter = require('events').EventEmitter;
var util = require('util');

var UuidFactory = require("../util/UuidFactory.js");
var busMessages = require('../model/BusMessages.js');
var CharacterAgentComponent = require('../character-agent-component/CharacterAgentComponent.js');
var CharacterServiceComponent = require('../character-service-component/CharacterServiceComponent.js');

var ActiveCharacterServiceDataState = require('../character-service-component/ActiveCharacterServiceDataState.js');

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
      character.serviceData['character-service'] = new ActiveCharacterServiceDataState(character, this.characterService);
   };

   this.givenCharacterHasActiveGalaxy = function(charId, galaxyId)
   {
      var serviceData = this.characterAgent.characters[charId].serviceData['character-service'];

      serviceData.rawData.activeGalaxyId = galaxyId;
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
