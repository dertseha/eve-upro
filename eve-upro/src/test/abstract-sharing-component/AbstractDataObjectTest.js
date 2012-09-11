var util = require('util');

var UuidFactory = require("../../util/UuidFactory.js");

var Character = require('../../character-agent-component/Character.js');

var AbstractDataObject = require('../../abstract-sharing-component/AbstractDataObject.js');

function TestDataObject(documentId, initData)
{
   TestDataObject.super_.call(this, documentId, initData);

   this.getCollectionName = function()
   {
      return 'Test';
   };
}
util.inherits(TestDataObject, AbstractDataObject);

function Fixture()
{
   this.initData =
   {
      owner: AbstractDataObject.createMemberList(),
      shares: AbstractDataObject.createMemberList()
   };

   this.givenInitOwner = function(scope, ids)
   {
      this.initData.owner['list' + scope] = ids;
   };

   this.givenADataObject = function(documentId)
   {
      this.dataObject = new TestDataObject(documentId || UuidFactory.v4(), this.initData);
   };

   this.whenAddingOwner = function(scope, id)
   {
      var interest =
      {
         scope: scope,
         id: id
      };

      this.dataObject.addOwner(interest);
   };

   this.whenRemovingOwner = function(scope, id)
   {
      var interest =
      {
         scope: scope,
         id: id
      };

      this.dataObject.removeOwner(interest);
   };
}

exports.setUp = function(callback)
{
   var fixture = new Fixture();

   this.fixture = fixture;

   callback();
};

exports.testToStringReturnsInfo = function(test)
{
   var documentId = UuidFactory.v4();

   this.fixture.givenADataObject(documentId);

   test.equals(this.fixture.dataObject.toString(), 'Test ' + documentId);

   test.done();
};

exports.testHasOwnerShouldReturnFalse_WhenEmptyInitialized = function(test)
{
   this.fixture.givenADataObject();

   test.equals(this.fixture.dataObject.hasOwner(), false);

   test.done();
};

[ 'Character', 'Corporation', 'Group' ].forEach(function(scope)
{
   var scopeIds =
   {
      Character: 1,
      Corporation: 2,
      Group: UuidFactory.v4()
   };

   exports['testHasOwnerShouldReturnTrue_WhenWith' + scope] = function(test)
   {
      this.fixture.givenInitOwner(scope, [ scopeIds[scope] ]);
      this.fixture.givenADataObject();

      test.equals(this.fixture.dataObject.hasOwner(), true);

      test.done();
   };

   exports['testIsCharacterOwnerShouldReturnTrue_When' + scope + 'IsOwner'] = function(test)
   {
      var character = new Character(scopeIds.Character, 'Name', scopeIds.Corporation, 'Name2');

      character.addInterestForGroup(scopeIds.Group);

      this.fixture.givenInitOwner(scope, [ scopeIds[scope] ]);
      this.fixture.givenADataObject();

      test.equals(this.fixture.dataObject.isCharacterOwner(character), true);

      test.done();
   };

   exports['testIsCharacterOwnerShouldReturnTrue_When' + scope + 'BecomesOwner'] = function(test)
   {
      var character = new Character(scopeIds.Character, 'Name', scopeIds.Corporation, 'Name2');

      character.addInterestForGroup(scopeIds.Group);

      this.fixture.givenADataObject();

      this.fixture.whenAddingOwner(scope, scopeIds[scope]);

      test.equals(this.fixture.dataObject.isCharacterOwner(character), true);

      test.done();
   };

   exports['testIsCharacterOwnerShouldReturnFalse_When' + scope + 'LosesOwnership'] = function(test)
   {
      var character = new Character(scopeIds.Character, 'Name', scopeIds.Corporation, 'Name2');

      character.addInterestForGroup(scopeIds.Group);

      this.fixture.givenInitOwner(scope, [ scopeIds[scope] ]);
      this.fixture.givenADataObject();

      this.fixture.whenRemovingOwner(scope, scopeIds[scope]);

      test.equals(this.fixture.dataObject.isCharacterOwner(character), false);

      test.done();
   };
});

exports.testGetOwnerInterestReturnsValidValue = function(test)
{
   var groupId = UuidFactory.v4();

   this.fixture.givenInitOwner('Character', [ 10 ]);
   this.fixture.givenInitOwner('Corporation', [ 20 ]);
   this.fixture.givenInitOwner('Group', [ groupId ]);
   this.fixture.givenADataObject();

   test.deepEqual(this.fixture.dataObject.getOwnerInterest(), [
   {
      scope: 'Character',
      id: 10
   },
   {
      scope: 'Corporation',
      id: 20
   },
   {
      scope: 'Group',
      id: groupId
   } ]);

   test.done();
};
