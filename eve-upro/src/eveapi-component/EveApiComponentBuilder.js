var util = require('util');

var ComponentBuilder = require('../components/ComponentBuilder.js');
var EveApiComponent = require('./EveApiComponent.js');

function EveApiComponentBuilder()
{
   EveApiComponentBuilder.super_.call(this);

   this.options = {};
   this.remoteApi = null; // used for tests

   this.setOptions = function(options)
   {
      this.options = options;
   };

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'eveapi';
   };

   /** {@inheritDoc} */
   this.getServiceDependencies = function()
   {
      return [ 'amqp', 'eveapi-msg', 'mongodb' ];
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      return new EveApiComponent(services, this.options, this.remoteApi);
   };
}
util.inherits(EveApiComponentBuilder, ComponentBuilder);

module.exports = EveApiComponentBuilder;
