var util = require('util');

var Component = require('./AbstractCharacterServiceDataState.js');
var busMessages = require('../model/BusMessages.js');

var AbstractCharacterServiceDataState = require('./AbstractCharacterServiceDataState.js');
var ActiveCharacterServiceDataState = require('./ActiveCharacterServiceDataState.js');

/**
 * The pending state queries the current data from the storage and holds any immediate change requests in memory.
 * 
 * @param character for which the state is
 * @param service in which service this state runs
 */
function PendingCharacterServiceDataState(character, service)
{
   PendingCharacterServiceDataState.super_.call(this, character, service);

   this.pendingIgnoreSolarSystemRequests = [];

   /** {@inheritDoc} */
   this.activate = function()
   {
      this.character.serviceData['character-service'].dataState = this;

      var self = this;
      var filter =
      {
         _id: this.character.getCharacterId()
      };
      var activated = false;

      this.service.mongodb.getData('CharacterData', filter, function(err, id, data)
      {
         if (!activated)
         {
            var newState = new ActiveCharacterServiceDataState(self.character, self.service, data);

            newState.setActiveGalaxyId(self.rawData.activeGalaxyId);
            self.pendingIgnoreSolarSystemRequests.forEach(function(request)
            {
               newState.handleIgnoreSolarSystem(request);
            });

            newState.activate();
            activated = true;
         }
      });
   };

   /** {@inheritDoc} */
   this.onBroadcastClientRequestSetActiveGalaxy = function(header, body)
   {
      if (body.galaxyId)
      {
         this.rawData.activeGalaxyId = body.galaxyId;
      }
   };

   /** {@inheritDoc} */
   this.onBroadcastClientRequestSetIgnoredSolarSystem = function(header, body)
   {
      this.pendingIgnoreSolarSystemRequests.push(body);
   };
}
util.inherits(PendingCharacterServiceDataState, AbstractCharacterServiceDataState);

module.exports = PendingCharacterServiceDataState;
