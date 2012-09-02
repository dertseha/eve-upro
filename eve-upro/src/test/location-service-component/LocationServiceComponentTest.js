var EventEmitter = require('events').EventEmitter;
var util = require('util');

var UuidFactory = require("../../util/UuidFactory.js");
var busMessages = require('../../model/BusMessages.js');
var CharacterAgentComponent = require('../../character-agent-component/CharacterAgentComponent.js');
var LocationServiceComponent = require('../../location-service-component/LocationServiceComponent.js');

var LocationStatusGroup = require('../../location-service-component/LocationStatusGroup.js');
var ActiveLocationStatusGroupState = require('../../location-service-component/ActiveLocationStatusGroupState.js');

var AbstractServiceComponentFixture = require('../TestSupport/AbstractServiceComponentFixture.js');

function Fixture()
{
   Fixture.super_.call(this);

   this.locationService = new LocationServiceComponent(
   {
      amqp: this.amqp,
      mongodb: this.mongodb,
      'character-agent': this.characterAgent
   });

   this.initCharacterServiceData = function(character)
   {
      this.locationService.onCharacterOnline(character);
   };

   this.givenCharacterIsAt = function(charId, solarSystemId, notifyingSessions)
   {
      var character = this.characterAgent.getCharacterById(charId);
      var serviceData = character.serviceData['location-service'];

      serviceData.lastKnownLocation = solarSystemId;
      notifyingSessions.forEach(function(sessionId)
      {
         serviceData.locationsBySessionId[sessionId] = solarSystemId;
      });
   };

   this.givenCharacterHasActiveLocationStatusGroup = function(charId, groupId, sendLocation, displayLocation)
   {
      var character = this.characterAgent.getCharacterById(charId);
      var serviceData = character.serviceData['location-service'];
      var group = LocationStatusGroup.create(charId, groupId);
      var state = new ActiveLocationStatusGroupState(this.locationService, character, group);

      group.updateSendLocation(sendLocation);
      group.updateDisplayLocation(displayLocation);
      serviceData.groupStatesById[groupId] = state;
   };

   this.givenExistingLocationStatusGroupInDatabase = function(charId, groupId, sendLocation, displayLocation)
   {
      var document =
      {
         _id: UuidFactory.toMongoId(LocationStatusGroup.getDocumentId(charId, groupId)),
         data:
         {
            characterId: charId,
            groupId: groupId,
            sendLocation: sendLocation,
            displayLocation: displayLocation
         }
      };

      this.givenStorageReturnsDataDelayed(LocationStatusGroup.CollectionName, [ document ]);
   };

   this.expectingCharacterLocationStatus = function(test, charId, solarSystemId, interest, disinterest)
   {
      var prev = this.amqp.broadcast;

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
            if (disinterest)
            {
               test.deepEqual(header.disinterest, disinterest);
            }
         }
         else
         {
            prev(header, body);
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

exports.testSettingsEmittedWithDefaults_WhenNewGroupJoined = function(test)
{
   var charId = 2244;
   var groupId = UuidFactory.v4();
   var sessionId = UuidFactory.v4();

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterIsMemberOfGroups(charId, []);

   this.fixture.whenCharacterJoinsGroup(charId, groupId);

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test,
         busMessages.Broadcasts.CharacterLocationStatusGroupSettings.name,
         {
            groupId: groupId,
            sendLocation: false,
            displayLocation: false
         }, [
         {
            scope: 'Character',
            id: charId
         } ]);

   test.expect(2);
   test.done();
};

exports.testLocationStatusNotEmittedForNewGroup_WhenNewGroupJoined = function(test)
{
   var charId = 5645;
   var groupId = UuidFactory.v4();
   var sessionId = UuidFactory.v4();
   var solarSystemId = 1234;

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterIsMemberOfGroups(charId, []);
   this.fixture.givenCharacterIsAt(charId, solarSystemId, [ sessionId ]);

   this.fixture.expectingCharacterLocationStatus(test, charId, solarSystemId, [
   {
      scope: 'Group',
      id: groupId
   } ]);

   this.fixture.whenCharacterJoinsGroup(charId, groupId);

   test.expect(0);
   test.done();
};

exports.testLocationStatusEmittedForGroup_WhenGettingOnlineWithExistingGroup = function(test)
{
   var charId = 5645;
   var groupId = UuidFactory.v4();
   var sessionId = UuidFactory.v4();
   var solarSystemId = 5656;

   this.fixture.givenExistingLocationStatusGroupInDatabase(charId, groupId, true, true);
   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterIsMemberOfGroups(charId, [ groupId ]);
   this.fixture.givenCharacterIsAt(charId, solarSystemId, [ sessionId ]);

   this.fixture.expectingCharacterLocationStatus(test, charId, solarSystemId, [
   {
      scope: 'Group',
      id: groupId
   } ]);

   this.fixture.whenStorageReturnsData(LocationStatusGroup.CollectionName); // ID query
   this.fixture.whenStorageReturnsData(LocationStatusGroup.CollectionName); // data query

   test.expect(3);
   test.done();
};

exports.testLocationStatusNotEmittedForGroup_WhenGettingOnlineWithExistingGroupNotMember = function(test)
{
   var charId = 5645;
   var groupId = UuidFactory.v4();
   var sessionId = UuidFactory.v4();

   this.fixture.givenExistingLocationStatusGroupInDatabase(charId, groupId, true, true);
   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterIsMemberOfGroups(charId, []);

   this.fixture.expectingCharacterLocationStatus(test, charId, undefined, [
   {
      scope: 'Group',
      id: groupId
   } ]);

   this.fixture.whenStorageReturnsData(LocationStatusGroup.CollectionName); // ID query
   this.fixture.whenStorageReturnsData(LocationStatusGroup.CollectionName); // data query

   test.expect(0);
   test.done();
};

exports.testLocationStatusEmittedForGroup_WhenGettingOnlineWithExistingGroupDelayedSync = function(test)
{
   var charId = 5645;
   var groupId = UuidFactory.v4();
   var sessionId = UuidFactory.v4();
   var syncId = UuidFactory.v4();
   var solarSystemId = 2345;

   this.fixture.givenExistingLocationStatusGroupInDatabase(charId, groupId, true, true);
   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterStartedGroupSync(charId, syncId);
   this.fixture.givenCharacterIsAt(charId, solarSystemId, [ sessionId ]);

   this.fixture.expectingCharacterLocationStatus(test, charId, solarSystemId, [
   {
      scope: 'Group',
      id: groupId
   } ]);

   this.fixture.whenStorageReturnsData(LocationStatusGroup.CollectionName); // ID query
   this.fixture.whenStorageReturnsData(LocationStatusGroup.CollectionName); // data query

   this.fixture.whenCharacterFinishedGroupSync(charId, syncId, [ groupId ]);

   test.expect(3);
   test.done();
};

exports.testLocationStatusUndefinedEmittedForGroup_WhenLeavingGroup = function(test)
{
   var charId = 5645;
   var groupIdA = UuidFactory.v4();
   var groupIdB = UuidFactory.v4();
   var sessionId = UuidFactory.v4();
   var solarSystemId = 2345;

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterIsMemberOfGroups(charId, [ groupIdA, groupIdB ]);
   this.fixture.givenCharacterIsAt(charId, solarSystemId, [ sessionId ]);
   this.fixture.givenCharacterHasActiveLocationStatusGroup(charId, groupIdA, true, true);
   this.fixture.givenCharacterHasActiveLocationStatusGroup(charId, groupIdB, true, true);

   this.fixture.expectingCharacterLocationStatus(test, charId, undefined, [
   {
      scope: 'Group',
      id: groupIdA
   } ], [
   {
      scope: 'Character',
      id: charId
   },
   {
      scope: 'Group',
      id: groupIdB
   } ]);

   this.fixture.whenCharacterLeavesGroup(charId, groupIdA);

   test.expect(4);
   test.done();
};

exports.testLocationStatusEmittedForSecondCharacter_WhenJoiningDistributedGroup = function(test)
{
   var charIdA = 8475;
   var charIdB = 2345;
   var groupId = UuidFactory.v4();
   var sessionIdA = UuidFactory.v4();
   var sessionIdB = UuidFactory.v4();
   var solarSystemId = 1234;

   this.fixture.givenExistingCharacterSession(charIdA, sessionIdA);
   this.fixture.givenExistingCharacterSession(charIdB, sessionIdB);
   this.fixture.givenCharacterIsMemberOfGroups(charIdA, [ groupId ]);
   this.fixture.givenCharacterHasActiveLocationStatusGroup(charIdA, groupId, true, true);
   this.fixture.givenCharacterIsAt(charIdA, solarSystemId, [ sessionIdA ]);

   this.fixture.expectingCharacterLocationStatus(test, charIdA, solarSystemId, [
   {
      scope: 'Character',
      id: charIdB
   } ]);

   this.fixture.whenCharacterJoinsGroup(charIdB, groupId);

   test.expect(3);
   test.done();
};

exports.testLocationStatusEmittedForSecondCharacter_WhenSessionEstablishedInGroup = function(test)
{
   var charIdA = 8475;
   var charIdB = 2345;
   var groupId = UuidFactory.v4();
   var sessionIdA = UuidFactory.v4();
   var sessionIdB1 = UuidFactory.v4();
   var sessionIdB2 = UuidFactory.v4();
   var solarSystemId = 67876;

   this.fixture.givenExistingCharacterSession(charIdA, sessionIdA);
   this.fixture.givenExistingCharacterSession(charIdB, sessionIdB1);
   this.fixture.givenCharacterIsMemberOfGroups(charIdA, [ groupId ]);
   this.fixture.givenCharacterIsMemberOfGroups(charIdB, [ groupId ]);
   this.fixture.givenCharacterHasActiveLocationStatusGroup(charIdA, groupId, true, true);
   this.fixture.givenCharacterHasActiveLocationStatusGroup(charIdB, groupId, true, true);
   this.fixture.givenCharacterIsAt(charIdA, solarSystemId, [ sessionIdA ]);

   this.fixture.expectingCharacterLocationStatus(test, charIdA, solarSystemId, [
   {
      scope: 'Session',
      id: sessionIdB2
   } ]);

   this.fixture.whenClientConnected(charIdB, sessionIdB2);

   test.expect(3);
   test.done();
};

exports.testLocationStatusUndefinedEmittedForSecondCharacter_WhenLeavingDistributedGroup = function(test)
{
   var charIdA = 34536;
   var charIdB = 68679;
   var groupId = UuidFactory.v4();
   var sessionIdA = UuidFactory.v4();
   var sessionIdB = UuidFactory.v4();
   var solarSystemId = 2379;

   this.fixture.givenExistingCharacterSession(charIdA, sessionIdA);
   this.fixture.givenExistingCharacterSession(charIdB, sessionIdB);
   this.fixture.givenCharacterIsMemberOfGroups(charIdA, [ groupId ]);
   this.fixture.givenCharacterIsMemberOfGroups(charIdB, [ groupId ]);
   this.fixture.givenCharacterHasActiveLocationStatusGroup(charIdA, groupId, true, true);
   this.fixture.givenCharacterHasActiveLocationStatusGroup(charIdB, groupId, false, false);
   this.fixture.givenCharacterIsAt(charIdA, solarSystemId, [ sessionIdA ]);

   this.fixture.expectingCharacterLocationStatus(test, charIdA, undefined, [
   {
      scope: 'Character',
      id: charIdB
   } ]);

   this.fixture.whenCharacterLeavesGroup(charIdB, groupId);

   test.expect(3);
   test.done();
};
