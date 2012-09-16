/**
 * 
 */
upro.model.proxies.ActiveRouteProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.ActiveRouteProxy.NAME, null);

      this.headSegment = new upro.model.ActiveRouteHeadSegment(this);
      this.lastSegment = this.headSegment;
   },

   /** {@inheritDoc} */
   onRegister: function()
   {

   },

   notify: function(event)
   {
      this.facade().sendNotification(event);
   },

   /**
    * @return true if the route is currently empty
    */
   isEmpty: function()
   {
      return this.lastSegment === this.headSegment;
   },

   /**
    * Resets the route
    */
   resetRoute: function()
   {
      if (!this.isEmpty())
      {
         this.cancelAllOptimizer();

         this.headSegment = new upro.model.ActiveRouteHeadSegment(this);
         this.lastSegment = this.headSegment;

         this.notify(upro.app.Notifications.ActiveRoutePathChanged);
      }
   },

   /**
    * Queries whether the given solar system is present as an entry
    * 
    * @param solarSystem to check
    * @return true if the given solar system is either a waypoint or checkpoint
    */
   containsSolarSystemAsEntry: function(solarSystem)
   {
      var rCode = false;

      this.forEachSegment(function(segment)
      {
         if (segment.containsNonTransitSystem(solarSystem))
         {
            rCode = true;
         }
      });

      return rCode;
   },

   /**
    * Verifies whether the given solar sytem can be added as given type. The following rules exist:
    * <ul>
    * <li>Checkpoints can always be added</li>
    * <li>Otherwise, the system added must not be in the current segment</li>
    * </ul>
    * 
    * @param solarSystem to test
    * @param entryType as which type to be added (upro.nav.SystemRouteEntry.EntryType)
    */
   canEntryBeAdded: function(solarSystem, entryType)
   {
      var isCheckpoint = entryType == upro.nav.SystemRouteEntry.EntryType.Checkpoint;
      var isWaypoint = entryType == upro.nav.SystemRouteEntry.EntryType.Waypoint;
      var rCode = false;

      if (isCheckpoint || (isWaypoint && this.lastSegment.canWaypointBeAdded(solarSystem)))
      {
         rCode = true;
      }

      return rCode;
   },

   updateOptimizer: function(removedSegmentIds, changedSegmentIds)
   {
      var routeOptimizerProxy = this.facade().retrieveProxy(upro.model.proxies.RouteOptimizerProxy.NAME);
      var that = this;

      removedSegmentIds.forEach(function(id)
      {
         routeOptimizerProxy.cancelRequest(id);
      });
      changedSegmentIds.forEach(function(id)
      {
         var segment = that.findSegment(id);
         var route = segment.addToRoute([]);
         var waypoints = [];
         var sourceSolarSystem = route.splice(0, 1)[0].getSolarSystem();
         var destinationSolarSystem = null;

         { // determine the destination solar system from the start of the next segment
            var nextSegment = segment.getNext();
            var nextRoute = nextSegment.addToRoute([]);

            if (nextRoute.length > 0)
            {
               destinationSolarSystem = nextRoute[0].getSolarSystem();
            }
         }
         route.forEach(function(entry)
         {
            if (entry.getEntryType() != upro.nav.SystemRouteEntry.EntryType.Transit)
            {
               var solarSystem = entry.getSolarSystem();

               if (solarSystem !== destinationSolarSystem)
               {
                  waypoints.push(solarSystem);
               }
            }
         });

         routeOptimizerProxy.requestRoute(id, sourceSolarSystem, waypoints, destinationSolarSystem);
      });
   },

   /**
    * Cancels the optimizer for all segments
    */
   cancelAllOptimizer: function()
   {
      var routeOptimizerProxy = this.facade().retrieveProxy(upro.model.proxies.RouteOptimizerProxy.NAME);

      this.forEachSegment(function(segment)
      {
         var ids = segment.addId([]);

         ids.forEach(function(id)
         {
            routeOptimizerProxy.cancelRequest(id);
         });
      });
   },

   /**
    * Add a checkpoint to the route
    * 
    * @param solarSystem solar system to add
    * @returns {Array} of affected segments
    */
   addCheckpoint: function(solarSystem)
   {
      var changedSegments = [];

      changedSegments = this.lastSegment.addId(changedSegments);
      this.lastSegment = this.lastSegment.addCheckpoint(solarSystem, upro.nav.JumpType.None);
      changedSegments = this.lastSegment.addId(changedSegments);

      this.notify(upro.app.Notifications.ActiveRoutePathChanged);

      return changedSegments;
   },

   /**
    * Add a waypoint to the route
    * 
    * @param solarSystem solar system to add
    * @returns {Array} of affected segments
    */
   addWaypoint: function(solarSystem)
   {
      var changedSegments = [];

      if (this.lastSegment.canWaypointBeAdded(solarSystem))
      {
         changedSegments = this.lastSegment.addId(changedSegments);
         this.lastSegment = this.lastSegment.addWaypoint(solarSystem, upro.nav.JumpType.None);
         changedSegments = this.lastSegment.addId(changedSegments);

         this.notify(upro.app.Notifications.ActiveRoutePathChanged);
      }

      return changedSegments;
   },

   /**
    * Removes all occurrences of given solar system
    * 
    * @param solarSystem to remove
    */
   removeEntry: function(solarSystem)
   {
      // var searchStart = 0;
      //
      // while (searchStart < this.routeEntries.length)
      // {
      // var index = this.findSystemInSegmentOf(searchStart, solarSystem);
      //
      // if (index >= 0)
      // {
      // var routeEntry = this.routeEntries[index];
      // var entryType = routeEntry.systemEntry.getEntryType();
      //
      // if (entryType == upro.nav.SystemRouteEntry.EntryType.Checkpoint)
      // {
      // if (index < (this.routeEntries.length - 1))
      // { // the checkpoint was not the last entry, make the next entry a checkpoint
      // this.routeEntries[index + 1].systemEntry = this.routeEntries[index + 1].systemEntry
      // .asEntryType(upro.nav.SystemRouteEntry.EntryType.Checkpoint);
      // this.deleteEntry(index);
      // }
      // else
      // { // was last entry, simply reoptimize
      // this.deleteEntry(index);
      // startIndex = index;
      // }
      // }
      // else
      // { // a waypoint in between
      // this.deleteEntry(index);
      // }
      // }
      // else
      // {
      // if (searchStart == 0)
      // {
      // searchStart = 1;
      // }
      // else
      // {
      // searchStart = this.findSegmentEnd(searchStart) + 1;
      // }
      // }
      // }
      //
      // this.notify(upro.app.Notifications.ActiveRoutePathChanged);
   },

   /**
    * @returns {Array} of SystemRouteEntry objects describing the route
    */
   getRoute: function()
   {
      var route = [];

      this.forEachSegment(function(segment)
      {
         route = segment.addToRoute(route);
      });

      return route;
   },

   /**
    * Sets the route for a specific segment - typically the result of an optimization run
    * 
    * @param id identifying the segment
    * @param route the route to set
    */
   setRouteSegment: function(id, route)
   {
      var segment = this.findSegment(id);

      segment.setRoute(route);
      this.notify(upro.app.Notifications.ActiveRoutePathChanged);
   },

   /**
    * Resets a segment to minimum - typically when optimization returned no result
    * 
    * @param id identifying the segment
    */
   resetRouteSegmentToMinimum: function(id)
   {
      var segment = this.findSegment(id);

      segment.resetRouteToMinimum();
      this.notify(upro.app.Notifications.ActiveRoutePathChanged);
   },

   /**
    * @param id identifying the segment to find
    * @returns a segment instance
    */
   findSegment: function(id)
   {
      var found = upro.model.ActiveRouteSegmentTerminator.INSTANCE;

      this.forEachSegment(function(segment)
      {
         if (segment.hasId(id))
         {
            found = segment;
         }
      });

      return found;
   },

   /**
    * Iterates through all segments and calls given callback with it
    * 
    * @param callback function with signature function(segment) { }
    */
   forEachSegment: function(callback)
   {
      var segment = this.headSegment;

      while (segment !== upro.model.ActiveRouteSegmentTerminator.INSTANCE)
      {
         callback(segment);
         segment = segment.getNext();
      }
   }

});

upro.model.proxies.ActiveRouteProxy.NAME = "ActiveRoute";
