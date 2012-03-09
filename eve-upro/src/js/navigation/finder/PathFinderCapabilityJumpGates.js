/**
 * This capability follows jump gates from the provided system
 */
upro.nav.finder.PathFinderCapabilityJumpGates = Class.create(upro.nav.finder.PathFinderCapability,
{
   initialize: function()
   {

   },

   getNextWaypoints: function(pathFinder, sourceWaypoint)
   {
      var waypoints = [];

      for (var systemId in sourceWaypoint.system.jumpPortals.objects)
      {
         var jumpPortal = sourceWaypoint.system.jumpPortals.get(systemId);
         var jumpType = jumpPortal.getJumpCorridor().getJumpType();

         if (jumpType == upro.nav.JumpType.JumpGate)
         {
            var system = jumpPortal.system;
            var cost = pathFinder.getBasicCostTo(system);
            var waypoint = new upro.nav.finder.PathFinderWaypoint(pathFinder, system, sourceWaypoint,
               pathFinder.sumCosts(sourceWaypoint.totalCost, cost), jumpType);

            waypoints.push(waypoint);
         }
      }

      return waypoints;
   }

});
