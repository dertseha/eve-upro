var amqp = require('amqp');
var util = require('util');

var Component = require('./Component.js');
var busMessages = require('../model/BusMessages.js');

/*
 * 
 * API info: https://github.com/postwait/node-amqp
 */
function AmqpComponent(options)
{
   AmqpComponent.super_.call(this);

   this.options = options;

   this.connection = null;

   this.exchange = null;
   this.queue = null;

   /** {@inheritDoc} */
   this.start = function()
   {
      this.requestConnection();
   };

   /** {@inheritDoc} */
   this.tearDown = function()
   {
      if (this.queue)
      {
         this.queue.close();
         this.queue = null;
      }
      if (this.exchange)
      {
         this.exchange.close();
         this.exchange = null;
      }
      if (this.connection)
      {
         this.connection.end();
         this.connection = null;
      }
   };

   this.requestConnection = function()
   {
      var self = this;

      var connection = amqp.createConnection(this.options);

      /*
       * connection.on('error', function(message) { console.log('AMQP error: ' + message); });
       */
      connection.on('ready', function()
      {
         self.connection = connection;
         self.requestExchange();
      });
   };

   this.onStartProgress = function()
   {
      if (this.connection && this.exchange && this.queue)
      {
         this.onStarted();
      }
   };

   this.getConnection = function()
   {
      return this.connection;
   };

   this.allocateResponseQueue = function(callback)
   {
      var queueOptions =
      {
         exclusive: true
      };

      this.connection.queue('', queueOptions, function(queue)
      {
         queue.bind('#'); // explicitly bind to the default exchange to receive the 'queueBindOk' event
         queue.on('queueBindOk', function()
         {
            callback(queue);
         });
      });
   };

   this.requestExchange = function()
   {
      var self = this;
      var exchangeOptions =
      {
         type: 'fanout'
      };

      this.connection.exchange('upro-radio', exchangeOptions, function(exchange)
      {
         self.exchange = exchange;
         self.allocateConsumerQueue();
      });
   };

   this.allocateConsumerQueue = function()
   {
      var self = this;
      var queueOptions =
      {
         autoDelete: true
      };

      var q = this.connection.queue('', queueOptions, function(queue)
      {
         queue.bind(self.exchange.name, '#');
         queue.subscribe(function(message, headers, deliveryInfo)
         {
            self.onIncomingMessage(message, headers, deliveryInfo);
         });
         queue.once('queueBindOk', function()
         {
            self.queue = queue;
            self.onStartProgress();
         });
      });
      q.on('error', function(err)
      {
         console.log('failed queue!\n' + err);
      }); // TODO: we're lost right now
   };

   this.getLocalQueueName = function()
   {
      return this.queue.name;
   };

   this.broadcast = function(header, body, directQueueName)
   {
      var data =
      {
         header: header,
         body: body
      };
      var routingKey = directQueueName || 'broadcast';

      if (!busMessages.Broadcasts[header.type])
      {
         // TODO: log
         console.log('WARN: unregistered broadcast [' + header.type + ']');
      }

      this.exchange.publish(routingKey, JSON.stringify(data),
      {
         deliveryMode: 1
      });
   };

   this.onIncomingMessage = function(message, headers, deliveryInfo)
   {
      var data = JSON.parse(message.data);

      // console.log('MSG: ' + message.data);
      this.emit('broadcast', data.header, data.body);
      this.emit('broadcast:' + data.header.type, data.header, data.body);
   };
}
util.inherits(AmqpComponent, Component);

module.exports = AmqpComponent;
