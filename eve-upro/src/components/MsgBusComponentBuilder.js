var util = require('util');

var ComponentBuilder = require('./ComponentBuilder.js');
var MsgBusComponent = require('./MsgBusComponent.js');

function MsgBusComponentBuilder()
{
   MsgBusComponentBuilder.super_.call(this);

   this.options = {};

   this.setOptions = function(options)
   {
      this.options = options;
   };

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'msgBus';
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      return new MsgBusComponent(this.options);
   };
}
util.inherits(MsgBusComponentBuilder, ComponentBuilder);

module.exports = MsgBusComponentBuilder;
