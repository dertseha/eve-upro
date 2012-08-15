var util = require('util');

var Component = require('./AbstractCharacterServiceDataState.js');
var busMessages = require('../model/BusMessages.js');

var AbstractCharacterServiceDataState = require('./AbstractCharacterServiceDataState.js');

/**
 * The active state is entered when data is returned from the storage
 * 
 * @param character for which the state is
 * @param service in which service this state runs
 * @param initData the initial data as returned from the storage
 */
function ActiveCharacterServiceDataState(character, service, initData)
{
   ActiveCharacterServiceDataState.super_.call(this, character, service);

   this.rawData.activeGalaxyId = 9;
   if (initData)
   {
      if (initData.activeGalaxyId)
      {
         this.rawData.activeGalaxyId = initData.activeGalaxyId;
      }
   }

   /**
    * Sets the active galaxy value, if changed
    * 
    * @param galaxyId the value to set
    * @returns true if the value has been modified
    */
   this.setActiveGalaxyId = function(galaxyId)
   {
      var rCode = false;

      if (galaxyId && (this.rawData.activeGalaxyId != galaxyId))
      {
         this.rawData.activeGalaxyId = galaxyId;
         rCode = true;
      }

      return rCode;
   };

   /** {@inheritDoc} */
   this.activate = function()
   {
      this.character.serviceData['character-service'].dataState = this;

      this.service.saveCharacterData(this.character);
      this.broadcastStateData(this.service.getInterest(this.character));
   };

   /** {@inheritDoc} */
   this.onBroadcastClientRequestSetActiveGalaxy = function(header, body)
   {
      if (this.setActiveGalaxyId(body.galaxyId))
      {
         this.service.saveCharacterData(this.character);
         this.service.broadcastActiveGalaxy(this.character, this.service.getInterest(this.character));
      }
   };

   /** {@inheritDoc} */
   this.onCharacterSessionAdded = function(sessionId)
   {
      var responseQueue = this.character.getResponseQueue(sessionId);
      var interest = [
      {
         scope: 'Session',
         id: sessionId
      } ];

      this.broadcastStateData(interest, responseQueue);
   };

   /**
    * Broadcasts the complete state data of the character with given broadcast parameters
    * 
    * @param interest the interest for which the broadcast is
    * @param queue the queue to use
    */
   this.broadcastStateData = function(interest, queue)
   {
      this.service.broadcastActiveGalaxy(this.character, interest, queue);
   };
}
util.inherits(ActiveCharacterServiceDataState, AbstractCharacterServiceDataState);

module.exports = ActiveCharacterServiceDataState;
