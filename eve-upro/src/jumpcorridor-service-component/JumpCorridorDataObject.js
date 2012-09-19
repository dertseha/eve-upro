var util = require('util');

var schema = require('js-schema');

var commonSchemata = require('../model/CommonSchemata.js');

var AbstractDataObject = require('../abstract-sharing-component/AbstractDataObject.js');

function JumpCorridorDataObject(documentId, initData)
{
   JumpCorridorDataObject.super_.call(this, documentId, initData);

   this.jumpCorridor = initData.jumpCorridor;

   this.getSpecificData = function()
   {
      return this.jumpCorridor;
   };

   this.getCollectionName = function()
   {
      return JumpCorridorDataObject.CollectionName;
   };

   this.extendStorageData = function(data)
   {
      data.jumpCorridor = this.jumpCorridor;

      return data;
   };

   this.updateData = function(data)
   {
      var rCode = false;

      for ( var memberName in this.jumpCorridor)
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

         if (this.jumpCorridor[memberName] !== value)
         {
            this.jumpCorridor[memberName] = value;
            rCode = true;
         }
      }

      return rCode;
   };
}
util.inherits(JumpCorridorDataObject, AbstractDataObject);

JumpCorridorDataObject.CollectionName = "JumpCorridors";

JumpCorridorDataObject.isSpecificDataValid = schema(commonSchemata.jumpCorridorSchema);
JumpCorridorDataObject.isDocumentValid = function(data)
{
   return AbstractDataObject.isDocumentValid(data) && JumpCorridorDataObject.isSpecificDataValid(data.jumpCorridor);
};

module.exports = JumpCorridorDataObject;
