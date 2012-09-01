var EventEmitter = require('events').EventEmitter;
var util = require('util');

var UuidFactory = require("../util/UuidFactory.js");
var busMessages = require('../model/BusMessages.js');
var CharacterAgentComponent = require('../character-agent-component/CharacterAgentComponent.js');
var LocationServiceComponent = require('../location-service-component/LocationServiceComponent.js');

var AbstractServiceComponentFixture = require('./TestSupport/AbstractServiceComponentFixture.js');

function Fixture()
{
   Fixture.super_.call(this);

   this.locationService = new LocationServiceComponent(
   {
      amqp: this.amqp,
      'character-agent': this.characterAgent
   });

   this.initCharacterServiceData = function(character)
   {
      character.lastKnownLocation = null;
      character.locationsBySessionId = {};
   };

   this.givenCharacterIsAt = function(charId, solarSystemId, notifyingSessions)
   {
      var character = this.characterAgent.getCharacterById(charId);

      character.lastKnownLocation = solarSystemId;
      notifyingSessions.forEach(function(sessionId)
      {
         character.locationsBySessionId[sessionId] = solarSystemId;
      });
   };

   this.expectingCharacterLocationStatus = function(test, charId, solarSystemId, interest)
   {
      this.amqp.broadcast = function(header, body)
      {
         if (header.type == busMessages.Broadcasts.CharacterLocationStatus.name)
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

}
util.inherits(Fixture, AbstractServiceComponentFixture);

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

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.EveStatusUpdateRequest.name, sessionId,
   {
      eveInfo:
      {
         solarSystemId: solarSystemId
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
      eveInfo:
      {
         solarSystemId: solarSystemId
      }
   };

   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.expectingCharacterLocationStatus(test, charId, solarSystemId);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.EveStatusUpdateRequest.name, sessionId, broadcastBody);
   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.EveStatusUpdateRequest.name, sessionId, broadcastBody);

   test.expect(2);
   test.done();
};

exports.testCharacterLocationStatusHasCharacterScope_WhenEveStatusReceived = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var solarSystemId = 5678;

   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.expectingBroadcastInterest(test, busMessages.Broadcasts.CharacterLocationStatus.name, [
   {
      scope: 'Character',
      id: charId
   } ]);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.EveStatusUpdateRequest.name, sessionId,
   {
      eveInfo:
      {
         solarSystemId: solarSystemId
      }
   });

   test.expect(1);
   test.done();
};

exports.testCharacterLocationStatusHasSessionScope_WhenSecondSessionEstablished = function(test)
{
   var charId = 1234;
   var sessionIdExisting = UuidFactory.v4();
   var sessionId = UuidFactory.v4();
   var solarSystemId = 5678;

   this.fixture.givenExistingCharacterSession(charId, sessionIdExisting);
   this.fixture.givenCharacterIsAt(charId, solarSystemId, [ sessionIdExisting ]);

   this.fixture.expectingBroadcastInterest(test, busMessages.Broadcasts.CharacterLocationStatus.name, [
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

   this.fixture.expectingBroadcastInterest(test, busMessages.Broadcasts.CharacterLocationStatus.name, [
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
   this.fixture.givenCharacterIsAt(charIdA, solarSystemId, [ sessionIdA ]);

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
   this.fixture.givenCharacterIsAt(charId, solarSystemId, [ sessionId ]);

   this.fixture.expectingCharacterLocationStatus(test, charId, undefined);

   this.fixture.whenClientDisconnected(charId, sessionId);

   test.expect(2);
   test.done();
};

exports.testCharacterLocationStatusEmittedWithUnknownLocation_WhenLastNotifyingSessionGone = function(test)
{
   var charId = 2244;
   var sessionIdA = UuidFactory.v4();
   var sessionIdB = UuidFactory.v4();
   var solarSystemId = 1122;

   this.fixture.givenExistingCharacterSessions(charId, [ sessionIdA, sessionIdB ]);
   this.fixture.givenCharacterIsAt(charId, solarSystemId, [ sessionIdA ]);

   this.fixture.expectingCharacterLocationStatus(test, charId, undefined);

   this.fixture.whenClientDisconnected(charId, sessionIdA);

   test.expect(2);
   test.done();
};
