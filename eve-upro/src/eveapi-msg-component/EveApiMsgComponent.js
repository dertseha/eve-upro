var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');

var Component = require('../components/Component.js');
var busMessages = require('../model/BusMessages.js');

function EveApiMsgComponent(services)
{
   EveApiMsgComponent.super_.call(this);

   this.msgBus = services['msgBus'];

   this.exchange = null;

   /** {@inheritDoc} */
   this.start = function()
   {
      this.onStarted();
   };

   /** {@inheritDoc} */
   this.tearDown = function()
   {

   };

   this.request = function(apiFunctionName, parameters, correlationId)
   {
      var header =
      {
         type: busMessages.Broadcasts.EveApiRequest.name,
         correlationId: correlationId
      };
      var body =
      {
         apiFunctionName: apiFunctionName,
         parameters: parameters
      };

      this.msgBus.broadcast(header, body);
   };

   this.respond = function(correlationId, response)
   {
      var header =
      {
         type: busMessages.Broadcasts.EveApiResponse.name,
         correlationId: correlationId
      };
      var body =
      {
         response: response
      };

      this.msgBus.broadcast(header, body);
   };
}
util.inherits(EveApiMsgComponent, Component);

module.exports = EveApiMsgComponent;
