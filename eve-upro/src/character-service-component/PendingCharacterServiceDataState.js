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

   /** {@inheritDoc} */
   this.activate = function()
   {
      this.character.serviceData['character-service'] = this;

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

            newState.activate();
            activated = true;
         }
         else if (!activated)
         {
            var newState = new ActiveCharacterServiceDataState(self.character, self.service, null);

            newState.activate();
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
}
util.inherits(PendingCharacterServiceDataState, AbstractCharacterServiceDataState);

module.exports = PendingCharacterServiceDataState;
