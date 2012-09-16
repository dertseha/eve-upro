/**
 * The abstract base class for a route segment entry of the active route
 */
upro.model.AbstractActiveRouteSegment = Class.create(
{
   initialize: function(nextSegment)
   {
      this.nextSegment = nextSegment;
   },

   hasId: function(id)
   {
      return false;
   },

   addId: function(ids)
   {
      return ids;
   },

   getNext: function()
   {
      return this.nextSegment;
   },

   setNext: function(nextSegment)
   {
      this.nextSegment = nextSegment;
   },

   setRoute: function(route)
   {

   },

   resetRouteToMinimum: function()
   {

   },

   addToRoute: function(route)
   {
      return route;
   },

   containsNonTransitSystem: function(solarSystem)
   {
      return false;
   },

   canWaypointBeAdded: function(solarSystem)
   {
      return false;
   },

   addCheckpoint: function(solarSystem, jumpType)
   {
      return this;
   },

   addWaypoint: function(solarSystem, jumpType)
   {
      return this;
   },

   addTransit: function(solarSystem, jumpType)
   {
      return this;
   }

});
