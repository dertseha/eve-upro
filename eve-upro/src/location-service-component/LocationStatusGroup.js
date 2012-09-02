var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();
var schema = require('js-schema');

var UuidFactory = require('../util/UuidFactory.js');

var commonSchemata = require('../model/CommonSchemata.js');

function LocationStatusGroup(documentId, initData)
{
   this.documentId = documentId;
   this.data =
   {
      characterId: initData.characterId,
      groupId: initData.groupId,

      sendLocation: initData.hasOwnProperty('sendLocation') ? initData.sendLocation : false,
      displayLocation: initData.hasOwnProperty('displayLocation') ? initData.displayLocation : false,
   };

   this.getGroupId = function()
   {
      return this.data.groupId;
   };

   this.toString = function()
   {
      return this.data.groupId + '[' + this.data.characterId + ']';
   };

   this.isSendLocationEnabled = function()
   {
      return this.data.sendLocation;
   };

   this.updateSendLocation = function(value)
   {
      return this.updateDataProperty('sendLocation', value);
   };

   this.isDisplayLocationEnabled = function()
   {
      return this.data.displayLocation;
   };

   this.updateDisplayLocation = function(value)
   {
      return this.updateDataProperty('displayLocation', value);
   };

   this.updateDataProperty = function(name, value)
   {
      var rCode = false;

      if (this.data[name] != value)
      {
         this.data[name] = value;
         rCode = true;
      }

      return rCode;
   };

   this.getSettingsBody = function()
   {
      var body =
      {
         groupId: this.data.groupId,
         sendLocation: this.data.sendLocation,
         displayLocation: this.data.displayLocation
      };

      return body;
   };

   this.saveToStorage = function(storage)
   {
      var id = UuidFactory.toMongoId(this.documentId);

      storage.setData(LocationStatusGroup.CollectionName, id, this.data, function(err)
      {

      });
   };

   this.deleteFromStorage = function(storage)
   {
      LocationStatusGroup.erase(storage, this.documentId);
   };
}

LocationStatusGroup.CollectionName = 'LocationStatusGroups';

LocationStatusGroup.DocumentSchema =
{
   characterId: Number,
   groupId: commonSchemata.uuidSchema,

   sendLocation: Boolean,
   displayLocation: Boolean
};
LocationStatusGroup.documentIsValid = schema(LocationStatusGroup.DocumentSchema);

LocationStatusGroup.getDocumentId = function(characterId, groupId)
{
   var namespace = '8d95b985e6dc48baad0d085351513968';
   var name = 'charId=' + characterId + ';groupId=' + groupId;

   return UuidFactory.v5(namespace, name);
};

LocationStatusGroup.create = function(characterId, groupId)
{
   var id = UuidFactory.v4();
   var initData =
   {
      characterId: characterId,
      groupId: groupId
   };
   var group = new LocationStatusGroup(id, initData);

   return group;
};

LocationStatusGroup.erase = function(storage, id)
{
   var criteria =
   {
      _id: UuidFactory.toMongoId(id)
   };

   storage.delData(LocationStatusGroup.CollectionName, criteria, function(err)
   {
      logger.info('LocationStatusGroup ' + id + ' deletion result');
   });
};

module.exports = LocationStatusGroup;
