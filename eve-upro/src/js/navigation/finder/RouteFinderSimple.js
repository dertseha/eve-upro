/**
 * This simple route finder only considers the cheapest, direct routes between
 * the list of given systems - no reordering performed.
 */
upro.nav.finder.RouteFinderSimple = Class.create(upro.nav.finder.RouteFinder,
{
   initialize: function($super, capabilities, rules, filters, sourceSystem, waypoints, destinationSystem)
   {
      $super(capabilities, rules, filters, sourceSystem, waypoints, destinationSystem);

      this.pathFinder = null;
      this.lastSystem = null;
      this.waypointIndex = 0;
   },

   /** {@inheritDoc} */
   internalStart: function()
   {
      this.pathFinder = null;
      this.lastSystem = this.sourceSystem;
      this.waypointIndex = 0;

      return this.getNextStep();
   },

   /**
    * Returns the next function to call or undefined if the search is completed
    * @return the next function to call or undefined if the search is completed
    */
   getNextStep: function()
   {
      var nextSystem = null;
      var nextFunction = undefined;

      if (this.waypointIndex < this.waypoints.length)
      {
         this.addRouteEntry(this.lastSystem, upro.nav.SystemRouteEntry.EntryType.Waypoint);
         nextSystem = this.waypoints[this.waypointIndex];
      }
      else if (this.lastSystem !== this.destinationSystem)
      {
         this.addRouteEntry(this.lastSystem, upro.nav.SystemRouteEntry.EntryType.Waypoint);
         nextSystem = this.destinationSystem;
      }
      if (nextSystem)
      {
         this.pathFinder = new upro.nav.finder.PathFinder(this.lastSystem, nextSystem, this.capabilities, this.rules, this.filters);
         nextFunction = this.runFinder;
      }

      return nextFunction;
   },

   /**
    * This function runs the current path finder and handles its result
    */
   runFinder: function()
   {
      var result = this.pathFinder.continueSearch();
      var nextFunction = this.runFinder;

      if (result)
      {
         if (this.pathFinder.cheapestPath)
         {
            var waypoint = this.pathFinder.cheapestPath.previousWaypoint;
            var transitSystems = [];

            while ((waypoint != null) && (waypoint.previousWaypoint != null))
            {  // traverse back and get all waypoints
               transitSystems.push(waypoint.system);
               waypoint = waypoint.previousWaypoint;
            }
            // reverse the list and add all to route
            transitSystems.reverse();
            for (var i = 0; i < transitSystems.length; i++)
            {
               this.addRouteEntry(transitSystems[i], upro.nav.SystemRouteEntry.EntryType.Transit, transitSystems[i].jumpType);
            }
            // set up next cycle
            this.lastSystem = this.pathFinder.cheapestPath.system;
            this.waypointIndex++;
            nextFunction = this.getNextStep();
         }
         else
         {
            this.searchFailed();
            nextFunction = undefined;
         }
      }

      return nextFunction;
   }

});
