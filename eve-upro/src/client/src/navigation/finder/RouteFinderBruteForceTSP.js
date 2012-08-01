/**
 * This is a brute force TSP route finder. Don't use beyond 10 systems.
 * Don't use it at all actually. Using the PathFinder internally, it
 * always requires a destination system.
 * Use only for reference.
 */
upro.nav.finder.RouteFinderBruteForceTSP = Class.create(upro.nav.finder.RouteFinderAbstractTSP,
{
   initialize: function($super, capabilities, rules, filters, sourceSystem, waypoints, destinationSystem)
   {
      $super(capabilities, rules, filters, sourceSystem, waypoints, destinationSystem);

      this.bruteForceFinder = null;
   },

   /** {@inheritDoc} */
   tspStart: function()
   {
      var routesBySourceSystem = {};

      for (var sourceId in this.edgeMap)
      {
         var edgeDestMap = this.edgeMap[sourceId];
         var destRouteByDestSystem = {};

         routesBySourceSystem[sourceId] = destRouteByDestSystem;
         for (var destId in edgeDestMap)
         {
            var edge = edgeDestMap[destId];

            destRouteByDestSystem[destId] = edge.path;
         }
      }

      var forceCapabilities = [];

      forceCapabilities.push(new upro.nav.finder.PathFinderCapabilityWaypoints(routesBySourceSystem, this.destinationSystem));
      this.bruteForceFinder = new upro.nav.finder.PathFinder(this.sourceSystem, this.destinationSystem, forceCapabilities, this.rules, undefined);
      this.bruteForceFinder.onlyConsiderLastCost = true;

      return this.runBruteForceFinder;
   },

   runBruteForceFinder: function()
   {
      var result = this.bruteForceFinder.continueSearch();
      var nextFunction = this.runBruteForceFinder;

      if (result)
      {
         if (this.bruteForceFinder.cheapestPath)
         {
            var waypoint = this.bruteForceFinder.cheapestPath;
            var optimizedList = [];

            while (waypoint != null)
            {  // traverse back and get all waypoints
               optimizedList.push(waypoint.system);
               waypoint = waypoint.previousWaypoint;
            }
            optimizedList.reverse();
            this.onRouteFound(optimizedList);
         }
         else
         {
            this.searchFailed();
         }
         nextFunction = undefined;
      }

      return nextFunction;
   }

});
