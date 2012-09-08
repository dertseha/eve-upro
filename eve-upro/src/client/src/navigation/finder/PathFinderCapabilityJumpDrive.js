/**
 * A jump drive capability allows a ship to travel (without moving) a certain distance of light years by itself. This
 * capability is limited to a specific galaxy (NewEden) and a certain type of destination systems: those with a security
 * of less than 0.5 (no high-sec)
 */
upro.nav.finder.PathFinderCapabilityJumpDrive = Class.create(upro.nav.finder.PathFinderCapability,
{
   initialize: function(maxLightYears)
   {
      this.maxLightYears = maxLightYears;
   },

   getNextWaypoints: function(pathFinder, sourceWaypoint)
   {
      var waypoints = [];
      var galaxy = sourceWaypoint.system.galaxy;

      if (upro.nav.Constants.GalaxiesForJumpDrive.indexOf(galaxy.id) >= 0)
      {
         var nearJumps = sourceWaypoint.system.getNearJumps();
         var allSystems = galaxy.solarSystems;

         for ( var systemId in nearJumps)
         {
            var dist = nearJumps[systemId];

            if (dist <= this.maxLightYears)
            {
               var system = allSystems.get(systemId);
               var cost = pathFinder.getBasicCostTo(system);

               cost.costItems.jumpDistance = dist;
               var waypoint = new upro.nav.finder.PathFinderWaypoint(pathFinder, system, sourceWaypoint, pathFinder
                     .sumCosts(sourceWaypoint.totalCost, cost), upro.nav.JumpType.JumpDrive);

               waypoints.push(waypoint);
            }
         }
      }

      return waypoints;
   }

});
