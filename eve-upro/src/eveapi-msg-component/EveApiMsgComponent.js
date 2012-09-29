var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');

var Component = require('../components/Component.js');

function EveApiMsgComponent(services)
{
   EveApiMsgComponent.super_.call(this);

   this.amqp = services.amqp;

   this.exchange = null;

   /** {@inheritDoc} */
   this.start = function()
   {
      this.requestExchange();
   };

   /** {@inheritDoc} */
   this.tearDown = function()
   {
      if (this.exchange)
      {
         // this.exchange.close();
         this.exchange = null;
      }
   };

   this.requestExchange = function()
   {
      var self = this;
      var exchangeOptions =
      {
         type: 'fanout'
      };

      this.amqp.getConnection().exchange('eveapi', exchangeOptions, function(exchange)
      {
         self.exchange = exchange;
         self.onStartProgress();
      });
   };

   this.onStartProgress = function(callback)
   {
      if (this.exchange)
      {
         this.onStarted();
      }
   };

   this.allocateConsumerQueue = function(callback)
   {
      var self = this;
      var queueOptions =
      {
         exclusive: true
      // autoDelete: false
      };

      var q = this.amqp.getConnection().queue('eveapi-incoming', queueOptions, function(queue)
      {
         logger.info('Allocated queue [' + queue.name + '], attempting binding');
         queue.bind(self.exchange.name, '#');
         queue.once('queueBindOk', function()
         {
            callback(queue);
         });
      });
      q.on('error', function(err)
      {
         logger.warn('Error accessing queue for EveApiMsgComponent. Retrying after timeout.',
         {
            error: err
         });
         setTimeout(function()
         {
            self.allocateConsumerQueue(callback);
         }, 5000);
      });
   };

   this.request = function(apiFunctionName, parameters, responseQueueName, correlationId)
   {
      var data =
      {
         request:
         {
            apiFunctionName: apiFunctionName,
            parameters: parameters
         }
      };
      var routingKey = '';

      this.exchange.publish(routingKey, JSON.stringify(data),
      {
         replyTo: responseQueueName,
         correlationId: '' + correlationId,
         // contentType: 'text/plain',
         // contentEncoding: 'utf8',
         // mandatory: true,
         // immediate: true,
         deliveryMode: 1
      });

   };

   this.respond = function(responseQueueName, correlationId, response)
   {
      var data =
      {
         response: response
      };
      var routingKey = responseQueueName;

      this.amqp.getConnection().publish(routingKey, JSON.stringify(data),
      {
         correlationId: correlationId
      });
   };
}
util.inherits(EveApiMsgComponent, Component);

module.exports = EveApiMsgComponent;
