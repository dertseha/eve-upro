
/**
 * This is an abstract base class for a TSP implementation.
 * It first calculates the costs of the complete graph before starting
 * off the (inherited) TSP algorithm.
 *
 * An optimization exists that will not start the higher level function
 * if there are less than two waypoints.
 */
upro.nav.finder.RouteFinderAbstractTSP = Class.create(upro.nav.finder.RouteFinder,
{
   initialize: function($super, capabilities, rules, filters, sourceSystem, waypoints, destinationSystem)
   {
      $super(capabilities, rules, filters, sourceSystem, waypoints, destinationSystem);

      this.edges = []; // a list of edges
      this.edgeMap = {}; // a bi-directional map of maps of edges between A and B systems
   },

   /** {@inheritDoc} */
   internalStart: function()
   {
      var nextFunction = undefined;

      this.createEdges();
      this.edgeIndex = 0;
      if (this.edges.length > 0)
      {
         nextFunction = this.runNextEdge();
      }
      else
      {  // no waypoints, only source and dest
         this.addRouteEntry(this.sourceSystem, upro.nav.SystemRouteEntry.EntryType.Waypoint, upro.nav.JumpType.None);
      }

      return nextFunction;
   },

   createEdges: function()
   {
      this.edges = [];
      this.edgeMap = {};
      if (this.destinationSystem && (this.sourceSystem.id != this.destinationSystem.id))
      {
         this.addBidirectionalEdge(this.sourceSystem, this.destinationSystem);
      }
      for (var i = 0; i < this.waypoints.length; i++)
      {
         var waypoint = this.waypoints[i];

         this.addBidirectionalEdge(this.sourceSystem, waypoint);
         if (this.destinationSystem)
         {
            this.addBidirectionalEdge(waypoint, this.destinationSystem);
         }
         for (var j = i + 1; j < this.waypoints.length; j++)
         {
            this.addBidirectionalEdge(waypoint, this.waypoints[j]);
         }
      }
   },

   addBidirectionalEdge: function(systemA, systemB)
   {
      var edge = this.createEdge(systemA, systemB);

      this.setEdgeMapEntry(systemA.id, systemB.id, edge);
      this.setEdgeMapEntry(systemB.id, systemA.id, edge);
   },

   addUnidirectionalEdge: function(systemA, systemB)
   {
      var edge = this.createEdge(systemA, systemB);

      this.setEdgeMapEntry(systemA.id, systemB.id, edge);
   },

   createEdge: function(systemA, systemB)
   {
      var edge =
      {
         systemA: systemA,
         systemB: systemB,
         path: null,
         cost: null
      };

      this.edges.push(edge);

      return edge;
   },

   setEdgeMapEntry: function(systemId1, systemId2, edge)
   {
      var destMap = this.edgeMap[systemId1];

      if (destMap === undefined)
      {
         this.edgeMap[systemId1] = destMap = {};
      }
      destMap[systemId2] = edge;
   },

   runNextEdge: function()
   {
      var nextFunction = this.tspStart;

      if (this.edgeIndex < this.edges.length)
      {
         var edge = this.edges[this.edgeIndex];

         this.pathFinder = new upro.nav.finder.PathFinder(edge.systemA, edge.systemB, this.capabilities, this.rules, this.filters);
         nextFunction = this.runFinder;
      }
      else if (this.waypoints.length < 2)
      {  // no need for running a more detailed algorithm - there's only one solution
         var route = [];

         route.push(this.sourceSystem);
         if (this.waypoints.length == 1)
         {
            route.push(this.waypoints[0]);
         }
         if (this.destinationSystem)
         {
            route.push(this.destinationSystem);
         }
         this.onRouteFound(route);
         nextFunction = undefined;
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
            var edge = this.edges[this.edgeIndex];

            edge.cost = this.pathFinder.cheapestPath.totalCost;
            edge.path = this.pathFinder.cheapestPath;

            this.checkUnidirectionalEdge(edge);

            this.edgeIndex++;
            nextFunction = this.runNextEdge();
         }
         else
         {
            this.searchFailed();
            nextFunction = undefined;
         }
      }

      return nextFunction;
   },

   /**
    * Checks whether the given edge is unidirectional. If that's the case,
    * a dedicated edge in the reverse direction is created if needed
    * @param edge to check
    */
   checkUnidirectionalEdge: function(edge)
   {
      var isUnidirectional = false;
      var waypoint = edge.path;

      while (!isUnidirectional && waypoint)
      {
         if (waypoint.isUnidirectional())
         {
            isUnidirectional = true;
         }
         waypoint = waypoint.previousWaypoint;
      }
      if (isUnidirectional && this.edgeMap[edge.systemB.id][edge.systemA.id] == edge)
      {  // found an unidirectional edge that has not yet been properly reversed
         this.addUnidirectionalEdge(edge.systemB, edge.systemA);
      }
   },

   /**
    * The cascaded TSP start function. Called when the costs of the complete graph have
    * been calculated and not less than two waypoints exist. Returns the next function.
    * @return the next function to call.
    */
   tspStart: function()
   {
      return undefined;
   },

   onRouteFound: function(optimizedList)
   {
      var notLastSegment;
      var entryType = null;
      var i, j;

      this.clearRoute();
      for (i = 0; i < (optimizedList.length - 1); i++)
      {
         var systemA = optimizedList[i];
         var systemB = optimizedList[i + 1];
         var edge = this.edgeMap[systemA.id][systemB.id];
         var transitSystems = [];
         var jumpTypes = [];
         var waypoint = edge.path;

         notLastSegment = i < (optimizedList.length - 2);
         while (waypoint != null)
         {
            transitSystems.push(waypoint.system);
            jumpTypes.push(waypoint.jumpType);
            waypoint = waypoint.previousWaypoint;
         }
         jumpTypes.pop(); // remove the 'None' currently at the end of the route
         if (systemA === edge.systemA)
         {  // the path was calculated in the right direction, but waypoints accumulated wrong way around - simply reverse
            transitSystems.reverse();
            jumpTypes.reverse();
         }
         if (notLastSegment || (this.destinationSystem))
         {  // drop the destination (to be included by next loop) unless last one without fixed destination
            transitSystems.pop();
         }
         else
         {  // the final destination should have a proper jump type
            jumpTypes.push(upro.nav.JumpType.None);
         }
         for (j = 0; j < transitSystems.length; j++)
         {
            entryType = upro.nav.SystemRouteEntry.EntryType.Transit;

            if ((j == 0) || ((j == transitSystems.length - 1) && !notLastSegment && !this.destinationSystem))
            {
               entryType = upro.nav.SystemRouteEntry.EntryType.Waypoint;
            }
            this.addRouteEntry(transitSystems[j], entryType, jumpTypes[j]);
         }
      }

      // also rewrite the list of waypoints
      optimizedList.shift();
      if (this.destinationSystem)
      {
         optimizedList.pop();
      }
      this.waypoints = optimizedList;
   }

});
