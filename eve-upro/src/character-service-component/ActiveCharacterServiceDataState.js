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
   this.rawData.ignoredSolarSystems = [ 30000142 ]; // Jita

   if (initData)
   {
      if (initData.activeGalaxyId)
      {
         this.rawData.activeGalaxyId = initData.activeGalaxyId;
      }
      if (initData.ignoredSolarSystems)
      {
         this.rawData.ignoredSolarSystems = initData.ignoredSolarSystems;
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

   /**
    * Handles an ignore solar system request
    * 
    * @param the body of a solar system ignorance change
    * @returns true if the list has been modified
    */
   this.handleIgnoreSolarSystem = function(request)
   {
      var rCode = false;
      var index = this.rawData.ignoredSolarSystems.indexOf(request.solarSystemId);

      if (request.ignore && (index < 0))
      {
         this.rawData.ignoredSolarSystems.push(request.solarSystemId);
         rCode = true;
      }
      else if (!request.ignore && (index >= 0))
      {
         var part1 = this.rawData.ignoredSolarSystems.slice(0, index);
         var part2 = this.rawData.ignoredSolarSystems.slice(index + 1);

         this.rawData.ignoredSolarSystems = part1.concat(part2);
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

   /**
    * Broadcasts the complete state data of the character with given broadcast parameters
    * 
    * @param interest the interest for which the broadcast is
    * @param queue the queue to use
    */
   this.broadcastStateData = function(interest, queue)
   {
      this.service.broadcastActiveGalaxy(this.character, interest, queue);
      this.service.broadcastIgnoredSolarSystems(this.character, interest, queue);
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
   this.onBroadcastClientRequestSetIgnoredSolarSystem = function(header, body)
   {
      if (this.handleIgnoreSolarSystem(body))
      {
         this.service.saveCharacterData(this.character);
         this.service.broadcastIgnoredSolarSystems(this.character, this.service.getInterest(this.character));
      }
   };
}
util.inherits(ActiveCharacterServiceDataState, AbstractCharacterServiceDataState);

module.exports = ActiveCharacterServiceDataState;
