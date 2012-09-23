var util = require("util");
var xpath = require('xpath.js');
var DomParser = require('xmldom').DOMParser;

var AbstractApiFunction = require('./AbstractApiFunction.js');

/**
 * For the CorporationSheet function
 */
function CorpCorporationSheet()
{
   CorpCorporationSheet.super_.call(this);

   /**
    * {@inheritDoc} The key includes also the corporation ID and the (optional) key information.
    */
   this.getStorageKey = function(parameters, hostName)
   {
      return this.createHash([ hostName, parameters.corporationID, parameters.keyID, parameters.vCode ]);
   };

   /** {@inheritDoc} */
   this.getUri = function()
   {
      return "/corp/CorporationSheet.xml.aspx";
   };

   /** {@inheritDoc} */
   this.getCollectionName = function()
   {
      return "CorporationSheet";
   };

   /** {@inheritDoc} */
   this.extractData = function(result, doc)
   {
      var data =
      {
         corporation:
         {
            corporationId: parseInt(xpath(doc, "/eveapi/result/corporationID/text()")[0].data, 10),
            corporationName: this.trim(xpath(doc, "/eveapi/result/corporationName/text()")[0].data),
            ceoId: parseInt(xpath(doc, "/eveapi/result/ceoID/text()")[0].data, 10),
            ceoName: this.trim(xpath(doc, "/eveapi/result/ceoName/text()")[0].data),
            allianceId: parseInt(xpath(doc, "/eveapi/result/allianceID/text()")[0].data, 10)
         }
      };
      if (data.corporation.allianceId)
      {
         data.corporation.allianceName = this.trim(xpath(doc, "/eveapi/result/allianceName/text()")[0].data);
      }
      else
      {
         delete data.corporation.allianceId;
      }
      result.data = data;

      return result;
   };

   this.trim = function(input)
   {
      return input.replace(/^\s+|\s+$/g, '');
   };
}
util.inherits(CorpCorporationSheet, AbstractApiFunction);

module.exports = CorpCorporationSheet;
