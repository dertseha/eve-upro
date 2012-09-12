var util = require('util');

var ComponentBuilder = require('../components/ComponentBuilder.js');
var JumpCorridorServiceComponent = require('./JumpCorridorServiceComponent.js');

function JumpCorridorServiceComponentBuilder()
{
   JumpCorridorServiceComponentBuilder.super_.call(this);

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'jumpCorridor-service';
   };

   /** {@inheritDoc} */
   this.getServiceDependencies = function()
   {
      return [ 'amqp', 'mongodb', 'character-agent' ];
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      return new JumpCorridorServiceComponent(services);
   };
}
util.inherits(JumpCorridorServiceComponentBuilder, ComponentBuilder);

module.exports = JumpCorridorServiceComponentBuilder;
