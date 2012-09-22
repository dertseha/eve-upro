var util = require('util');

var schema = require('js-schema');

var commonSchemata = require('../model/CommonSchemata.js');

var AbstractDataObject = require('../abstract-sharing-component/AbstractDataObject.js');

function GroupDataObject(documentId, initData)
{
   GroupDataObject.super_.call(this, documentId, initData);

   this.group = initData.group;
   this.members = initData.members || [];
   this.blackList = initData.blackList || [];

   this.getSpecificData = function()
   {
      return this.group;
   };

   this.getCollectionName = function()
   {
      return GroupDataObject.CollectionName;
   };

   this.extendStorageData = function(data)
   {
      data.group = this.group;
      data.members = this.members;
      data.blackList = this.blackList;

      return data;
   };

   /**
    * {@inheritDoc}
    * 
    * The group specializes the ownership in the way that it can not rely only on other groups. If a circle is created
    * between groups without members, group objects would exist indefinitely without use.
    */
   this.hasOwner = function()
   {
      var rCode = false;

      this.forEachOwnerList(function(scope, list)
      {
         if ((scope !== 'Group') && (list.length > 0))
         {
            rCode = true;
         }
      });

      return rCode;
   };

   this.isCharacterMember = function(character)
   {
      return this.isCharacterInGroupList(character, this.members);
   };

   this.isCharacterBlackListed = function(character)
   {
      return this.isCharacterInGroupList(character, this.blackList);
   };

   this.isCharacterInGroupList = function(character, list)
   {
      return list.indexOf(character.getCharacterId()) >= 0;
   };

   this.getMembers = function()
   {
      return this.members;
   };

   this.getBlackList = function()
   {
      return this.blackList;
   };

   this.addMember = function(character)
   {
      return this.addCharacterToGroupList(character.getCharacterId(), this.members);
   };

   this.addCharacterToBlackList = function(characterId)
   {
      return this.addCharacterToGroupList(characterId, this.blackList);
   };

   this.addCharacterToGroupList = function(characterId, list)
   {
      var rCode = false;

      if (list.indexOf(characterId) < 0)
      {
         list.push(characterId);
         rCode = true;
      }

      return rCode;
   };

   this.removeMember = function(characterId)
   {
      return this.removeCharacterFromGroupList(characterId, this.members);
   };

   this.removeCharacterFromBlackList = function(characterId)
   {
      return this.removeCharacterFromGroupList(characterId, this.blackList);
   };

   this.removeCharacterFromGroupList = function(characterId, list)
   {
      var index = list.indexOf(characterId);
      var rCode = false;

      if (index >= 0)
      {
         list.splice(index, 1);
         rCode = true;
      }

      return rCode;
   };

   this.updateData = function(data)
   {
      var rCode = false;

      for ( var memberName in this.group)
      {
         if (this.updateDataMember(data, memberName))
         {
            rCode = true;
         }
      }

      return rCode;
   };

   this.updateDataMember = function(data, memberName)
   {
      var rCode = false;

      if (data.hasOwnProperty(memberName))
      {
         var value = data[memberName];

         if (this.group[memberName] !== value)
         {
            this.group[memberName] = value;
            rCode = true;
         }
      }

      return rCode;
   };
}
util.inherits(GroupDataObject, AbstractDataObject);

GroupDataObject.CollectionName = "Groups";

GroupDataObject.privateDataSchema =
{
   members: Array.of(Number)
};
GroupDataObject.isPrivateDataValid = schema(GroupDataObject.privateDataSchema);

GroupDataObject.isSpecificDataValid = schema(commonSchemata.groupSchema);
GroupDataObject.isDocumentValid = function(data)
{
   return AbstractDataObject.isDocumentValid(data) && GroupDataObject.isSpecificDataValid(data.group)
         && GroupDataObject.isPrivateDataValid(data);
};

GroupDataObject.addIndexDefinitions = function(index)
{
   index = AbstractDataObject.addIndexDefinitions(index);

   index.push('data.members');

   return index;
};

module.exports = GroupDataObject;
