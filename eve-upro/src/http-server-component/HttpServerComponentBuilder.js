var util = require("util");

var ComponentBuilder = require('../components/ComponentBuilder.js');
var HttpServerComponent = require('./HttpServerComponent.js');

function HttpServerComponentBuilder()
{
   HttpServerComponentBuilder.super_.call(this);

   this.options =
   {
      storeOptions: {}
   };

   this.setOptions = function(options)
   {
      this.options = options;
   };

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'http-server';
   };

   /** {@inheritDoc} */
   this.getServiceDependencies = function()
   {
      return [ 'mongodb' ];
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      return new HttpServerComponent(services, this.options);
   };
}
util.inherits(HttpServerComponentBuilder, ComponentBuilder);

module.exports = HttpServerComponentBuilder;
