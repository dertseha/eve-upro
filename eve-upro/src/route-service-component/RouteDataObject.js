var util = require('util');

var commonSchemata = require('../model/CommonSchemata.js');

var AbstractDataObject = require('../abstract-sharing-component/AbstractDataObject.js');

function RouteDataObject(documentId, initData)
{
   RouteDataObject.super_.call(this, documentId, initData);

   this.route = initData.route;

   this.getSpecificData = function()
   {
      return this.route;
   };

   this.getCollectionName = function()
   {
      return RouteDataObject.CollectionName;
   };

   this.extendStorageData = function(data)
   {
      data.route = this.route;

      return data;
   };

   this.updateData = function(data)
   {
      var rCode = false;

      for ( var memberName in this.route)
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

         if (this.route[memberName] !== value)
         {
            this.route[memberName] = value;
            rCode = true;
         }
      }

      return rCode;
   };
}
util.inherits(RouteDataObject, AbstractDataObject);

RouteDataObject.CollectionName = "Routes";

RouteDataObject.isDocumentValid = function(data)
{
   return true; // TODO
};

module.exports = RouteDataObject;
