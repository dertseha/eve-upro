var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var CharacterServiceDataProcessingState = require('./CharacterServiceDataProcessingState.js');
var ActiveCharacterServiceDataProcessingState = require('./ActiveCharacterServiceDataProcessingState.js');
var ActiveResultNotifier = require('./ActiveResultNotifier.js');

/**
 * The pending processing state queues up requests, queries character data and makes an active processing state live
 * when the data is loaded.
 * 
 * @param serviceData for which this state is for
 */
function PendingCharacterServiceDataProcessingState(serviceData)
{
   this.serviceData = serviceData;
   this.broadcastQueue = [];

   /**
    * {@inheritDoc} This method ignores the session as it can not inform it about any data
    */
   this.onCharacterSessionAdded = function(sessionId)
   {

   };

   /**
    * {@inheritDoc} This method queues the broadcast for later replay into the active state
    */
   this.processBroadcast = function(header, body)
   {
      var broadcast =
      {
         header: header,
         body: body
      };

      this.broadcastQueue.push(broadcast);
   };

   /**
    * Starts the state machine
    */
   this.activate = function()
   {
      var self = this;
      var filter =
      {
         _id: serviceData.character.getCharacterId()
      };
      var firstDataReturned = false;

      this.serviceData.service.mongodb.getData('CharacterData', filter, function(err, id, data)
      {
         if (!firstDataReturned)
         {
            self.onFirstDataResult(data);
            firstDataReturned = true;
         }
      });
   };

   /**
    * Handler of the first data result from the storage
    * 
    * @param data either null or the raw data
    */
   this.onFirstDataResult = function(data)
   {
      var newState = this.getActiveProcessingState();

      // restore the data
      this.serviceData.applyCharacterData(data);

      // now apply all requested changes
      this.broadcastQueue.forEach(function(broadcast)
      {
         newState.processBroadcast(broadcast.header, broadcast.body);
      });

      // save the result of any change and broadcast the current data
      this.serviceData.saveCharacterData();
      this.serviceData.broadcastStateData();

      // make new active state current
      newState.resultNotifier = new ActiveResultNotifier(this.serviceData);
      this.serviceData.processingState = newState;
   };

   /**
    * Factory method to return the active state
    * 
    * @returns the active state that should follow this state
    */
   this.getActiveProcessingState = function()
   {
      return new ActiveCharacterServiceDataProcessingState(this.serviceData);
   };
}
util.inherits(PendingCharacterServiceDataProcessingState, CharacterServiceDataProcessingState);

module.exports = PendingCharacterServiceDataProcessingState;
