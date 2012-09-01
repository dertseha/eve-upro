var EventEmitter = require('events').EventEmitter;
var util = require('util');

var UuidFactory = require("../../util/UuidFactory.js");
var busMessages = require('../../model/BusMessages.js');
var CharacterAgentComponent = require('../../character-agent-component/CharacterAgentComponent.js');
var GroupServiceComponent = require('../../group-service-component/GroupServiceComponent.js');
var Group = require('../../group-service-component/Group.js');

var ActiveGroupDataProcessingState = require('../../group-service-component/ActiveGroupDataProcessingState.js');

var AbstractServiceComponentFixture = require('../TestSupport/AbstractServiceComponentFixture.js');

function Fixture()
{
   Fixture.super_.call(this);

   this.groupService = new GroupServiceComponent(
   {
      amqp: this.amqp,
      mongodb: this.mongodb,
      'character-agent': this.characterAgent
   }, Group);

   this.initCharacterServiceData = function(character)
   {
      this.groupService.onCharacterOnline(character);
   };

   this.givenExistingGroupWithMembers = function(id, name, members)
   {
      var group = new Group(id,
      {
         name: name,
         members: members
      });

      this.groupService.setGroupDataProcessingState(group.getId(), new ActiveGroupDataProcessingState(
            this.groupService, group));
   };

   this.givenGroupHasAdsForCharacters = function(id, characterIds)
   {
      var group = this.groupService.groupDataProcessingStatesById[id].group;

      group.adCharacter = characterIds;
   };

   this.givenGroupHasAdsForCorporations = function(id, corporationIds)
   {
      var group = this.groupService.groupDataProcessingStatesById[id].group;

      group.adCorporation = corporationIds;
   };

   this.givenExistingGroupWithMembersInDatabase = function(id, name, members)
   {
      var document =
      {
         _id: UuidFactory.toMongoId(id),
         data:
         {
            name: name,
            owner: [],
            members: members,
            adCharacter: [],
            adCorporation: []
         }
      };

      this.givenStorageReturnsDataDelayed(Group.CollectionName, [ document ]);
   };

   this.getExistingGroup = function()
   {
      var group = null;

      for ( var groupId in this.groupService.groupDataProcessingStatesById)
      {
         var state = this.groupService.groupDataProcessingStatesById[groupId];

         if (state instanceof ActiveGroupDataProcessingState)
         {
            group = state.group;
         }
      }

      return group;
   };

   this.whenBroadcastCreateGroupIsReceived = function(sessionId, name)
   {
      this.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestCreateGroup.name, sessionId,
      {
         name: name
      });
   };

   this.whenBroadcastDestroyGroupIsReceived = function(sessionId, groupId)
   {
      this.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestDestroyGroup.name, sessionId,
      {
         groupId: groupId
      });
   };

   this.whenBroadcastLeaveGroupIsReceived = function(sessionId, groupId)
   {
      this.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestLeaveGroup.name, sessionId,
      {
         groupId: groupId
      });
   };

   this.whenBroadcastJoinGroupIsReceived = function(sessionId, groupId)
   {
      this.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestJoinGroup.name, sessionId,
      {
         groupId: groupId
      });
   };

   this.whenBroadcastAdvertiseGroupIsReceived = function(sessionId, groupId, interest)
   {
      this.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestAdvertiseGroup.name, sessionId,
      {
         groupId: groupId,
         interest: interest
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
      fixture.groupService.once('started', callback);
      fixture.groupService.start();
   });
   this.fixture.characterAgent.start();
};

exports.testGroupMembershipEmitted_WhenCreateGroupRequested = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var groupName = 'TestGroup';
   var groupId = null;

   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.whenBroadcastCreateGroupIsReceived(sessionId, groupName);

   groupId = this.fixture.getExistingGroup().getId();
   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupMembership.name,
   {
      groupId: groupId,
      added:
      {
         groupData:
         {
            name: groupName,
            owner: [ charId ]
         },
         members: [ charId ]
      }
   });

   test.expect(1);
   test.done();
};

exports.testGroupMembershipEmitted_WhenLeaveGroupRequested = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var groupName = 'TestGroup';
   var groupId = UuidFactory.v4();

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenExistingGroupWithMembers(groupId, groupName, [ charId ]);

   this.fixture.whenBroadcastLeaveGroupIsReceived(sessionId, groupId);

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupMembership.name,
   {
      groupId: groupId,
      removed:
      {
         members: [ charId ]
      }
   });

   test.expect(1);
   test.done();
};

exports.testGroupMembershipEmitted_WhenLeaveGroupRequestedOnLoadedData = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var groupName = 'TestGroup';
   var groupId = UuidFactory.v4();

   this.fixture.givenExistingGroupWithMembersInDatabase(groupId, groupName, [ charId ]);
   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.whenBroadcastLeaveGroupIsReceived(sessionId, groupId);

   this.fixture.whenStorageReturnsData(Group.CollectionName); // the ID member query
   this.fixture.whenStorageReturnsData(Group.CollectionName); // the ID ad query
   this.fixture.whenStorageReturnsData(Group.CollectionName); // the data query

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupMembership.name,
   {
      groupId: groupId,
      removed:
      {
         members: [ charId ]
      }
   });

   test.expect(1);
   test.done();
};

