/**
 * The active route proxy is the workspace for a route. It provides functions to modify it and request optimizations.
 */
upro.model.proxies.ActiveRouteProxy = Class.create(upro.model.proxies.AbstractProxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.ActiveRouteProxy.NAME, null);

      this.headSegment = new upro.model.ActiveRouteHeadSegment();
      this.lastSegment = this.headSegment;
   },

   /** {@inheritDoc} */
   onRegister: function()
   {
      this.registerBroadcast(upro.data.clientBroadcastEvents.CharacterActiveRoute.name);

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
    * Verifies whether the given solar system can be added as given type. The following rules exist:
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

   /**
    * Updates optimizer for given segment IDs
    * 
    * @param removedSegmentIds for which the optimizer should be cancelled
    * @param changedSegmentIds for which the optimizer should be restarted
    */
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

         that.startOptimizer(segment);
      });
   },

   /**
    * Cancels the optimizer for all segments
    */
   cancelAllOptimizer: function()
   {
      var routeOptimizerProxy = this.facade().retrieveProxy(upro.model.proxies.RouteOptimizerProxy.NAME);
      var ids = [];

      this.forEachSegment(function(segment)
      {
         ids = segment.addId(ids);
      });
      ids.forEach(function(id)
      {
         routeOptimizerProxy.cancelRequest(id);
      });
   },

   /**
    * Recalculates all segments
    */
   recalculateAllSegments: function()
   {
      var that = this;

      this.forEachSegment(function(segment)
      {
         segment.resetRouteToMinimum();
         that.startOptimizer(segment);
      });
      this.notify(upro.app.Notifications.ActiveRoutePathChanged);
   },

   /**
    * Starts the optimizer for given segment
    * 
    * @param segment for which the optimizer should be started
    */
   startOptimizer: function(segment)
   {
      var routeOptimizerProxy = this.facade().retrieveProxy(upro.model.proxies.RouteOptimizerProxy.NAME);
      var route = segment.addToRoute([]);

      if (route.length > 0)
      {
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

         routeOptimizerProxy.requestRoute(segment.addId([])[0], sourceSolarSystem, waypoints, destinationSolarSystem);
      }
   },

   /**
    * Add a checkpoint to the route
    * 
    * @param solarSystem solar system to add
    * @returns {Array} of affected segments
    */
   addCheckpoint: function(solarSystem)
   {
      var changedIds = [];

      changedIds = this.lastSegment.addId(changedIds);
      this.lastSegment = this.lastSegment.addCheckpoint(solarSystem, upro.nav.JumpType.None);
      changedIds = this.lastSegment.addId(changedIds);

      this.notify(upro.app.Notifications.ActiveRoutePathChanged);

      return changedIds;
   },

   /**
    * Add a waypoint to the route
    * 
    * @param solarSystem solar system to add
    * @returns {Array} of affected segments
    */
   addWaypoint: function(solarSystem)
   {
      var changedIds = [];

      if (this.lastSegment.canWaypointBeAdded(solarSystem))
      {
         changedIds = this.lastSegment.addId(changedIds);
         this.lastSegment = this.lastSegment.addWaypoint(solarSystem, upro.nav.JumpType.None);
         changedIds = this.lastSegment.addId(changedIds);

         this.notify(upro.app.Notifications.ActiveRoutePathChanged);
      }

      return changedIds;
   },

   /**
    * Removes all occurrences of given solar system
    * 
    * @param solarSystem to remove
    */
   removeEntry: function(solarSystem)
   {
      var that = this;
      var changedIds = [];

      this.lastSegment = this.headSegment;
      this.forEachSegment(function(segment)
      {
         if (segment.removeSolarSystem(solarSystem))
         {
            changedIds = that.lastSegment.addId(changedIds); // removing the first entry affects the previous segment
            changedIds = segment.addId(changedIds);
            if (segment.isEmpty())
            {
               var nextSegment = segment.getNext();

               that.lastSegment.setNext(nextSegment);
            }
            else
            {
               segment.resetRouteToMinimum();
               that.lastSegment = segment;
            }
         }
         else
         {
            that.lastSegment = segment;
         }
      });
      if (changedIds.length > 0)
      {
         this.notify(upro.app.Notifications.ActiveRoutePathChanged);
      }

      return changedIds;
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
    * Resets a segment to minimum - typically when optimization returned no result; Drops all transit systems and resets
    * the jump types to None for the remaining systems.
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
    * Requests to synchronize the current route with the backend (distributed it to other sessions)
    */
   syncRoute: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);
      var route = this.getRoute();
      var body =
      {
         route: []
      };

      route.forEach(function(systemRouteEntry)
      {
         body.route.push(systemRouteEntry.toRawData());
      });
      sessionProxy.sendRequest(upro.data.clientRequests.SetActiveRoute.name, body);
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
   },

   /**
    * Broadcast Handler
    */
   onCharacterActiveRoute: function(broadcastBody)
   {
      var universeProxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME);
      var that = this;

      this.resetRoute();
      broadcastBody.route.forEach(function(rawData)
      {
         var solarSystem = universeProxy.findSolarSystemById(rawData.solarSystemId);

         that.lastSegment = that.lastSegment["add" + rawData.entryType].call(that.lastSegment, solarSystem,
               rawData.nextJumpType);
      });
      this.notify(upro.app.Notifications.ActiveRoutePathChanged);
   }

});

upro.model.proxies.ActiveRouteProxy.NAME = "ActiveRoute";
