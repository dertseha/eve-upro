/**
 * A path finder capability is something that can retrieve next waypoints
 * from a given source system
 */
upro.nav.finder.PathFinderCapability = Class.create(
{
   initialize: function()
   {

   },

   getNextWaypoints: function(pathFinder, sourceWaypoint)
   {
      return [];
   }

});
