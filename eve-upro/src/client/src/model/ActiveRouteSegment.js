/**
 * A segment of the active route
 */
upro.model.ActiveRouteSegment = Class.create(upro.model.AbstractActiveRouteSegment,
{
   initialize: function($super, id)
   {
      $super(upro.model.ActiveRouteSegmentTerminator.INSTANCE);

      this.id = id;
      this.entries = [];
   },

   addEntry: function(solarSystem, entryType, jumpType)
   {
      var entry = new upro.nav.SystemRouteEntry(solarSystem, entryType, jumpType);

      this.entries.push(entry);
   },

   /** {@inheritDoc} */
   hasId: function(id)
   {
      return this.id == id;
   },

   /** {@inheritDoc} */
   addId: function(ids)
   {
      if (ids.indexOf(this.id) < 0)
      {
         ids.push(this.id);
      }

      return ids;
   },

   /** {@inheritDoc} */
   setRoute: function(route)
   {
      var that = this;

      this.entries = [];
      route.forEach(function(entry)
      {
         that.entries.push(entry);
      });
   },

   /** {@inheritDoc} */
   resetRouteToMinimum: function()
   {
      for ( var i = this.entries.length - 1; i >= 0; i--)
      {
         var entry = this.entries[i];

         if (entry.getEntryType() != upro.nav.SystemRouteEntry.EntryType.Transit)
         {
            this.entries[i] = entry.withJumpType(upro.nav.JumpType.None);
         }
         else
         {
            this.entries.splice(i, 1);
         }
      }
   },

   /** {@inheritDoc} */
   addToRoute: function(route)
   {
      this.entries.forEach(function(entry)
      {
         route.push(entry);
      });

      return route;
   },

   /** {@inheritDoc} */
   containsNonTransitSystem: function(solarSystem)
   {
      var rCode = false;

      this.entries.forEach(function(entry)
      {
         if ((entry.getEntryType() != upro.nav.SystemRouteEntry.EntryType.Transit)
               && (entry.getSolarSystem().getId() === solarSystem.getId()))
         {
            rCode = true;
         }
      });

      return rCode;
   },

   /** {@inheritDoc} */
   canWaypointBeAdded: function(solarSystem)
   {
      return (this.entries.length == 0) || !this.containsNonTransitSystem(solarSystem);
   },

   /** {@inheritDoc} */
   addCheckpoint: function(solarSystem, jumpType)
   {
      this.setNext(upro.model.ActiveRouteSegment.createSegment(solarSystem, jumpType));

      return this.getNext();
   },

   /** {@inheritDoc} */
   addWaypoint: function(solarSystem, jumpType)
   {
      this.addEntry(solarSystem, upro.nav.SystemRouteEntry.EntryType.Waypoint, jumpType);

      return this;
   },

   /** {@inheritDoc} */
   addTransit: function(solarSystem, jumpType)
   {
      this.addEntry(solarSystem, upro.nav.SystemRouteEntry.EntryType.Transit, jumpType);

      return this;
   }
});

/**
 * Creates a new segment with the given solar system as starting checkpoint
 * 
 * @param solarSystem the solar system to use as starting checkpoint
 * @param jumpType the jump type of the first entry
 * @returns {upro.model.ActiveRouteSegment} instance
 */
upro.model.ActiveRouteSegment.createSegment = function(solarSystem, jumpType)
{
   var id = upro.Uuid.newV4();
   var segment = new upro.model.ActiveRouteSegment(id);

   segment.addEntry(solarSystem, upro.nav.SystemRouteEntry.EntryType.Checkpoint, jumpType);

   return segment;
};
