var util = require('util');

var Component = require('../components/Component.js');

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

      eveapi.initStorage(storage, function(err)
      {
         self.storage = storage;
         self.onStartProgress();
      });

      this.eveapiMsg.allocateConsumerQueue(function(queue)
      {
         self.onIncomingQueue(queue);
      });
   };

   this.onIncomingQueue = function(queue)
   {
      var self = this;

      this.queue = queue;

      this.queue.subscribe(function(message, headers, deliveryInfo)
      {
         self.onIncomingMessage(message, headers, deliveryInfo);
      });
      this.onStartProgress();
   };

   this.onStartProgress = function()
   {
      if (this.storage && this.queue)
      {
         this.api = eveapi.create(this.options, this.storage, this.remoteApi);

         this.onStarted();
      }
   };

   this.onIncomingMessage = function(message, headers, deliveryInfo)
   {
      var request = JSON.parse(message.data).request;
      var apiFunctionName = request.apiFunctionName;
      var parameters = request.parameters;
      var responseQueueName = deliveryInfo.replyTo;
      var correlationId = deliveryInfo.correlationId;
      var apiFunction = eveapi.ApiFunctions[apiFunctionName];

      if (apiFunction)
      {
         var self = this;

         this.api.request(apiFunction, parameters, function(err, result)
         {
            self.onApiResult(responseQueueName, correlationId, err, result);
         });
      }
      else
      {
         var response = this.createErrorResponse(404, 'Unknown API function [' + apiFunctionName + ']');

         this.eveapiMsg.respond(responseQueueName, correlationId, response);
      }
   };

   this.onApiResult = function(responseQueueName, correlationId, err, result)
   {
      if (err)
      {
         var response = this.createErrorResponse(500, 'Server Error');

         this.eveapiMsg.respond(responseQueueName, correlationId, response);
      }
      else
      {
         this.eveapiMsg.respond(responseQueueName, correlationId, result);
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
