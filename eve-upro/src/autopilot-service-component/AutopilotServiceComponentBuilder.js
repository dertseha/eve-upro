var util = require('util');

var ComponentBuilder = require('../components/ComponentBuilder.js');
var AutopilotServiceComponent = require('./AutopilotServiceComponent.js');

function AutopilotServiceComponentBuilder()
{
   AutopilotServiceComponentBuilder.super_.call(this);

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'autopilot-service';
   };

   /** {@inheritDoc} */
   this.getServiceDependencies = function()
   {
      return [ 'msgBus', 'mongodb', 'character-agent' ];
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      return new AutopilotServiceComponent(services);
   };
}
util.inherits(AutopilotServiceComponentBuilder, ComponentBuilder);

module.exports = AutopilotServiceComponentBuilder;
