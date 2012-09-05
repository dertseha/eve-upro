/**
 * Location tracker model entity
 */
upro.model.LocationTracker = Class.create(
{
   initialize: function()
   {
      this.locationsByCharacter = {};
   },

   /**
    * Set the location for a specific character
    * 
    * @param characterId identifying the character
    * @param locationInfo the info to store
    */
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

   /**
    * Returns the location info of given character
    * 
    * @param characterId
    * @returns the object stored by setLocationForCharacter() or undefined
    */
   getLocationByCharacter: function(characterId)
   {
      return this.locationsByCharacter[characterId];
   }
});
