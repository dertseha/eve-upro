var UuidFactory = require('../../util/UuidFactory.js');

GroupDataObject = require('../../group-service-component/GroupDataObject.js');
Character = require('../../character-agent-component/Character.js');

function Fixture()
{
   this.group = new GroupDataObject(UuidFactory.v4(),
   {
      group:
      {
         name: "TestGroup"
      }
   });

   this.givenGroupHasMembers = function(members)
   {
      this.group.members = members;
   };

   this.whenGroupHasMembers = function(members)
   {
      this.group.members = members;
   };

   this.whenGroupHasOwner = function(owner)
   {
      this.group.owner.listCharacter = owner;
   };

   this.whenMemberWasRemoved = function(characterId)
   {
      this.group.removeMember(characterId);
   };

   this.thenMemberListShouldBe = function(test, expected)
   {
      test.deepEqual(this.group.members, expected);
   };

   this.thenHasMemberShouldReturn = function(test, characterId, expected)
   {
      var result = this.group.isCharacterMember(new Character(characterId));

      test.equal(result, expected);
   };

   this.thenAddMemberShouldReturn = function(test, characterId, expected)
   {
      var result = this.group.addMember(new Character(characterId));

      test.equal(result, expected);
   };

   this.thenRemoveMemberShouldReturn = function(test, characterId, expected)
   {
      var result = this.group.removeMember(characterId);

      test.equal(result, expected);
   };

   this.thenIsCharacterOwnerShouldReturn = function(test, char, expected)
   {
      var result = this.group.isCharacterOwner(char);

      test.equal(result, expected);
   };
}

exports.setUp = function(callback)
{
   var fixture = new Fixture();

   this.fixture = fixture;

   callback();
};

exports.testHasMemberIsFalse_WhenNotFound = function(test)
{
   this.fixture.whenGroupHasMembers([]);

   this.fixture.thenHasMemberShouldReturn(test, 1234, false);

   test.done();
};

exports.testHasMemberIsTrue_WhenFound = function(test)
{
   this.fixture.whenGroupHasMembers([ 111, 222, 333 ]);

   this.fixture.thenHasMemberShouldReturn(test, 333, true);

   test.done();
};

exports.testAddMemberReturnsTrue_WhenNotInGroup = function(test)
{
   this.fixture.whenGroupHasMembers([]);

   this.fixture.thenAddMemberShouldReturn(test, 45345, true);

   test.done();
};

exports.testAddMemberReturnsFalse_WhenInGroup = function(test)
{
   this.fixture.whenGroupHasMembers([ 123, 456, 789 ]);

   this.fixture.thenAddMemberShouldReturn(test, 456, false);

   test.done();
};

exports.testRemoveMemberIsFalse_WhenNotFound = function(test)
{
   this.fixture.whenGroupHasMembers([]);

   this.fixture.thenRemoveMemberShouldReturn(test, 1234, false);

   test.done();
};

exports.testRemoveMemberIsTrue_WhenFound = function(test)
{
   this.fixture.whenGroupHasMembers([ 111, 222, 333 ]);

   this.fixture.thenRemoveMemberShouldReturn(test, 222, true);

   test.done();
};

exports.testRemoveMemberSetsMemberList_WhenFound = function(test)
{
   this.fixture.givenGroupHasMembers([ 111, 222, 333 ]);

   this.fixture.whenMemberWasRemoved(222);

   this.fixture.thenMemberListShouldBe(test, [ 111, 333 ]);

   test.done();
};

exports.testGroupOwner_NotInList = function(test)
{
   var char = new Character(1, 'test', 2, 'test');

   this.fixture.whenGroupHasOwner([]);

   this.fixture.thenIsCharacterOwnerShouldReturn(test, char, false);
   test.done();
};

exports.testGroupOwner_CharInList = function(test)
{
   var char = new Character(1, 'test', 2, 'test');

   this.fixture.whenGroupHasOwner([ char.getCharacterId() ]);

   this.fixture.thenIsCharacterOwnerShouldReturn(test, char, true);
   test.done();
};
