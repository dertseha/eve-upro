var util = require('util');

var Component = require('../../components/Component.js');

function TestClientComponent(services)
{
   TestClientComponent.super_.call(this);

   this.amqp = services['amqp'];
   this.eveapiMsg = services['eveapi-msg'];

   this.responseQueue = null;

   this.getResponseQueueName = function()
   {
      return this.responseQueue.name;
   };

   /** {@inheritDoc} */
   this.start = function()
   {
      this.requestResponseQueue();
   };

   this.requestResponseQueue = function()
   {
      var self = this;

      this.amqp.allocateResponseQueue(function(queue)
      {
         self.onResponseQueue(queue);
      });
   };

   this.onStartProgress = function(callback)
   {
      if (this.responseQueue)
      {
         this.onStarted();
      }
   };

   this.onResponseQueue = function(queue)
   {
      var self = this;

      this.responseQueue = queue;
      this.responseQueue.subscribe(function(message, headers, deliveryInfo)
      {
         self.onMessage(message, headers, deliveryInfo);
      });

      this.onStartProgress();
   };

   this.onMessage = function(message, headers, deliveryInfo)
   {
      this.emit('reply', JSON.parse(message.data), deliveryInfo.correlationId);
   };
}
util.inherits(TestClientComponent, Component);

module.exports = TestClientComponent;
