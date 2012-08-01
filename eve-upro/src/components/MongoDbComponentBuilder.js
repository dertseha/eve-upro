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
         hostname: this.options.hostname || 'localhost',
         port: this.options.port,
         db: this.options.db || 'eve-upro_live',

         serverOptions: this.options.serverOptions ||
         {
            auto_reconnect: true
         },

         username: this.options.username,
         password: this.options.password
      };

      return new MongoDbComponent(options);
   };
}
util.inherits(MongoDbComponentBuilder, ComponentBuilder);

module.exports = MongoDbComponentBuilder;
