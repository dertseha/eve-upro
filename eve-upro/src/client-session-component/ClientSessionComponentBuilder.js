var util = require('util');

var ComponentBuilder = require('../components/ComponentBuilder.js');
var ClientSessionComponent = require('./ClientSessionComponent.js');

function ClientSessionComponentBuilder()
{
   ClientSessionComponentBuilder.super_.call(this);

   this.options = {};

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'client-session';
   };

   /** {@inheritDoc} */
   this.getServiceDependencies = function()
   {
      return [ 'amqp', 'eveapi-msg', 'http-server', 'character-agent' ];
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      var options =
      {
         security: this.options.security || {}
      };

      return new ClientSessionComponent(services, options);
   };
}
util.inherits(ClientSessionComponentBuilder, ComponentBuilder);

module.exports = ClientSessionComponentBuilder;
