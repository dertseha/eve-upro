var util = require('util');

var Component = require('../../components/Component.js');
var busMessages = require('../../model/BusMessages.js');

function TestClientComponent(services)
{
   TestClientComponent.super_.call(this);

   this.msgBus = services['msgBus'];
   this.eveapiMsg = services['eveapi-msg'];

   /** {@inheritDoc} */
   this.start = function()
   {
      this.registerBroadcastHandler(busMessages.Broadcasts.EveApiResponse.name);

      this.onStarted();
   };

   this.registerBroadcastHandler = function(broadcastName)
   {
      var self = this;
      var handler = this['onBroadcast' + broadcastName];

      this.msgBus.on('broadcast:' + broadcastName, function(header, body)
      {
         handler.call(self, header, body);
      });
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastEveApiResponse = function(header, body)
   {
      var correlationId = header.correlationId;
      var struct =
      {
         response: body.response
      };

      this.emit('reply', struct, correlationId);
   };
}
util.inherits(TestClientComponent, Component);

module.exports = TestClientComponent;
