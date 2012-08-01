/**
 * This interface is for the various supported API functions
 */
function ApiFunction()
{
   /**
    * @returns the URI
    */
   this.getUri = function()
   {
      return "/";
   };

   /**
    * @returns the name of the collection
    */
   this.getCollectionName = function()
   {
      return "Unknown";
   };

   /**
    * Returns a storage key uniquely identifying the request by its parameters
    * 
    * @param parameters an object containing the parameters necessary for the request
    * @param hostName name of the host for which the request is
    * @returns a storage key represented as a 24 character hex string
    */
   this.getStorageKey = function(parameters, hostName)
   {
      return null;
   };

   /**
    * Parses the XML as returned from the remote API
    * 
    * @param xmlString the XML string as returned from the API
    * @returns an object containing 'err' and 'data'.
    */
   this.parseXml = function(xmlString)
   {
      var result =
      {
         err: 'Not Implemented',
         data: null
      };

      return result;
   };
}

module.exports = ApiFunction;
