/**
 * Location tracker model entity
 */
upro.model.LocationTracker = Class.create(
{
   initialize: function()
   {
      this.locationsByCharacter = {};
   },

   setLocationForCharacter: function(characterId, locationInfo)
   {
      if (locationInfo)
      {
         this.locationsByCharacter[characterId] = locationInfo;
      }
      else
      {
         delete this.locationsByCharacter[characterId];
      }
   },

   getLocationByCharacter: function(characterId)
   {
      return this.locationsByCharacter[characterId];
   }
});
