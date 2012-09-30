/**
 * A PathFinder determines the route with the least cost between two systems. Capabilities allow the finder to determine
 * next jumps from a given system and define costs. Rules sort costs by their weight Filters work against capabilities,
 * having the finder ignore systems not allowed (unless destination).
 */
upro.nav.finder.PathFinder = Class
      .create(
      {
         initialize: function(sourceSystem, destinationSystem, capabilities, rules, filters)
         {
            this.sourceSystem = sourceSystem;
            this.destinationSystem = destinationSystem;

            this.capabilities = capabilities;
            this.rules = rules;
            this.filters = (filters !== undefined) ? filters : [];

            this.waypointsBySystem = {};

            this.cheapestPath = null;
            this.pendingWaypoints = [];
            this.onlyConsiderLastCost = false;

            { // set up first waypoint representing the start system
               var cost = new upro.nav.finder.PathFinderCost(); // the first 'waypoint' has no cost - we're already
               // here
               var firstWaypoint = new upro.nav.finder.PathFinderWaypoint(this, this.sourceSystem, null, cost,
                     upro.nav.JumpType.None);

               this.waypointsBySystem[this.sourceSystem.id] = firstWaypoint;
               this.pendingWaypoints.push(firstWaypoint);
            }
         },

         /**
          * Performs a search blocking until all paths are walked through. Can and will take long! Use continueSearch()
          * in a timer instead!
          */
         performSearch: function()
         {
            var done = false;

            while (!done)
            {
               done = this.continueSearch();
            }
         },

         /**
          * Continues an ongoing search
          * 
          * @return true if the search is completed
          */
         continueSearch: function()
         {
            if (this.pendingWaypoints.length > 0)
            {
               var waypoint = this.pendingWaypoints.shift();

               this.processNextWaypoints(waypoint);
            }

            return this.pendingWaypoints.length == 0;
         },

         /**
          * Finds and processes further waypoints from the given one
          * 
          * @param sourceWaypoint from which further possible jumps should be considered
          */
         processNextWaypoints: function(sourceWaypoint)
         {
            if (((this.cheapestPath == null) || (this.cheapestPath.totalCost.compareTo(sourceWaypoint.totalCost,
                  this.rules) > 0))
                  && (this.onlyConsiderLastCost || (this.waypointsBySystem[sourceWaypoint.system.id] === sourceWaypoint)))
            { // ignore this waypoint if it is already more expensive than a found route
               var next = this.getNextWaypointsByCapabilities(sourceWaypoint);

               for ( var i = 0; i < next.length; i++)
               {
                  var waypoint = next[i];
                  var existingWaypoint = this.waypointsBySystem[waypoint.system.id];

                  if ((existingWaypoint === undefined)
                        || (waypoint.totalCost.compareTo(existingWaypoint.totalCost, this.rules) < 0))
                  {
                     if (waypoint.system === this.destinationSystem)
                     {
                        this.waypointsBySystem[waypoint.system.id] = waypoint;
                        this.onPathFound(waypoint);
                     }
                     else
                     {
                        if (!this.onlyConsiderLastCost)
                        {
                           this.waypointsBySystem[waypoint.system.id] = waypoint;
                        }
                        this.pendingWaypoints.push(waypoint);
                     }
                  }
               }
            }
         },

         /**
          * Returns the next waypoints as reachable from given sourceWaypoint
          * 
          * @param sourceWaypoint the waypoint from which to search
          * @return an array of further waypoints as retrieved from the capabilities
          */
         getNextWaypointsByCapabilities: function(sourceWaypoint)
         {
            var waypoints = [];

            for ( var capIndex = 0; capIndex < this.capabilities.length; capIndex++)
            {
               var capability = this.capabilities[capIndex];
               var capWaypoints = capability.getNextWaypoints(this, sourceWaypoint);

               for ( var capWaypointIndex = 0; capWaypointIndex < capWaypoints.length; capWaypointIndex++)
               {
                  var capWaypoint = capWaypoints[capWaypointIndex];
                  var found = false;

                  for ( var waypointIndex = 0; !found && (waypointIndex < waypoints.length); waypointIndex++)
                  {
                     var existingWaypoint = waypoints[waypointIndex];

                     if (existingWaypoint.system === capWaypoint.system)
                     {
                        found = true;
                        if (existingWaypoint.totalCost.compareTo(capWaypoint.totalCost, this.rules) > 0)
                        { // the new cost is cheaper than the previous (typically jump gates over jump drives)
                           waypoints[waypointIndex] = capWaypoint;
                        }
                     }
                  }
                  if (!found && !this.isWaypointFiltered(capWaypoint))
                  {
                     waypoints.push(capWaypoint);
                  }
               }
            }

            return waypoints;
         },

         /**
          * Returns true if the given waypoint is not allowed as per filters
          * 
          * @param waypoint the waypoint to test
          * @return true if the given waypoint is not allowed as per filters
          */
         isWaypointFiltered: function(waypoint)
         {
            var rCode = false;

            if (waypoint.system !== this.destinationSystem)
            { // destination can't be filtered if required
               for ( var i = 0; !rCode && (i < this.filters.length); i++)
               {
                  var filter = this.filters[i];

                  rCode = filter.isWaypointFiltered(this, waypoint);
               }
            }

            return rCode;
         },

         /**
          * Callback for a found path to the destination system
          * 
          * @param waypoint the last waypoint of a new found path
          */
         onPathFound: function(waypoint)
         {
            this.cheapestPath = waypoint;
         },

         /**
          * Returns a PathFinderCost instance initialized with the properties of given system according to the rules.
          * 
          * @param system for which to create a cost object
          * @return a PathFinderCost instance
          */
         getBasicCostTo: function(system)
         {
            var cost = new upro.nav.finder.PathFinderCost();
            var isDestinationSystem = system === this.destinationSystem;

            this.rules.forEach(function(rule)
            {
               cost.costItems = rule.addBasicCost(cost.costItems, system, isDestinationSystem);
            });

            return cost;
         },

         /**
          * Returns the sum of both given costs under the current rules
          * 
          * @param subTotal the previous subTotal (typically waypoint.totalCost)
          * @param cost the cost to add
          * @return the sum of both given costs
          */
         sumCosts: function(subTotal, cost)
         {
            return subTotal.plus(cost, this.rules);
         }
      });
