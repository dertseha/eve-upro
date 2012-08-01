var util = require('util');

var TestClientComponent = require('./TestClientComponent.js');
var ComponentBuilder = require('../../components/ComponentBuilder.js');

function TestClientBuilder()
{
   TestClientBuilder.super_.call(this);

   /** {@inheritDoc} */
   this.getServiceName = function()
   {
      return 'test-client';
   };

   /** {@inheritDoc} */
   this.getServiceDependencies = function()
   {
      return [ 'amqp', 'eveapi-msg' ];
   };

   /** {@inheritDoc} */
   this.getInstance = function(services)
   {
      return new TestClientComponent(services);
   };
}
util.inherits(TestClientBuilder, ComponentBuilder);

module.exports = TestClientBuilder;
