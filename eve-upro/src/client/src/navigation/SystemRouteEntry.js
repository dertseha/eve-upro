/**
 * A system route entry marks a solar system along a list of a route. Apart of the system itself, the type of the entry
 * is stored and the type of the jump /to reach the next system/ is stored.
 */
upro.nav.SystemRouteEntry = Class.create(
{
   initialize: function(solarSystem, entryType, jumpType)
   {
      this.solarSystem = solarSystem;
      this.entryType = entryType;
      this.jumpType = jumpType;
   },

   /**
    * @returns String presentation
    */
   toString: function()
   {
      return this.entryType + " [" + this.solarSystem.name + "] " + this.jumpType + "|";
   },

   /**
    * Creates a raw data presentation of this entry
    * 
    * @returns a raw data object
    */
   toRawData: function()
   {
      var rawData =
      {
         entryType: this.entryType,
         solarSystemId: this.solarSystem.id,
         nextJumpType: this.jumpType
      };

      return rawData;
   },

   /**
    * Returns the solar system
    * 
    * @return the solar system
    */
   getSolarSystem: function()
   {
      return this.solarSystem;
   },

   /**
    * Returns the entry type
    * 
    * @return the entry type
    */
   getEntryType: function()
   {
      return this.entryType;
   },

   /**
    * Returns the jump type to reach the next system
    * 
    * @return the jump type to reach the next system
    */
   getJumpType: function()
   {
      return this.jumpType;
   },

   /**
    * @returns {upro.nav.SystemRouteEntry} a copy of this with a given entry type
    */
   asEntryType: function(entryType)
   {
      return new upro.nav.SystemRouteEntry(this.getSolarSystem(), entryType, this.jumpType);
   },

   /**
    * @returns {upro.nav.SystemRouteEntry} a copy of this with given jump type
    */
   withJumpType: function(jumpType)
   {
      return new upro.nav.SystemRouteEntry(this.getSolarSystem(), this.getEntryType(), jumpType);
   },

   /**
    * Returns true if the given other entry is allowed to follow this entry
    * 
    * @param other the other entry to test
    * @return true if the given other entry is allowed to follow this entry
    */
   acceptsNext: function(other)
   {
      var rCode = false;

      if ((other.entryType == upro.nav.SystemRouteEntry.EntryType.Checkpoint)
            || (this.solarSystem != other.solarSystem))
      {
         rCode = true;
      }

      return rCode;
   }

});

upro.nav.SystemRouteEntry.EntryType =
{
   /** A system to be passed, in defined order along other checkpoints */
   Checkpoint: "Checkpoint",
   /** A system to be passed, regardless of order between checkpoints */
   Waypoint: "Waypoint",
   /** A system determined to be necessary to reach next waypoint or checkpoint */
   Transit: "Transit"
};
