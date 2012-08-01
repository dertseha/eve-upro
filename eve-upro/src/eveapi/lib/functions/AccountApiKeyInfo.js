var util = require("util");
var xpath = require('xpath.js');
var DomParser = require('xmldom').DOMParser;

var AbstractApiFunction = require('./AbstractApiFunction.js');

/**
 * For the APIKeyInfo function
 */
function AccountApiKeyInfo()
{
   AccountApiKeyInfo.super_.call(this);

   /** {@inheritDoc} */
   this.getUri = function()
   {
      return "/account/APIKeyInfo.xml.aspx";
   };

   /** {@inheritDoc} */
   this.getCollectionName = function()
   {
      return "ApiKeys";
   };

   /** {@inheritDoc} */
   this.extractData = function(result, doc)
   {
      var data =
      {
         key:
         {
            accessMask: parseInt(xpath(doc, "/eveapi/result/key/@accessMask")[0].value),
            type: xpath(doc, "/eveapi/result/key/@type")[0].value,
            expires: this.toDateOrNull(xpath(doc, "/eveapi/result/key/@expires")[0].value)
         },
         characters: []
      };
      var characters = xpath(doc, "/eveapi/result/key/rowset/row");

      if (characters && (characters.length > 0))
      {
         characters.forEach(function(characterNode)
         {
            var character =
            {
               characterID: parseInt(characterNode.getAttribute('characterID').toString()),
               characterName: characterNode.getAttribute('characterName').toString(),
               corporationID: parseInt(characterNode.getAttribute('corporationID').toString()),
               corporationName: characterNode.getAttribute('corporationName').toString()
            };

            data.characters.push(character);
         });
      }
      result.data = data;

      return result;
   };

   this.toDateOrNull = function(text)
   {
      var date = null;

      if (text && (text.length > 0))
      {
         date = new Date(text);
      }

      return date;
   };
}
util.inherits(AccountApiKeyInfo, AbstractApiFunction);

module.exports = AccountApiKeyInfo;
