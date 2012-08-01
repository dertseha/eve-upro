/**
 * This interface is for accessing cached data of API calls
 */
function EveApiStorage()
{
   /**
    * Defines a collection and initializes it in the storage
    * 
    * @param collectionName the name of the collection
    * @param callback a function(err) { } receiving an error object at failure
    */
   this.defineCollection = function(collectionName, callback)
   {
      process.nextTick(function()
      {
         callback('Not Implemented');
      });
   };

   /**
    * Sets some data for a specific key. Data should be held available for given amount of TTL (time-to-life) seconds.
    * 
    * @param collectionName the name of the collection
    * @param key the key of the data, a 24 character hex string
    * @param data arbitrary data object
    * @param callback a function(err) { } receiving an error object at failure
    */
   this.set = function(collectionName, key, ttlSeconds, data, callback)
   {
      process.nextTick(function()
      {
         callback('Not Implemented');
      });
   };

   /**
    * Gets some data for a specific key. An error is returned if not found or already timed out.
    * 
    * @param collectionName the name of the collection
    * @param key the key of the data, a 24 character hex string
    * @param callback a function(err, data) { } callback
    */
   this.get = function(collectionName, key, callback)
   {
      process.nextTick(function()
      {
         callback('Not Implemented');
      });
   };
}

module.exports = EveApiStorage;
