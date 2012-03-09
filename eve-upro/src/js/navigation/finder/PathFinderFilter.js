/**
 * A path finder filter rules out waypoints because of their
 * properties. A simple filter could be a system filter that
 * denies specific systems. Or ones were accidents happened recently.
 */
upro.nav.finder.PathFinderFilter = Class.create(
{
   initialize: function()
   {

   },

   /**
    * Returns true if the given waypoint is not to be included
    * @param pathFinder reference to the calling finder
    * @param waypoint the waypoint to check
    * @return true if the given waypoint is not to be included
    */
   isWaypointFiltered: function(pathFinder, waypoint)
   {
      return false;
   }

});
