var EventEmitter = require('events').EventEmitter;
var util = require('util');

var UuidFactory = require("../../util/UuidFactory.js");
var busMessages = require('../../model/BusMessages.js');
var CharacterAgentComponent = require('../../character-agent-component/CharacterAgentComponent.js');
var GroupServiceComponent = require('../../group-service-component/GroupServiceComponent.js');
var GroupDataObject = require('../../group-service-component/GroupDataObject.js');

var AbstractDataObject = require('../../abstract-sharing-component/AbstractDataObject.js');
var ActiveDataState = require('../../abstract-sharing-component/ActiveDataState.js');

var AbstractServiceComponentFixture = require('../TestSupport/AbstractServiceComponentFixture.js');

function Fixture()
{
   Fixture.super_.call(this);

   this.groupService = new GroupServiceComponent(
   {
      amqp: this.amqp,
      mongodb: this.mongodb,
      'character-agent': this.characterAgent
   });

   this.initCharacterServiceData = function(character)
   {
      this.groupService.onCharacterOnline(character);
   };

   this.givenExistingGroupWithMembers = function(id, name, members)
   {
      var initData =
      {
         owner: AbstractDataObject.createMemberList({}),
         shares: AbstractDataObject.createMemberList({}),
         group:
         {
            name: name
         },
         members: members
      };
      var group = new GroupDataObject(id, initData);

      this.groupService.setDataState(group.getDocumentId(), this.groupService.getDataStateFactory()
            .createActiveDataState(group));
   };

   this.givenGroupHasOwner = function(id, scope, ids)
   {
      var group = this.groupService.dataStatesById[id].dataObject;

      group.owner['list' + scope] = ids;
   };

   this.givenGroupHasAdsForCharacters = function(id, characterIds)
   {
      var group = this.groupService.dataStatesById[id].dataObject;

      group.shares.listCharacter = characterIds;
   };

   this.givenGroupHasAdsForCorporations = function(id, corporationIds)
   {
      var group = this.groupService.dataStatesById[id].dataObject;

      group.shares.listCorporation = corporationIds;
   };

   this.givenExistingGroupWithMembersInDatabase = function(id, name, members)
   {
      var document =
      {
         _id: UuidFactory.toMongoId(id),
         data:
         {
            owner: AbstractDataObject.createMemberList({}),
            shares: AbstractDataObject.createMemberList(
            {
               listCharacter: members
            }),
            group:
            {
               name: name
            },
            members: members
         }
      };

      this.givenStorageReturnsDataDelayed(GroupDataObject.CollectionName, [ document ]);
   };

   this.getExistingGroup = function()
   {
      var group = null;

      this.groupService.forEachDataState(function(state)
      {
         if (state instanceof ActiveDataState)
         {
            group = state.dataObject;
         }
      });

      return group;
   };

   this.whenBroadcastCreateGroupIsReceived = function(sessionId, name)
   {
      this.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestCreateGroup.name, sessionId,
      {
         data:
         {
            name: name
         }
      });
   };

   this.whenBroadcastDestroyGroupIsReceived = function(sessionId, groupId)
   {
      this.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestDestroyGroup.name, sessionId,
      {
         id: groupId
      });
   };

   this.whenBroadcastLeaveGroupIsReceived = function(sessionId, groupId)
   {
      this.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestLeaveGroup.name, sessionId,
      {
         id: groupId
      });
   };

   this.whenBroadcastJoinGroupIsReceived = function(sessionId, groupId)
   {
      this.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestJoinGroup.name, sessionId,
      {
         id: groupId
      });
   };

   this.whenBroadcastAdvertiseGroupIsReceived = function(sessionId, groupId, interest)
   {
      this.whenBroadcastReceived(busMessages.Broadcasts.ClientRequestAddGroupShares.name, sessionId,
      {
         id: groupId,
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

   groupId = this.fixture.getExistingGroup().getDocumentId();
   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupMembership.name,
   {
      groupId: groupId,
      removed:
      {
         members: []
      },
      added:
      {
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
      },
      added:
      {
         members: []
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

   this.fixture.whenStorageReturnsData(GroupDataObject.CollectionName); // the ID member query
   this.fixture.whenStorageReturnsData(GroupDataObject.CollectionName); // the ID ad query
   this.fixture.whenStorageReturnsData(GroupDataObject.CollectionName); // the data query
   this.fixture.whenStorageReturnsData(GroupDataObject.CollectionName); // the data query

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupMembership.name,
   {
      groupId: groupId,
      removed:
      {
         members: [ charId ]
      },
      added:
      {
         members: []
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
         members: [ charId ]
      },
      removed:
      {
         members: []
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
         members: [ charId ]
      },
      removed:
      {
         members: []
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
   this.fixture.givenExistingGroupWithMembers(groupId, groupName, [ charId ]);
   this.fixture.givenGroupHasOwner(groupId, 'Character', [ charId ]);

   this.fixture.whenBroadcastAdvertiseGroupIsReceived(sessionId, groupId, [
   {
      scope: 'Character',
      id: newCharId
   } ]);

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupShares.name,
   {
      id: groupId,
      interest: [
      {
         scope: 'Character',
         id: newCharId
      } ]
   }, [
   {
      scope: 'Character',
      id: charId
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

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupInfo.name,
   {
      id: groupId,
      data:
      {
         name: groupName
      }
   }, [
   {
      scope: 'Session',
      id: sessionId
   } ]);

   test.expect(2);
   test.done();
};

exports.testGroupMembershipRevoked_WhenSessionEstablishedAsNonMemberOfExistingGroup = function(test)
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
         members: []
      },
      removed:
      {
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

exports.testGroupMembershipEmitted_WhenSessionEstablishedAsMemberOfExistingGroup = function(test)
{
   var charId = 5566;
   var sessionId = UuidFactory.v4();
   var responseQueue = 'queue';
   var groupName = 'TestGroup';
   var groupId = UuidFactory.v4();

   this.fixture.givenExistingCharacterSession(charId, UuidFactory.v4());
   this.fixture.givenCharacterIsMemberOfGroups(charId, [ groupId ]);
   this.fixture.givenExistingGroupWithMembers(groupId, groupName, [ charId, 1122, 3344 ]);

   this.fixture.whenClientConnected(charId, sessionId, responseQueue);

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupMembership.name,
   {
      groupId: groupId,
      added:
      {
         members: [ charId, 1122, 3344 ]
      },
      removed:
      {
         members: []
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

   this.fixture.whenStorageReturnsData(GroupDataObject.CollectionName); // the ID member query
   this.fixture.whenStorageReturnsData(GroupDataObject.CollectionName); // the ID ad query
   this.fixture.whenStorageReturnsData(GroupDataObject.CollectionName); // the data query
   this.fixture.whenStorageReturnsData(GroupDataObject.CollectionName); // the data query

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupMembership.name,
   {
      groupId: groupId,
      removed:
      {
         members: []
      },
      added:
      {
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
   this.fixture.givenGroupHasOwner(groupId, 'Character', [ charId ]);

   this.fixture.whenBroadcastDestroyGroupIsReceived(sessionId, groupId);

   this.fixture.thenTheLastBroadcastShouldHaveBeen(test, busMessages.Broadcasts.GroupInfo.name,
   {
      id: groupId
   });

   test.expect(1);
   test.done();
};
