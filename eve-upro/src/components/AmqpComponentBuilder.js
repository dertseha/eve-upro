var util = require('util');

var ComponentBuilder = require('./ComponentBuilder.js');
var AmqpComponent = require('./AmqpComponent.js');

function AmqpComponentBuilder()
{
   AmqpComponentBuilder.super_.call(this);

   this.options = {};

   this.setOptions = function(options)
   {
      this.options = options;
   };

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'amqp';
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      return new AmqpComponent(this.options);
   };
}
util.inherits(AmqpComponentBuilder, ComponentBuilder);

module.exports = AmqpComponentBuilder;
