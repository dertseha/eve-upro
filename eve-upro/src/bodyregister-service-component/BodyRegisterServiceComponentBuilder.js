var util = require('util');

var ComponentBuilder = require('../components/ComponentBuilder.js');
var BodyRegisterServiceComponent = require('./BodyRegisterServiceComponent.js');

function BodyRegisterServiceComponentBuilder()
{
   BodyRegisterServiceComponentBuilder.super_.call(this);

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'bodyregister-service';
   };

   /** {@inheritDoc} */
   this.getServiceDependencies = function()
   {
      return [ 'msgBus', 'mongodb' ];
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      return new BodyRegisterServiceComponent(services);
   };
}
util.inherits(BodyRegisterServiceComponentBuilder, ComponentBuilder);

module.exports = BodyRegisterServiceComponentBuilder;
