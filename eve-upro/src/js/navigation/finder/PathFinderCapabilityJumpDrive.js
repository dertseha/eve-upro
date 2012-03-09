/**
 * A jump drive capability allows a ship to travel (without moving) a certain distance of light years by itself.
 * This capability is limited to a specific galaxy (NewEden) and a certain type of destination
 * systems: those with a security of less than 0.5 (no high-sec)
 */
upro.nav.finder.PathFinderCapabilityJumpDrive = Class.create(upro.nav.finder.PathFinderCapability,
{
   initialize: function(maxLightYears)
   {
      this.maxLightYears = maxLightYears;
      this.lightYearToMeters = 9460.7304725808; // this number is reduced by the factor also applied to the system positions
      this.maxDistance = this.maxLightYears * this.lightYearToMeters;
   },

   getNextWaypoints: function(pathFinder, sourceWaypoint)
   {
      var waypoints = [];
      var galaxy = sourceWaypoint.system.galaxy;

      if (galaxy.id == 9) // TODO: Where to place this constant - whom to given control?
      {
/* TODO: optimization. This code goes hand in hand with a missing function SolarSystem.calculateDistances()
         see Galaxy.onSolarSystemAdded()

         for (otherId in sourceWaypoint.system.distances)
         {
            var dist = sourceWaypoint.system.distances[otherId];

            if (dist <= this.maxDistance)
            {
               var system = sourceWaypoint.system.galaxy.solarSystems.get(otherId);
                  var cost = pathFinder.getBasicCostTo(system);

                  cost.costItems.jumpDistance = dist;
                  var waypoint = new upro.nav.finder.PathFinderWaypoint(pathFinder, system, sourceWaypoint,
                     pathFinder.sumCosts(sourceWaypoint.totalCost, cost), upro.nav.JumpType.JumpDrive);

                  waypoints.push(waypoint);
            }
         }
*/

         var allSystems = galaxy.solarSystems;
         var tempVec = vec3.create();

         for (var systemId in allSystems.objects)
         {
            var system = allSystems.get(systemId);

            if ((system.security < 0.5) && (system !== sourceWaypoint.system)) // can't jump into high-sec - or itself
            {
               var dist = vec3.length(vec3.subtract(sourceWaypoint.system.position, system.position, tempVec));

               if (dist <= this.maxDistance)
               {
                  var cost = pathFinder.getBasicCostTo(system);

                  cost.costItems.jumpDistance = dist;
                  var waypoint = new upro.nav.finder.PathFinderWaypoint(pathFinder, system, sourceWaypoint,
                     pathFinder.sumCosts(sourceWaypoint.totalCost, cost), upro.nav.JumpType.JumpDrive);

                  waypoints.push(waypoint);
               }
            }
         }
      }

      return waypoints;
   }

});
