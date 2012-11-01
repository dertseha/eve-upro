var util = require('util');

var ComponentBuilder = require('../components/ComponentBuilder.js');
var GroupServiceComponent = require('./GroupServiceComponent.js');

function GroupServiceComponentBuilder()
{
   GroupServiceComponentBuilder.super_.call(this);

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'group-service';
   };

   /** {@inheritDoc} */
   this.getServiceDependencies = function()
   {
      return [ 'msgBus', 'mongodb', 'character-agent' ];
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      return new GroupServiceComponent(services);
   };
}
util.inherits(GroupServiceComponentBuilder, ComponentBuilder);

module.exports = GroupServiceComponentBuilder;
