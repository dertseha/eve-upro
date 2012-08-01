/**
 * This filter simply rules out a certain system by its ID
 * e.g., "Avoid Jita".
 */
upro.nav.finder.PathFinderFilterSystem = Class.create(
{
   initialize: function(systemId)
   {
      this.systemId = systemId;
   },

   isWaypointFiltered: function(pathFinder, waypoint)
   {
      return waypoint.system.id == this.systemId;
   }

});
