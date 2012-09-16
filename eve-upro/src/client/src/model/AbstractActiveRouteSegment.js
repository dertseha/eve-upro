/**
 * The abstract base class for a route segment entry of the active route
 */
upro.model.AbstractActiveRouteSegment = Class.create(
{
   initialize: function(nextSegment)
   {
      this.nextSegment = nextSegment;
   },

   /**
    * @param id the ID value to check
    * @returns {Boolean} true if the segment has given ID
    */
   hasId: function(id)
   {
      return false;
   },

   /**
    * Adds the ID of the segment to the given array
    * 
    * @param ids array to extend
    * @returns an array based on given array, extended with the ID
    */
   addId: function(ids)
   {
      return ids;
   },

   /**
    * @returns the next segment
    */
   getNext: function()
   {
      return this.nextSegment;
   },

   /**
    * Sets the next segment
    * 
    * @param nextSegment instance to set
    */
   setNext: function(nextSegment)
   {
      this.nextSegment = nextSegment;
   },

   /**
    * @returns {Boolean} true if the route of the segment is empty
    */
   isEmpty: function()
   {
      return true;
   },

   /**
    * Sets the route of the segment
    * 
    * @param route array of SystemRouteEntry instances
    */
   setRoute: function(route)
   {

   },

   /**
    * Resets the contained route to the minimum; Removes all Transit systems and sets all jump types to None.
    */
   resetRouteToMinimum: function()
   {

   },

   /**
    * Removes the given solar system from the segment
    * 
    * @param solarSystem solar system to remove
    * @returns {Boolean} true if the solar system was within this segment
    */
   removeSolarSystem: function(solarSystem)
   {
      return false;
   },

   /**
    * Adds the route of the segment to the given array and returns the result.
    * 
    * @param route to extend
    * @returns an array containing given route and the one from the segment.
    */
   addToRoute: function(route)
   {
      return route;
   },

   /**
    * Checks whether the route contains given solar system as a non-transit system.
    * 
    * @param solarSystem system to check
    * @returns {Boolean} true if the segment contains given solar system.
    */
   containsNonTransitSystem: function(solarSystem)
   {
      return false;
   },

   /**
    * Returns true if the given solar system can be added to the segment.
    * 
    * @param solarSystem system to check
    * @returns {Boolean} true if the waypoint can be added.
    */
   canWaypointBeAdded: function(solarSystem)
   {
      return false;
   },

   /**
    * Adds a Checkpoint system at the end of the route.
    * 
    * @param solarSystem system to add
    * @param jumpType jump type to set
    * @returns the new segment instance (if created)
    */
   addCheckpoint: function(solarSystem, jumpType)
   {
      return this;
   },

   /**
    * Adds a Waypoint system at the end of the route.
    * 
    * @param solarSystem system to add
    * @param jumpType jump type to set
    * @returns the new segment instance (if created)
    */
   addWaypoint: function(solarSystem, jumpType)
   {
      return this;
   },

   /**
    * Adds a Transit system at the end of the route.
    * 
    * @param solarSystem system to add
    * @param jumpType jump type to set
    * @returns the new segment instance (if created)
    */
   addTransit: function(solarSystem, jumpType)
   {
      return this;
   }

});
