var util = require('util');

var ComponentBuilder = require('../components/ComponentBuilder.js');
var CharacterServiceComponent = require('./CharacterServiceComponent.js');

function CharacterServiceComponentBuilder()
{
   CharacterServiceComponentBuilder.super_.call(this);

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'character-service';
   };

   /** {@inheritDoc} */
   this.getServiceDependencies = function()
   {
      return [ 'amqp', 'mongodb', 'character-agent' ];
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      return new CharacterServiceComponent(services);
   };
}
util.inherits(CharacterServiceComponentBuilder, ComponentBuilder);

module.exports = CharacterServiceComponentBuilder;
