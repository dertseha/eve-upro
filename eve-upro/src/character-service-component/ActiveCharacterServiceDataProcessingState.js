var util = require('util');

var CharacterServiceDataProcessingState = require('./CharacterServiceDataProcessingState.js');
var IgnoringResultNotifier = require('./IgnoringResultNotifier.js');

/**
 * The active processing state lets the service data process the requests (broadcasts) and delegates notifications to a
 * dedicated state.
 * 
 * @param serviceData for which service data this state is for
 */
function ActiveCharacterServiceDataProcessingState(serviceData)
{
   this.serviceData = serviceData;
   this.resultNotifier = new IgnoringResultNotifier();

   /** {@inheritDoc} This method lets the service data broadcast the state data specifically for the session */
   this.onCharacterSessionAdded = function(sessionId)
   {
      var responseQueue = this.serviceData.character.getResponseQueue(sessionId);
      var interest = [
      {
         scope: 'Session',
         id: sessionId
      } ];

      this.serviceData.broadcastStateData(interest, responseQueue);
   };

   /**
    * {@inheritDoc} This method calls the processing method of the service data and then lets the result notifier handle
    * the results
    */
   this.processBroadcast = function(header, body)
   {
      var processor = this.serviceData['process' + header.type];
      var notifyNames = processor.call(this.serviceData, header, body);

      this.resultNotifier.notifyRequestResults(notifyNames);
   };
}
util.inherits(ActiveCharacterServiceDataProcessingState, CharacterServiceDataProcessingState);

module.exports = ActiveCharacterServiceDataProcessingState;
