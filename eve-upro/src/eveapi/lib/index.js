exports.EveApiStorage = require('./EveApiStorage');
exports.RemoteApi = require('./RemoteApi');

var WebRemoteApi = require('./WebRemoteApi');

/**
 * This is an enumeration containing all standard API functions known. The members are of type ApiFunction.
 */
exports.ApiFunctions =
{
   AccountApiKeyInfo: new (require('./functions/AccountApiKeyInfo'))(),
   CorpCorporationSheet: new (require('./functions/CorpCorporationSheet'))()
};

EveApi = function(options, storage, remoteApi)
{
   this.storage = storage;
   this.pendingRequests = {};

   this.apiHostName = options.apiHostName || 'api.eveonline.com';

   this.remoteApi = remoteApi || new WebRemoteApi(this.apiHostName);

   /**
    * Starts the request for given API function
    * 
    * @param apiFunction An ApiFunction instance
    * @param apiParameters parameters for the function (used for the API request)
    * @param callback the final user callback
    */
   this.request = function(apiFunction, apiParameters, callback)
   {
      var storageKey = apiFunction.getStorageKey(apiParameters, this.apiHostName);

      if (!this.queueUpForPendingRequest(apiFunction, storageKey, callback))
      {
         this.requestFromStorageOrRemoteApi(apiFunction, apiParameters, storageKey, callback);
      }
   };

   /**
    * Queues up a data request if others with the same parameters are already active.
    * 
    * @param apiFunction An ApiFunction instance
    * @param storageKey the unique key for the request
    * @param callback the final user callback
    * @return true if this request is not the first (i.e. "queued up")
    */
   this.queueUpForPendingRequest = function(apiFunction, storageKey, callback)
   {
      var apiFuncName = apiFunction.getCollectionName();
      var requests = this.pendingRequests[apiFuncName];
      var rCode = false;

      if (requests === undefined)
      {
         this.pendingRequests[apiFuncName] = requests = {};
      }

      var callbacks = requests[storageKey];

      if (callbacks === undefined)
      {
         requests[storageKey] = callbacks = [];
      }
      else
      {
         rCode = true;
      }
      callbacks.push(callback);

      return rCode;
   };

   /**
    * Requests data per api request from either the storage or remote api
    * 
    * @param apiFunction An ApiFunction instance
    * @param apiParameters parameters for the function (used for the API request)
    * @param storageKey the unique key for the request
    * @param callback the final user callback
    */
   this.requestFromStorageOrRemoteApi = function(apiFunction, apiParameters, storageKey, callback)
   {
      var self = this;

      this.storage.get(apiFunction.getCollectionName(), storageKey, function(err, data)
      {
         if (err)
         {
            self.requestFromRemoteApi(apiFunction, apiParameters, storageKey, callback);
         }
         else
         {
            self.completeRequest(apiFunction, storageKey, null, data);
         }
      });
   };

   /**
    * Requests data per api request from the remote api
    * 
    * @param apiFunction An ApiFunction instance
    * @param apiParameters parameters for the function (used for the API request)
    * @param storageKey the unique key for the request
    * @param callback the final user callback
    */
   this.requestFromRemoteApi = function(apiFunction, apiParameters, storageKey, callback)
   {
      var self = this;

      this.remoteApi.get(apiFunction.getUri(), apiParameters, function(err, data)
      {
         if (err)
         {
            self.completeRequest(apiFunction, storageKey, err, null);
         }
         else
         {
            var extractedData = apiFunction.parseXml(data);

            self.storage.set(apiFunction.getCollectionName(), storageKey, extractedData.cacheTime, extractedData.data,
                  function(err)
                  {
                     if (err)
                     {
                        // what do?
                     }
                  });
            self.completeRequest(apiFunction, storageKey, null, extractedData.data);
         }
      });
   };

   /**
    * Completes a request and calls all pending user callbacks with given data
    * 
    * @param apiFunction An ApiFunction instance
    * @param storageKey the unique key for the request
    * @param err the error to pass on to the user callback
    * @param data the data to pass on to the user callback
    */
   this.completeRequest = function(apiFunction, storageKey, err, data)
   {
      var apiFuncName = apiFunction.getCollectionName();
      var requests = this.pendingRequests[apiFuncName];
      var callbacks = requests[storageKey];

      delete requests[storageKey];
      callbacks.forEach(function(callback)
      {
         process.nextTick(function()
         {
            callback(err, data);
         });
      });
   };

};

exports.create = function(options, storage, remoteApi)
{
   return new EveApi(options, storage, remoteApi);
};

/**
 * Initializes the storage to create collections for all the registered functions.
 * 
 * @param storage the storage to use
 * @param callback a function(err) callback. err is null if all is fine.
 * @param an explicit object containing the API functions. defaults to exports.ApiFunctions
 */
exports.initStorage = function(storage, callback, apiFunctions)
{
   var count = 0;
   var errors = [];
   var returned = 0;
   var storageCallback = function(err)
   {
      returned++;
      if (err)
      {
         errors.push(err);
      }
      if (returned >= count)
      {
         callback(errors.length > 0 ? errors : null);
      }
   };

   if (!apiFunctions)
   {
      apiFunctions = exports.ApiFunctions;
   }
   for ( var apiFunctionName in apiFunctions)
   {
      var apiFunction = apiFunctions[apiFunctionName];

      storage.defineCollection(apiFunction.getCollectionName(), storageCallback);
      count++;
   }
};
