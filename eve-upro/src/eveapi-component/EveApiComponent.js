var util = require('util');

var Component = require('../components/Component.js');
var busMessages = require('../model/BusMessages.js');

var eveapi = require('../eveapi/lib/index.js');
var MongoDbStorage = require('../eveapi-storage-mongodb/lib/index.js');

function EveApiComponent(services, options, remoteApi)
{
   EveApiComponent.super_.call(this);

   this.amqp = services.amqp;
   this.mongodb = services.mongodb;
   this.eveapiMsg = services['eveapi-msg'];
   this.remoteApi = remoteApi;

   this.options = options;
   this.storage = null;
   this.queue = null;

   this.api = null;

   /** {@inheritDoc} */
   this.start = function()
   {
      var self = this;
      var storage = new MongoDbStorage(this.mongodb.getDatabase());

      this.registerBroadcastHandler(busMessages.Broadcasts.EveApiRequest.name);

      eveapi.initStorage(storage, function(err)
      {
         self.storage = storage;
         self.onStartProgress();
      });
   };

   this.onStartProgress = function()
   {
      if (this.storage)
      {
         this.api = eveapi.create(this.options, this.storage, this.remoteApi);

         this.onStarted();
      }
   };

   this.registerBroadcastHandler = function(broadcastName)
   {
      var self = this;
      var handler = this['onBroadcast' + broadcastName];

      this.amqp.on('broadcast:' + broadcastName, function(header, body)
      {
         handler.call(self, header, body);
      });
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastEveApiRequest = function(header, body)
   {
      var parameters = body.parameters;
      var correlationId = header.correlationId;
      var apiFunction = eveapi.ApiFunctions[body.apiFunctionName];

      if (apiFunction)
      {
         var self = this;

         this.api.request(apiFunction, parameters, function(err, result)
         {
            self.onApiResult(correlationId, err, result);
         });
      }
      else
      {
         var response = this.createErrorResponse(404, 'Unknown API function [' + apiFunctionName + ']');

         this.eveapiMsg.respond(correlationId, response);
      }
   };

   this.onApiResult = function(correlationId, err, result)
   {
      if (err)
      {
         var response = this.createErrorResponse(500, 'Server Error');

         this.eveapiMsg.respond(correlationId, response);
      }
      else
      {
         this.eveapiMsg.respond(correlationId, result);
      }
   };

   this.createErrorResponse = function(code, message)
   {
      var response =
      {
         err:
         {
            causes: [
            {
               code: code,
               message: message
            } ]
         }
      };

      return response;
   };
}
util.inherits(EveApiComponent, Component);

module.exports = EveApiComponent;
