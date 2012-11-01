var util = require('util');

var ComponentBuilder = require('../components/ComponentBuilder.js');
var RouteServiceComponent = require('./RouteServiceComponent.js');

function RouteServiceComponentBuilder()
{
   RouteServiceComponentBuilder.super_.call(this);

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'route-service';
   };

   /** {@inheritDoc} */
   this.getServiceDependencies = function()
   {
      return [ 'msgBus', 'mongodb', 'character-agent' ];
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      return new RouteServiceComponent(services);
   };
}
util.inherits(RouteServiceComponentBuilder, ComponentBuilder);

module.exports = RouteServiceComponentBuilder;
