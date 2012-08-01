var crypto = require('crypto');
var util = require("util");
var xpath = require('xpath.js');
var DomParser = require('xmldom').DOMParser;

var ApiFunction = require('../ApiFunction.js');

/**
 * Abstract API function implementation
 */
function AbstractApiFunction()
{
   AbstractApiFunction.super_.call(this);

   /**
    * {@inheritDoc} This standard implementation uses the host name, keyID and vCode as parameters. HostName is added
    * for extra paranoia.
    */
   this.getStorageKey = function(parameters, hostName)
   {
      return this.createHash([ hostName, parameters.keyID, parameters.vCode ]);
   };

   /**
    * Creates a hash from given array of parameters
    * 
    * @param parameters array of strings to create a hash from
    * @returns a 24 character hash
    */
   this.createHash = function(parameters)
   {
      var sum = crypto.createHash('md5');

      parameters.forEach(function(item)
      {
         sum.update(item + '|');
      });

      return sum.digest('hex').substring(0, 24);
   };

   /** {@inheritDoc} */
   this.parseXml = function(xmlString)
   {
      var result = this.createResult(null, 0, null);
      var doc = null;

      try
      {
         doc = new DomParser().parseFromString(xmlString);
      }
      catch (ex)
      {
         result.err = this.createError('Exception while parsing', ex);
      }
      if (doc)
      {
         if (!result.err)
         {
            result = this.extractCacheTime(result, doc);
         }
         if (!result.err)
         {
            result = this.extractError(result, doc);
         }
         if (!result.err && !result.data)
         {
            try
            {
               result = this.extractData(result, doc);
            }
            catch (ex)
            { // in case of data error, create a fresh (error) result to avoid dangling data
               result = this.createErrorResult('Unhandled excpetion extracting data', ex);
            }
         }
      }

      return result;
   };

   /**
    * @returns a result object based on given parameters
    */
   this.createResult = function(err, cacheTime, data)
   {
      var result =
      {
         err: err,
         cacheTime: cacheTime,
         data: data
      };

      return result;
   };

   /**
    * @returns a result based on an error
    */
   this.createErrorResult = function(message, cause)
   {
      return this.createResult(this.createError(message, cause), 0, null);
   };

   /**
    * @returns an error structure
    */
   this.createError = function(message, cause)
   {
      var err =
      {
         message: message,
         cause: cause
      };

      return err;
   };

   /**
    * Extracts an error if present in the given DOM
    * 
    * @param result the result in its current state
    * @param doc the DOM as parsed from the received data
    * @returns a result
    */
   this.extractError = function(result, doc)
   {
      try
      {
         var errors = xpath(doc, "/eveapi/error");

         if (errors && (errors.length > 0))
         {
            var causes = [];

            errors.forEach(function(errorNode)
            {
               var cause =
               {
                  code: parseInt(errorNode.getAttribute('code').toString()),
                  message: errorNode.firstChild.toString()
               };

               causes.push(cause);
            });
            result.data =
            {
               err:
               {
                  causes: causes
               }
            };
         }
      }
      catch (ex)
      {
         result.err = this.createError('Failed to extract error messages', ex);
      }

      return result;
   };

   /**
    * Extracts the cache time from the given DOM
    * 
    * @param result the result in its current state
    * @param doc the DOM as parsed from the received data
    * @returns a result
    */
   this.extractCacheTime = function(result, doc)
   {
      try
      {
         var currentTime = new Date(xpath(doc, "/eveapi/currentTime/text()")[0].data).getTime();
         var untilTime = new Date(xpath(doc, "/eveapi/cachedUntil/text()")[0].data).getTime();

         if (currentTime <= untilTime)
         {
            result.cacheTime = (untilTime - currentTime) / 1000;
         }
         else
         {
            result.err = this.createError('Current/Until times are wrong');
         }
      }
      catch (ex)
      {
         result.err = this.createError('Error parsing cache dates');
      }

      return result;
   };

   /**
    * Extracts the data from the given DOM
    * 
    * @param result the result in its current state
    * @param doc the DOM as parsed from the received data
    * @returns a result
    */
   this.extractData = function(result, doc)
   {
      result.err = this.createError('ApiFunction.extractData not implemented');

      return result;
   };
}
util.inherits(AbstractApiFunction, ApiFunction);

module.exports = AbstractApiFunction;
