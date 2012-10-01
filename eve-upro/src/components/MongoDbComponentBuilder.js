var util = require('util');

var ComponentBuilder = require('./ComponentBuilder.js');
var MongoDbComponent = require('./MongoDbComponent.js');

function MongoDbComponentBuilder()
{
   MongoDbComponentBuilder.super_.call(this);

   this.options = {};

   this.setOptions = function(options)
   {
      this.options = options;
   };

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'mongodb';
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      var options =
      {
         url: this.options.url,
         serverOptions: this.options.serverOptions ||
         {
            auto_reconnect: true
         }
      };

      return new MongoDbComponent(options);
   };
}
util.inherits(MongoDbComponentBuilder, ComponentBuilder);

module.exports = MongoDbComponentBuilder;
