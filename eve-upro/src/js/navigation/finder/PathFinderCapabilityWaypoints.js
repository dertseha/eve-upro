/**
 * This capability takes a complete graph of PathFinderWaypoint destinations
 * and lets the PathFinder find the cheapest route out of them - meta!
 * Only downside: this is thus a brute-force implementation of the TSP.
 * Don't try and run more than 10 waypoints.
 */
upro.nav.finder.PathFinderCapabilityWaypoints = Class.create(upro.nav.finder.PathFinderCapability,
{
   initialize: function(routesBySourceSystem, destinationSystem)
   {
      this.routesBySourceSystem = routesBySourceSystem;
      this.destinationSystem = destinationSystem;
   },

   getNextWaypoints: function(pathFinder, sourceWaypoint)
   {
      var waypoints = [];
      var routesByDestinationSystem = this.routesBySourceSystem[sourceWaypoint.system.id];

      for (var destinationSystemId in routesByDestinationSystem)
      {
         var destinationWaypoint = routesByDestinationSystem[destinationSystemId];
         var destSystem = this.getSystemFromPath(destinationWaypoint, destinationSystemId);

         if (!this.isSystemInRoute(sourceWaypoint, destSystem) &&
            (destSystem !== this.destinationSystem))
         {
            var cost = destinationWaypoint.totalCost;
            var waypoint = new upro.nav.finder.PathFinderWaypoint(pathFinder, destSystem, sourceWaypoint,
               pathFinder.sumCosts(sourceWaypoint.totalCost, cost));

            waypoints.push(waypoint);
         }
      }
      if ((waypoints.length == 0) && (this.destinationSystem !== undefined))
      {  // last waypoint before the destination
         var destinationWaypoint = routesByDestinationSystem[this.destinationSystem.id];
         var cost = destinationWaypoint.totalCost;
         var waypoint = new upro.nav.finder.PathFinderWaypoint(pathFinder, this.destinationSystem, sourceWaypoint,
            pathFinder.sumCosts(sourceWaypoint.totalCost, cost));

         waypoints.push(waypoint);
      }

      return waypoints;
   },

   isSystemInRoute: function(endWaypoint, system)
   {
      var rCode = false;
      var waypoint = endWaypoint;

      while (!rCode && (waypoint !== null))
      {
         rCode = waypoint.system === system;
         waypoint = waypoint.previousWaypoint;
      }

      return rCode;
   },

   getSystemFromPath: function(endWaypoint, systemId)
   {
      var system = null;
      var waypoint = endWaypoint;

      while ((system === null) && (waypoint !== null))
      {
         if (waypoint.system.id == systemId)
         {
            system = waypoint.system;
         }
         waypoint = waypoint.previousWaypoint;
      }

      return system;
   }

});
