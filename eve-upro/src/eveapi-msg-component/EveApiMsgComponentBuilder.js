var util = require('util');

var ComponentBuilder = require('../components/ComponentBuilder.js');
var EveApiMsgComponent = require('./EveApiMsgComponent.js');

function EveApiMsgComponentBuilder()
{
   EveApiMsgComponentBuilder.super_.call(this);

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'eveapi-msg';
   };

   /** {@inheritDoc} */
   this.getServiceDependencies = function()
   {
      return [ 'amqp' ];
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      return new EveApiMsgComponent(services);
   };
}
util.inherits(EveApiMsgComponentBuilder, ComponentBuilder);

module.exports = EveApiMsgComponentBuilder;
