var util = require('util');

var UuidFactory = require('../util/UuidFactory.js');
var commonSchemata = require('../model/CommonSchemata.js');

var Component = require('../components/Component.js');
var busMessages = require('../model/BusMessages.js');

function Group(id, initData)
{
   this.id = id;

   this.members = initData.members || [];
   this.adCharacter = initData.adCharacter || [];
   this.adCorporation = initData.adCorporation || [];

   this.groupData =
   {
      name: initData.name,
      owner: initData.owner || []
   };
   this.interest = [
   {
      scope: 'Group',
      id: id
   } ];

   /**
    * @returns the id of the group
    */
   this.getId = function()
   {
      return this.id;
   };

   /**
    * @returns the standard interest for this group
    */
   this.getInterest = function()
   {
      return this.interest;
   };

   /**
    * @returns the list of members
    */
   this.getMembers = function()
   {
      return this.members;
   };

   /**
    * @returns the advertisement interest for this group
    */
   this.getAdvertisementInterest = function()
   {
      var interest = [];

      this.adCorporation.forEach(function(corpId)
      {
         interest.push(
         {
            scope: 'Corporation',
            id: corpId
         });
      });
      this.adCharacter.forEach(function(charId)
      {
         interest.push(
         {
            scope: 'Character',
            id: charId
         });
      });

      return interest;
   };

   /**
    * @returns the standard group data
    */
   this.getGroupData = function()
   {
      return this.groupData;
   };

   /**
    * @param characterId the ID to check
    * @returns true if the given characterId is a member of this group
    */
   this.hasMember = function(characterId)
   {
      return this.members.indexOf(characterId) >= 0;
   };

   /**
    * Adds given character as a new member
    * 
    * @param characterId the ID to add
    * @returns true if the given characterId is a new member of this group
    */
   this.addMember = function(characterId)
   {
      var rCode = false;

      if (!this.hasMember(characterId))
      {
         this.members.push(characterId);
         rCode = true;
      }

      return rCode;
   };

   /**
    * Removes given character from the list of members
    * 
    * @param characterId the ID to remove
    * @returns true if the given characterId was removed from the group
    */
   this.removeMember = function(characterId)
   {
      var index = this.members.indexOf(characterId);
      var rCode = false;

      if (index >= 0)
      {
         var part1 = this.members.slice(0, index);
         var part2 = this.members.slice(index + 1);

         this.members = part1.concat(part2);
         this.removeOwner(characterId); // ensure being removed as owner as well
         rCode = true;
      }

      return rCode;
   };

   /**
    * Removes given character from the list of owner
    * 
    * @param characterId the ID to remove
    * @returns true if the given characterId was removed from the list
    */
   this.removeOwner = function(characterId)
   {
      var index = this.groupData.owner.indexOf(characterId);
      var rCode = false;

      if (index >= 0)
      {
         var part1 = this.groupData.owner.slice(0, index);
         var part2 = this.groupData.owner.slice(index + 1);

         this.groupData.owner = part1.concat(part2);
         rCode = true;
      }

      return rCode;
   };

   /**
    * @returns true if the group is empty - no members and no advertisements
    */
   this.isEmpty = function()
   {
      var rCode = true;

      if (this.members.length > 0)
      {
         rCode = false;
      }
      if (this.adCharacter.length > 0)
      {
         rCode = false;
      }
      if (this.adCorporation.length > 0)
      {
         rCode = false;
      }

      return rCode;
   };

   /**
    * @returns true if the group has ownership explicitly identified
    */
   this.hasExplicitOwner = function()
   {
      return this.groupData.owner.length > 0;
   };

   /**
    * @returns true if the given character is owning this group
    */
   this.isCharacterOwner = function(character)
   {
      return this.groupData.owner.indexOf(character.getCharacterId()) > 0;
   };

   /**
    * @returns true if the group allows controlling actions from the given character
    */
   this.allowsControllingActionsFrom = function(character)
   {
      return !this.hasExplicitOwner() || this.isCharacterOwner(character);
   };

   /**
    * @returns true if the given character is invited
    */
   this.isCharacterInvited = function(character)
   {
      var rCode = false;

      if (this.isInterestInvitedById('Character', character.getCharacterId()))
      {
         rCode = true;
      }
      else if (this.isInterestInvitedById('Corporation', character.getCorporationId()))
      {
         rCode = true;
      }

      return rCode;
   };

   this.isInterestInvitedById = function(scope, id)
   {
      var rCode = false;
      var list = this['ad' + scope];

      if ((list != null) && (list.indexOf(id) >= 0))
      {
         rCode = true;
      }

      return rCode;
   };

   this.addAdvertisement = function(scope, id)
   {
      var list = this['ad' + scope];
      var rCode = false;

      if (list)
      {
         if (list.indexOf(id) < 0)
         {
            list.push(id);
            rCode = true;
         }
      }

      return rCode;
   };

   this.saveToStorage = function(storage)
   {
      var id = UuidFactory.toMongoId(this.id);
      var data =
      {
         name: this.groupData.name,
         owner: this.groupData.owner,
         members: this.members,
         adCharacter: this.adCharacter,
         adCorporation: this.adCorporation
      };

      storage.setData(Group.CollectionName, id, data, function(err)
      {

      });
   };

   this.deleteFromStorage = function(storage)
   {
      var criteria =
      {
         _id: UuidFactory.toMongoId(this.id)
      };

      storage.delData(Group.CollectionName, criteria, function(err)
      {

      });
   };
};

Group.create = function(name, owner)
{
   var id = UuidFactory.v4();
   var initData =
   {
      name: name,
      owner: owner
   };
   var group = new Group(id, initData);

   return group;
};

Group.DocumentSchema =
{
   name: String,
   owner: commonSchemata.groupOwnerSchema,
   members: Array.of(Number),
   adCharacter: Array.of(Number),
   adCorporation: Array.of(Number)
};

Group.CollectionName = 'Groups';

module.exports = Group;
