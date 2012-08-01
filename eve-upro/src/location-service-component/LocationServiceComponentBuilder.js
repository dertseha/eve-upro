var util = require('util');

var ComponentBuilder = require('../components/ComponentBuilder.js');
var LocationServiceComponent = require('./LocationServiceComponent.js');

function LocationServiceComponentBuilder()
{
   LocationServiceComponentBuilder.super_.call(this);

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'location-service';
   };

   /** {@inheritDoc} */
   this.getServiceDependencies = function()
   {
      return [ 'amqp', 'character-agent' ];
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      return new LocationServiceComponent(services);
   };
}
util.inherits(LocationServiceComponentBuilder, ComponentBuilder);

module.exports = LocationServiceComponentBuilder;
