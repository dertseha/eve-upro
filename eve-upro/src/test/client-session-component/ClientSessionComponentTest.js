var EventEmitter = require('events').EventEmitter;
var util = require('util');

var UuidFactory = require("../../util/UuidFactory.js");
var busMessages = require('../../model/BusMessages.js');
var CharacterAgentComponent = require('../../character-agent-component/CharacterAgentComponent.js');
var ClientSessionComponent = require('../../client-session-component/ClientSessionComponent.js');

var AbstractServiceComponentFixture = require('../TestSupport/AbstractServiceComponentFixture.js');

function Fixture()
{
   Fixture.super_.call(this);

   var self = this;

   var options =
   {
      security: {}
   };

   this.amqp.allocateResponseQueue = function(callback)
   {
      process.nextTick(function()
      {
         callback(self);
      });
   };

   this.subscribe = function()
   {

   };

   this.setSessionHandler = function()
   {

   };

   this.clientSession = new ClientSessionComponent(
   {
      amqp: this.amqp,
      'character-agent': this.characterAgent,
      'eveapi-msg': this,
      'http-server': this
   }, options);

   this.givenCharacterHasInterestInGroups = function(charId, groups)
   {
      this.characterAgent.characters[charId].groupMemberships = groups;
   };

   this.givenExistingDataPort = function(charId, sessionId)
   {
      var self = this;
      var character = this.characterAgent.characters[charId];
      var user =
      {
         characterId: character.getCharacterId(),
         corporationId: character.getCorporationId()
      };
      var dataPort =
      {
         user: user,
         sendFunction: function(body, name)
         {
            self.sendFunction(body, name);
         },
         character: character
      };

      this.clientSession.dataPorts[sessionId] = dataPort;
   };

   this.sendFunction = function(eventString, name)
   {
      this.lastSentEventString = eventString;
   };

   this.thenLastSentEventShouldHaveBeen = function(test, type, body)
   {
      var event =
      {
         header:
         {
            type: type
         },
         body: body
      };

      test.deepEqual(this.lastSentEventString, JSON.stringify(event));
   };

   this.whenSecurityConfigIs = function(security)
   {
      this.clientSession.options.security = security;
   };

   this.thenUserIsAllowed = function(test, characterId, corporationId, expectedResult)
   {
      var user =
      {
         characterId: characterId,
         corporationId: corporationId
      };

      var result = this.clientSession.isUserAllowed(user);

      test.equal(result, expectedResult);
   };

   this.testUserSecurity = function(test, security, characterId, corporationId, expectedResult)
   {
      this.whenSecurityConfigIs(security);

      this.thenUserIsAllowed(test, characterId, corporationId, expectedResult);
   };
}
util.inherits(Fixture, AbstractServiceComponentFixture);

exports.setUp = function(callback)
{
   var fixture = new Fixture();

   this.fixture = fixture;

   this.fixture.characterAgent.once('started', function()
   {
      fixture.clientSession.once('started', callback);
      fixture.clientSession.start();
   });
   this.fixture.characterAgent.start();
};

exports.testUserIsAllowed_WhenEmptySecurityConfig = function(test)
{
   var security = {};

   this.fixture.testUserSecurity(test, security, 1234, 5678, true);
   test.done();
};

exports.testUserIsAllowed_WhenEmptyAllowedLists = function(test)
{
   var security =
   {
      allowed:
      {
         characterIds: [],
         corporationIds: []
      }
   };

   this.fixture.testUserSecurity(test, security, 1234, 5678, true);
   test.done();
};

exports.testUserIsAllowed_WhenCharacterInAllowedList = function(test)
{
   var security =
   {
      allowed:
      {
         characterIds: [ 1234 ],
         corporationIds: []
      }
   };

   this.fixture.testUserSecurity(test, security, 1234, 5678, true);
   test.done();
};

