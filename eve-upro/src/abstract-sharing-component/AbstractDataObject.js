var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();
var schema = require('js-schema');

var UuidFactory = require('../util/UuidFactory.js');
var commonSchemata = require('../model/CommonSchemata.js');

function AbstractDataObject(documentId, initData)
{
   this.documentId = documentId;

   this.owner = AbstractDataObject.createMemberList(initData ? initData.owner : {});
   this.shares = AbstractDataObject.createMemberList(initData ? initData.shares : {});

   /**
    * @returns string presentation for logs
    */
   this.toString = function()
   {
      return this.getCollectionName() + ' ' + this.documentId;
   };

   /**
    * @returns the id of the document
    */
   this.getDocumentId = function()
   {
      return this.documentId;
   };

   /**
    * @returns true if there is at least one owner
    */
   this.hasOwner = function()
   {
      var rCode = false;

      for ( var key in this.owner)
      {
         if (this.owner[key].length > 0)
         {
            rCode = true;
         }
      }

      return rCode;
   };

   this.forEachOwnerList = function(callback)
   {
      var memberLists = this.owner;

      AbstractDataObject.Scopes.forEach(function(scope)
      {
         callback(scope, memberLists['list' + scope]);
      });
   };

   /**
    * @returns true if the given character is an owner of the object
    */
   this.isCharacterOwner = function(character)
   {
      return this.hasListEntryForCharacter(this.owner, character);
   };

   /**
    * @returns true if the given character has interest
    */
   this.isInterestForCharacter = function(character)
   {
      return this.hasListEntryForCharacter(this.shares, character);
   };

   /**
    * @returns true if the given character is represented in one of the lists
    */
   this.hasListEntryForCharacter = function(listsMember, character)
   {
      var rCode = false;

      if (this.hasListEntry(listsMember, 'Character', character.getCharacterId()))
      {
         rCode = true;
      }
      else if (this.hasListEntry(listsMember, 'Corporation', character.getCorporationId()))
      {
         rCode = true;
      }
      else if (this.hasListEntry(listsMember, 'Alliance', character.getAllianceId()))
      {
         rCode = true;
      }
      else
      {
         var self = this;

         character.forEachGroupInterest(function(groupId)
         {
            if (self.hasListEntry(listsMember, 'Group', groupId))
            {
               rCode = true;
            }
         });
      }

      return rCode;
   };

   /**
    * @returns true if the given group is an owner
    */
   this.isGroupOwner = function(groupId)
   {
      return this.hasListEntry(this.owner, 'Group', groupId);
   };

   /**
    * @returns true if the given groupId has interest
    */
   this.isInterestForGroup = function(groupId)
   {
      return this.hasListEntry(this.shares, 'Group', groupId);
   };

   /**
    * @returns true if the given interest is represented in the corresponding list
    */
   this.hasListEntry = function(listsMember, scope, id)
   {
      var list = listsMember['list' + scope];
      var rCode = false;

      if (list && (list.indexOf(id) >= 0))
      {
         rCode = true;
      }

      return rCode;
   };

   /**
    * Adds an owner by given interest
    * 
    * @returns true if the owner is new
    */
   this.addOwner = function(interest)
   {
      return this.addListEntry(this.owner, interest);
   };

   /**
    * Adds a share for given interest
    * 
    * @returns true if the interest is new
    */
   this.addShare = function(interest)
   {
      return this.addListEntry(this.shares, interest);
   };

   /**
    * Adds a list entry of given interest
    */
   this.addListEntry = function(listsMember, interest)
   {
      var list = listsMember['list' + interest.scope];
      var rCode = false;

      if (list && (list.indexOf(interest.id) < 0))
      {
         list.push(interest.id);
         rCode = true;
      }

      return rCode;
   };

   /**
    * Removes an owner
    * 
    * @returns true if the owner was in the lists
    */
   this.removeOwner = function(interest)
   {
      return this.removeListEntry(this.owner, interest);
   };

   /**
    * Removes a share
    * 
    * @returns true if the interest was in the lists
    */
   this.removeShare = function(interest)
   {
      return this.removeListEntry(this.shares, interest);
   };

   /**
    * Removes an interest from the corresponding list
    * 
    * @returns true if the interest was in the lists
    */
   this.removeListEntry = function(listsMember, interest)
   {
      var memberName = 'list' + interest.scope;
      var list = listsMember[memberName];
      var rCode = false;

      if (list)
      {
         var index = list.indexOf(interest.id);

         if (index >= 0)
         {
            var part1 = list.slice(0, index);
            var part2 = list.slice(index + 1);

            listsMember[memberName] = part1.concat(part2);
            rCode = true;
         }
      }

      return rCode;
   };

   /**
    * @returns the interest list for the data
    */
   this.getDataInterest = function()
   {
      return this.getInterestList(this.shares);
   };

   /**
    * @returns the interest list for the owner
    */
   this.getOwnerInterest = function()
   {
      return this.getInterestList(this.owner);
   };

   /**
    * @returns the interest list from given lists member
    */
   this.getInterestList = function(listsMember)
   {
      var interest = [];

      for ( var key in listsMember)
      {
         var scope = key.substring('list'.length);

         interest = this.getInterestListForScope(listsMember[key], interest, scope);
      }

      return interest;
   };

   /**
    * @returns the interest list for given scope
    */
   this.getInterestListForScope = function(list, interest, scope)
   {
      list.forEach(function(id)
      {
         var entry =
         {
            scope: scope,
            id: id
         };

         interest.push(entry);
      });

      return interest;
   };

   this.saveToStorage = function(storage)
   {
      var id = UuidFactory.toMongoId(this.documentId);
      var data =
      {
         owner: this.owner,
         shares: this.shares
      };

      data = this.extendStorageData(data);
      storage.setData(this.getCollectionName(), id, data, function(err)
      {

      });
   };

   this.deleteFromStorage = function(storage)
   {
      AbstractDataObject.erase(storage, this.getCollectionName(), this.documentId);
   };
};

AbstractDataObject.Scopes = [ 'Character', 'Corporation', 'Alliance', 'Group' ];
AbstractDataObject.createMemberList = function(initData)
{
   var memberList = {};

   AbstractDataObject.Scopes.forEach(function(scope)
   {
      var memberName = 'list' + scope;
      var list = initData ? initData[memberName] : [];

      memberList[memberName] = list || [];
   });

   return memberList;
};

AbstractDataObject.erase = function(storage, collectionName, documentId)
{
   var criteria =
   {
      _id: UuidFactory.toMongoId(documentId)
   };

   storage.delData(collectionName, criteria, function(err)
   {
      logger.info(collectionName + ' ' + documentId + ' deletion result');
   });
};

AbstractDataObject.BodyListSchema =
{
   listCharacter: Array.of(Number),
   listCorporation: Array.of(Number),
   listAlliance: Array.of(Number),
   listGroup: Array.of(commonSchemata.groupIdType)
};
AbstractDataObject.DocumentSchema =
{
   owner: AbstractDataObject.BodyListSchema,
   shares: AbstractDataObject.BodyListSchema
};
AbstractDataObject.isDocumentValid = schema(AbstractDataObject.DocumentSchema);

AbstractDataObject.addIndexDefinitions = function(index)
{
   AbstractDataObject.Scopes.forEach(function(scope)
   {
      index.push('data.owner.list' + scope);
      index.push('data.shares.list' + scope);
   });

   return index;
};

module.exports = AbstractDataObject;