exports.testGroupMembershipEmitted_WhenJoinGroupRequestedWithCharAdvert = function(test)
{
   var charId = 5678;
   var sessionId = UuidFactory.v4();
   var groupName = 'TestGroup';
   var groupId = UuidFactory.v4();

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenExistingGroupWithMembers(groupId, groupName, [ 1234 ]);
   this.fixture.givenGroupHasAdsForCharacters(groupId, [ charId ]);

   this.fixture.whenBroadcastJoinGroupIsReceived(sessionId, groupId);

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupMembership.name,
   {
      groupId: groupId,
      added:
      {
         groupData:
         {
            name: groupName,
            owner: []
         },
         members: [ charId ]
      }
   });

   test.expect(1);
   test.done();
};

exports.testGroupMembershipEmitted_WhenJoinGroupRequestedWithCorpAdvert = function(test)
{
   var charId = 5678;
   var corpId = 10000;
   var sessionId = UuidFactory.v4();
   var groupName = 'TestGroup';
   var groupId = UuidFactory.v4();

   this.fixture.givenExistingCharacterSession(charId, sessionId, corpId);
   this.fixture.givenExistingGroupWithMembers(groupId, groupName, [ 1234 ]);
   this.fixture.givenGroupHasAdsForCorporations(groupId, [ corpId ]);

   this.fixture.whenBroadcastJoinGroupIsReceived(sessionId, groupId);

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupMembership.name,
   {
      groupId: groupId,
      added:
      {
         groupData:
         {
            name: groupName,
            owner: []
         },
         members: [ charId ]
      }
   });

   test.expect(1);
   test.done();
};

exports.testGroupAdvertisementEmitted_WhenAdvertisementRequestedForChar = function(test)
{
   var charId = 1234;
   var newCharId = 5678;
   var sessionId = UuidFactory.v4();
   var groupName = 'TestGroup';
   var groupId = UuidFactory.v4();

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenExistingGroupWithMembers(groupId, groupName, [ 1234 ]);

   this.fixture.whenBroadcastAdvertiseGroupIsReceived(sessionId, groupId, [
   {
      scope: 'Character',
      id: newCharId
   } ]);

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupAdvertisement.name,
   {
      groupId: groupId,
      groupData:
      {
         name: groupName,
         owner: []
      }
   }, [
   {
      scope: 'Character',
      id: newCharId
   } ]);

   test.expect(2);
   test.done();
};

exports.testGroupAdvertisementEmitted_WhenSessionEstablishedWithAdOfExistingGroup = function(test)
{
   var newCharId = 5678;
   var sessionId = UuidFactory.v4();
   var responseQueue = 'queue';
   var groupName = 'TestGroup';
   var groupId = UuidFactory.v4();

   this.fixture.givenExistingGroupWithMembers(groupId, groupName, [ 1234 ]);
   this.fixture.givenGroupHasAdsForCharacters(groupId, [ newCharId ]);

   this.fixture.whenClientConnected(newCharId, sessionId, responseQueue);

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupAdvertisement.name,
   {
      groupId: groupId,
      groupData:
      {
         name: groupName,
         owner: []
      }
   }, [
   {
      scope: 'Session',
      id: sessionId
   } ]);

   test.expect(2);
   test.done();
};

exports.testGroupMembershipEmitted_WhenSessionEstablishedAsMemberOfExistingGroup = function(test)
{
   var charId = 5566;
   var sessionId = UuidFactory.v4();
   var responseQueue = 'queue';
   var groupName = 'TestGroup';
   var groupId = UuidFactory.v4();

   this.fixture.givenExistingGroupWithMembers(groupId, groupName, [ charId, 1122, 3344 ]);

   this.fixture.whenClientConnected(charId, sessionId, responseQueue);

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupMembership.name,
   {
      groupId: groupId,
      added:
      {
         groupData:
         {
            name: groupName,
            owner: []
         },
         members: [ charId, 1122, 3344 ]
      }
   }, [
   {
      scope: 'Session',
      id: sessionId
   } ]);

   test.expect(2);
   test.done();
};

exports.testGroupMembershipEmitted_WhenCharacterOnlineAsMemberOfLoadedGroup = function(test)
{
   var charId = 5566;
   var sessionId = UuidFactory.v4();
   var groupName = 'TestGroup';
   var groupId = UuidFactory.v4();

   this.fixture.givenExistingGroupWithMembersInDatabase(groupId, groupName, [ charId ]);
   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.whenStorageReturnsData(Group.CollectionName); // the ID member query
   this.fixture.whenStorageReturnsData(Group.CollectionName); // the ID ad query
   this.fixture.whenStorageReturnsData(Group.CollectionName); // the data query

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupMembership.name,
   {
      groupId: groupId,
      added:
      {
         groupData:
         {
            name: groupName,
            owner: []
         },
         members: [ charId ]
      }
   }, [
   {
      scope: 'Group',
      id: groupId
   } ]);

   test.expect(2);
   test.done();
};

exports.testGroupMembershipEmitted_WhenDestroyGroupRequested = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var groupName = 'TestGroup';
   var groupId = UuidFactory.v4();

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenExistingGroupWithMembers(groupId, groupName, [ 1234, 5678 ]);

   this.fixture.whenBroadcastDestroyGroupIsReceived(sessionId, groupId);

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupMembership.name,
   {
      groupId: groupId,
      removed:
      {
         members: [ 1234, 5678 ]
      }
   });

   test.expect(1);
   test.done();
};