exports.testUserIsAllowed_WhenCorporationInAllowedList = function(test)
{
   var security =
   {
      allowed:
      {
         characterIds: [],
         corporationIds: [ 7786 ]
      }
   };

   this.fixture.testUserSecurity(test, security, 4532, 7786, true);
   test.done();
};

exports.testUserIsDenied_WhenCharacterNotInAllowedList = function(test)
{
   var security =
   {
      allowed:
      {
         characterIds: [ 1122 ],
         corporationIds: []
      }
   };

   this.fixture.testUserSecurity(test, security, 4564, 2345, false);
   test.done();
};

exports.testUserIsDenied_WhenCorporationNotInAllowedList = function(test)
{
   var security =
   {
      allowed:
      {
         characterIds: [],
         corporationIds: [ 44354 ]
      }
   };

   this.fixture.testUserSecurity(test, security, 2234, 3563, false);
   test.done();
};

exports.testUserIsDenied_WhenCharacterInDeniedList = function(test)
{
   var security =
   {
      denied:
      {
         characterIds: [ 1122 ],
         corporationIds: []
      }
   };

   this.fixture.testUserSecurity(test, security, 1122, 2345, false);
   test.done();
};

exports.testUserIsDenied_WhenCorporationInDeniedList = function(test)
{
   var security =
   {
      denied:
      {
         characterIds: [],
         corporationIds: [ 3653 ]
      }
   };

   this.fixture.testUserSecurity(test, security, 2234, 3653, false);
   test.done();
};

exports.testUserIsDenied_WhenCharacterInBothLists = function(test)
{
   var security =
   {
      allowed:
      {
         characterIds: [ 1122 ],
         corporationIds: []
      },
      denied:
      {
         characterIds: [ 1122 ],
         corporationIds: []
      }
   };

   this.fixture.testUserSecurity(test, security, 1122, 2345, false);
   test.done();
};

exports.testUserIsDenied_WhenCorporationInBothLists = function(test)
{
   var security =
   {
      allowed:
      {
         characterIds: [],
         corporationIds: [ 44354 ]
      },
      denied:
      {
         characterIds: [],
         corporationIds: [ 44354 ]
      }
   };

   this.fixture.testUserSecurity(test, security, 2234, 44354, false);
   test.done();
};

exports.testUserIsDenied_WhenMixedInBothLists = function(test)
{
   var security =
   {
      allowed:
      {
         characterIds: [ 2345 ],
         corporationIds: []
      },
      denied:
      {
         characterIds: [],
         corporationIds: [ 45623 ]
      }
   };

   this.fixture.testUserSecurity(test, security, 2345, 45623, false);
   test.done();
};

exports.testGroupMembershipShouldBeSent_WhenBecomingMember = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var groupId = UuidFactory.v4();
   var messageBody =
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
   };

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenExistingDataPort(charId, sessionId);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.GroupMembership.name, undefined, messageBody,
   {
      interest: [
      {
         scope: 'Group',
         id: groupId
      } ]
   });

   this.fixture.thenLastSentEventShouldHaveBeen(test, busMessages.Broadcasts.GroupMembership.name, messageBody);
   test.done();
};

exports.testGroupMembershipShouldBeSent_WhenDroppingMember = function(test)
{
   var charId = 1234;
   var sessionId = UuidFactory.v4();
   var groupId = UuidFactory.v4();
   var messageBody =
   {
      groupId: groupId,
      removed:
      {
         members: [ charId ]
      }
   };

   this.fixture.givenExistingCharacterSession(charId, sessionId);
   this.fixture.givenCharacterHasInterestInGroups(charId, groupId);
   this.fixture.givenExistingDataPort(charId, sessionId);

   this.fixture.whenBroadcastReceived(busMessages.Broadcasts.GroupMembership.name, undefined, messageBody,
   {
      interest: [
      {
         scope: 'Group',
         id: groupId
      } ]
   });

   this.fixture.thenLastSentEventShouldHaveBeen(test, busMessages.Broadcasts.GroupMembership.name, messageBody);
   test.done();
};
