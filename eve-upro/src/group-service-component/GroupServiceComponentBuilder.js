var util = require('util');

var ComponentBuilder = require('../components/ComponentBuilder.js');
var GroupServiceComponent = require('./GroupServiceComponent.js');

var Group = require('./Group.js');

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
      return [ 'amqp', 'mongodb', 'character-agent' ];
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      return new GroupServiceComponent(services, Group);
   };
}
util.inherits(GroupServiceComponentBuilder, ComponentBuilder);

module.exports = GroupServiceComponentBuilder;
