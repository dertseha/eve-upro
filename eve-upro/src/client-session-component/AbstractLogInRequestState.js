var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');

function AbstractLogInRequestState(request)
{
   /**
    * Handles a response message from the EVE API component. Checks basic error information and forwards it only if the
    * data is valid.
    */
   this.onEveApiMessage = function(struct)
   {
      if (struct.err)
      {
         logger.error('Failed login request, technical: ' + JSON.stringify(struct.err));
         request.done('Request Error', null);
      }
      else if (struct.response.err)
      {
         logger.warn('Failed login request, API: ' + JSON.stringify(struct.response.err));
         request.done(null, false);
      }
      else
      {
         this.handleEveApiResult(struct);
      }
   };

   this.handleEveApiResult = function(struct)
   {
      request.done('Not Implemented', null);
   };
}

module.exports = AbstractLogInRequestState;
