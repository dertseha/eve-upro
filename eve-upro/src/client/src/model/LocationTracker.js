/**
 * Location tracker model entity
 */
upro.model.LocationTracker = Class.create(
{
   initialize: function(listener)
   {
      this.listener = listener;
      this.locationsByCharacter = {};
      this.charactersByLocation = {};
   },

   forEachLocation: function(callback)
   {
      for ( var locationId in this.charactersByLocation)
      {
         callback(locationId);
      }
   },

   getCharactersByLocation: function(locationId)
   {
      return this.charactersByLocation[locationId];
   },

   /**
    * Set the location for a specific character
    * 
    * @param characterId identifying the character
    * @param newLocationInfo the info to store
    */
   setLocationForCharacter: function(characterId, newLocationInfo)
   {
      var oldLocationInfo = this.getLocationByCharacter(characterId);
      var oldLocationId = this.getLocationId(oldLocationInfo);
      var newLocationId = this.getLocationId(newLocationInfo);
      var charList = [];
      var rCode = false;

      if (oldLocationId != newLocationId)
      {
         this.locationsByCharacter[characterId] = newLocationInfo;
         if (oldLocationInfo)
         {
            charList = this.charactersByLocation[oldLocationId];
            var index = charList.indexOf(characterId);
            var part1 = charList.slice(0, index);
            var part2 = charList.slice(index + 1);

            charList = part1.concat(part2);
            this.charactersByLocation[oldLocationId] = charList;
            this.listener.onCharactersByLocationChanged(oldLocationId, charList);
         }
         if (newLocationInfo)
         {
            charList = this.charactersByLocation[newLocationId];
            if (!charList)
            {
               charList = [];
               this.charactersByLocation[newLocationId] = charList;
            }
            charList.push(characterId);
            this.listener.onCharactersByLocationChanged(newLocationId, charList);
         }
         rCode = true;
      }

      return rCode;
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
   },

   getLocationId: function(locationInfo)
   {
      return locationInfo ? locationInfo.getId() : undefined;
   }
});
