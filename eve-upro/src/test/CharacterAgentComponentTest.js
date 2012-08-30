var EventEmitter = require('events').EventEmitter;

var UuidFactory = require('../util/UuidFactory.js');
var Component = require('../character-agent-component/CharacterAgentComponent.js');
var Character = require('../character-agent-component/Character.js');

var busMessages = require('../model/BusMessages.js');

function Fixture()
{
   this.amqp = new EventEmitter();

   this.component = new Component(
   {
      amqp: this.amqp
   });

   this.givenExistingCharacterSession = function(charId, sessionId)
   {
      var character = new Character(charId, 'name');

      this.component.characters[charId] = character;
      character.addClientSession(sessionId);
   };

   this.givenCharacterHasInterestInGroups = function(charId, groups)
   {
      this.component.characters[charId].groupMemberships = groups;
   };

   this.expectingCharacterOnlineEvent = function(test, charId)
   {
      this.component.on('CharacterOnline', function(character)
      {
         test.equal(character.getCharacterId(), charId);
         test.done();
      });
   };

   this.expectingCharacterOfflineEvent = function(test, charId)
   {
      this.component.on('CharacterOffline', function(character)
      {
         test.equal(character.getCharacterId(), charId);
         test.done();
      });
   };

   this.expectingSessionAddedEvent = function(test, charId, expectedSessionId)
   {
      this.component.on('SessionAdded', function(character, sessionId)
      {
         if (character.getCharacterId() == charId)
         {
            test.equal(sessionId, expectedSessionId);
            test.done();
         }
      });
   };

   this.expectingSessionRemovedEvent = function(test, charId, expectedSessionId)
   {
      this.component.on('SessionRemoved', function(character, sessionId)
      {
         if (character.getCharacterId() == charId)
         {
            test.equal(sessionId, expectedSessionId);
            test.done();
         }
      });
   };

   this.whenBroadcastReceived = function(type, body)
   {
      var header =
      {
         type: type
      };

      this.amqp.emit('broadcast', header, body);
      this.amqp.emit('broadcast:' + type, header, body);
   };

   this.createUser = function(charId, charName, corpId, corpName)
   {
      var user =
      {
         characterId: charId || 1234,
         characterName: charName || 'Dummy Char',
         corporationId: corpId || 5678,
         corporationName: corpName || 'Dummy Corp'
      };

      return user;
   };

   this.thenHasInterestInShouldReturn = function(test, charId, interestList, expected)
   {
      var character = this.component.characters[charId];
      var result = character.hasInterestIn(interestList);

      test.equal(result, expected);
   };
}

exports.setUp = function(callback)
{
   this.fixture = new Fixture();

   this.fixture.component.once('started', callback);
   this.fixture.component.start();
};

exports.testCharacterOnlineEventEmitted_WhenFirstSessionConnected = function(test)
{
   var sessionId = UuidFactory.v4();
   var user = this.fixture.createUser(1234, 'test');

   this.fixture.expectingCharacterOnlineEvent(test, user.characterId);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientConnected.name,
   {
      sessionId: sessionId,
      user: user
   });
};

exports.testCharacterSessionAddedEventEmitted_WhenSessionConnected = function(test)
{
   var sessionId = UuidFactory.v4();
   var user = this.fixture.createUser(1234, 'test');

   this.fixture.expectingSessionAddedEvent(test, user.characterId, sessionId);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientConnected.name,
   {
      sessionId: sessionId,
      user: user
   });
};

exports.testCharacterSessionRemovedEventEmitted_WhenSessionDisconnected = function(test)
{
   var sessionId = UuidFactory.v4();
   var user = this.fixture.createUser(1234, 'test');

   this.fixture.givenExistingCharacterSession(user.characterId, sessionId);

   this.fixture.expectingSessionRemovedEvent(test, user.characterId, sessionId);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientDisconnected.name,
   {
      sessionId: sessionId,
      user: user
   });
};

exports.testCharacterOfflineEventEmitted_WhenLastSessionDisconnected = function(test)
{
   var sessionId = UuidFactory.v4();
   var user = this.fixture.createUser(1234, 'test');

   this.fixture.givenExistingCharacterSession(user.characterId, sessionId);

   this.fixture.expectingCharacterOfflineEvent(test, user.characterId);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.ClientDisconnected.name,
   {
      sessionId: sessionId,
      user: user
   });
};

exports.testCharacterInterestModified_WhenGroupMembershipAdded = function(test)
{
   var sessionId = UuidFactory.v4();
   var groupId = UuidFactory.v4();
   var charId = 4567;

   this.fixture.givenExistingCharacterSession(charId, sessionId);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.GroupMembership.name,
   {
      groupId: groupId,
      added:
      {
         groupData:
         {
            name: 'test',
            owner: []
         },
         members: [ charId ]
      }
   });

   this.fixture.thenHasInterestInShouldReturn(test, charId, [
   {
      scope: 'Group',
      id: groupId
   } ], true);

   test.done();
};

exports.testCharacterInterestModified_WhenGroupMembershipRemoved = function(test)
{
   var sessionId = UuidFactory.v4();
   var groupId = UuidFactory.v4();
   var charId = 4567;

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterHasInterestInGroups(charId, [ groupId ]);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.GroupMembership.name,
   {
      groupId: groupId,
      removed:
      {
         members: [ charId ]
      }
   });

   this.fixture.thenHasInterestInShouldReturn(test, charId, [
   {
      scope: 'Group',
      id: groupId
   } ], false);

   test.done();
};
