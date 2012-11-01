var util = require('util');

var ComponentBuilder = require('../components/ComponentBuilder.js');
var CharacterAgentComponent = require('./CharacterAgentComponent.js');

function CharacterAgentComponentBuilder()
{
   CharacterAgentComponentBuilder.super_.call(this);

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'character-agent';
   };

   /** {@inheritDoc} */
   this.getServiceDependencies = function()
   {
      return [ 'msgBus' ];
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      return new CharacterAgentComponent(services);
   };
}
util.inherits(CharacterAgentComponentBuilder, ComponentBuilder);

module.exports = CharacterAgentComponentBuilder;
