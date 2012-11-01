var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');

var Component = require('./Component.js');
var busMessages = require('../model/BusMessages.js');

/**
 * 
 */
function MsgBusComponent(options)
{
   MsgBusComponent.super_.call(this);

   this.options = options;

   /** {@inheritDoc} */
   this.start = function()
   {
      this.onStarted();
   };

   this.getLocalQueueName = function()
   {
      return '';
   };

   this.broadcast = function(header, body, directQueueName)
   {
      var self = this;
      var broadcast = busMessages.Broadcasts[header.type];

      if (!broadcast)
      {
         logger.warn('Unregistered broadcast [' + header.type + ']');
      }
      else if (this.options.validateBroadcasts)
      {
         if (!broadcast.header.isValid(header))
         {
            logger.warn('Broadcast header is invalid [' + header.type + ']: ' + JSON.stringify(header));
         }
         if (!broadcast.body.isValid(body))
         {
            logger.warn('Broadcast body is invalid [' + header.type + ']: ' + JSON.stringify(body));
         }
      }

      process.nextTick(function()
      {
         self.emitBroadcast(header, body);
      });
   };

   this.emitBroadcast = function(header, body)
   {
      this.emit('broadcast:' + header.type, header, body);
      this.emit('broadcast', header, body);
   };
}
util.inherits(MsgBusComponent, Component);

module.exports = MsgBusComponent;
