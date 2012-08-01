/**
 * 
 */
upro.model.proxies.ActiveRouteProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.ActiveRouteProxy.NAME, null);

      this.routeEntries = [];
      this.optimizersByIndex = {};
      this.timer = null;

      this.filterSolarSystems = [];
      this.routingCapabilities = [];
      this.routingRules = [];
   },

   /** {@inheritDoc} */
   onRegister: function()
   {
      this.timer = new upro.sys.Timer.getIntervalTimer(this.runOptimizers.bind(this));
      this.timer.start(10);
   },

   /** {@inheritDoc} */
   onRemove: function()
   {
      if (this.timer)
      {
         this.timer.stop();
         this.timer = null;
      }
   },

   notify: function(event)
   {
      this.facade().sendNotification(event);
   },

   /**
    * Sets the list of ignored solar systems by their ID
    * 
    * @param solarSystemIds an array of IDs
    */
   setIgnoredSolarSystemIds: function(solarSystemIds)
   {
      this.filterSolarSystems = [];
      for ( var i = 0; i < solarSystemIds.length; i++)
      {
         var id = solarSystemIds[i];

         this.filterSolarSystems.push(new upro.nav.finder.PathFinderFilterSystem(id));
      }
      this.optimizeAll();
   },

   /**
    * Sets the routing capabilities
    * 
    * @param capabilities an array of PathFinderCapability objects
    */
   setRoutingCapabilities: function(capabilities)
   {
      this.routingCapabilities = capabilities;
      this.optimizeAll();
   },

   /**
    * Sets the routing rules
    * 
    * @param rules an array of PathFinderCostRule objects
    */
   setRoutingRules: function(rules)
   {
      this.routingRules = rules;
      this.optimizeAll();
   },

   /**
    * Returns true if the route is currently empty
    * 
    * @return true if the route is currently empty
    */
   isEmpty: function()
   {
      return this.routeEntries.length == 0;
   },

   /**
    * Resets the route
    */
   resetRoute: function()
   {
      if (this.routeEntries.length > 0)
      {
         this.stopOptimizer(0, this.routeEntries.length - 1);
         this.routeEntries = [];

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

      for ( var i = 0; !rCode && (i < this.routeEntries.length); i++)
      {
         var routeEntry = this.routeEntries[i];

         if (routeEntry.systemEntry.getSolarSystem().id == solarSystem.id)
         {
            rCode = true;
         }
      }

      return rCode;
   },

   /**
    * Verifies whether the given solar sytem can be added as given type. The following rules exist: - Checkpoints can
    * always be added - Otherwise, the system added must not be in the current segment
    * 
    * @param solarSystem to test
    * @param entryType as which type to be added (upro.nav.SystemRouteEntry.EntryType)
    */
   canEntryBeAdded: function(solarSystem, entryType)
   {
      var length = this.routeEntries.length;
      var isEmpty = length == 0;
      var rCode = false;

      if ((entryType == upro.nav.SystemRouteEntry.EntryType.Checkpoint)
            || (!isEmpty && (this.findSystemInSegmentOf(length - 1, solarSystem) < 0)))
      {
         rCode = true;
      }

      return rCode;
   },

   /**
    * Adds given solar system as given entry to the end of the route
    * 
    * @param solarSystem to add
    * @param entryType as which type to be added (upro.nav.SystemRouteEntry.EntryType)
    */
   addEntry: function(solarSystem, entryType)
   {
      if (this.canEntryBeAdded(solarSystem, entryType))
      {
         var isCheckpoint = entryType == upro.nav.SystemRouteEntry.EntryType.Checkpoint;

         { // create and add new entry
            var systemEntry = new upro.nav.SystemRouteEntry(solarSystem, entryType);
            var routeEntry = this.createRouteEntry(systemEntry);

            if (this.routeEntries.length == 0)
            { // the first entry is always reachable
               routeEntry.isReachable = true;
            }
            this.routeEntries.push(routeEntry);
         }
         { // run optimization
            var endPos = this.routeEntries.length - ((isCheckpoint && (this.routeEntries.length > 1)) ? 2 : 1);
            var startPos = this.findSegmentStart(endPos);

            this.optimizeSegment(startPos, endPos);
         }
         this.notify(upro.app.Notifications.ActiveRoutePathChanged);
      }
   },

   /**
    * Removes all occurrences of given solar system
    * 
    * @param solarSystem to remove
    */
   removeEntry: function(solarSystem)
   {
      var searchStart = 0;

      while (searchStart < this.routeEntries.length)
      {
         var index = this.findSystemInSegmentOf(searchStart, solarSystem);

         if (index >= 0)
         {
            var routeEntry = this.routeEntries[index];
            var entryType = routeEntry.systemEntry.getEntryType();

            if (entryType == upro.nav.SystemRouteEntry.EntryType.Checkpoint)
            {
               if (index < (this.routeEntries.length - 1))
               { // the checkpoint was not the last entry, make the next entry a checkpoint
                  this.routeEntries[index + 1].systemEntry = this.routeEntries[index + 1].systemEntry
                        .asEntryType(upro.nav.SystemRouteEntry.EntryType.Checkpoint);
                  this.deleteEntry(index);
               }
               else
               { // was last entry, simply reoptimize
                  this.deleteEntry(index);
                  startIndex = index;
               }
            }
            else
            { // a waypoint in between
               this.deleteEntry(index);
            }
         }
         else
         {
            if (searchStart == 0)
            {
               searchStart = 1;
            }
            else
            {
               searchStart = this.findSegmentEnd(searchStart) + 1;
            }
         }
      }

      this.notify(upro.app.Notifications.ActiveRoutePathChanged);
   },

   /**
    * Deletes the entry at given index. Removes any trace of its existence and starts an optimization for the
    * corresponding segment.
    * 
    * @param index to remove at
    */
   deleteEntry: function(index)
   {
      this.stopOptimizer(index, index);
      this.routeEntries.splice(index, 1);

      if (this.routeEntries.length > 0)
      {
         var segmentEnd = this.findSegmentEnd((index > 0) ? index - 1 : 0);

         for ( var i = segmentEnd + 1; i <= this.routeEntries.length; i++)
         { // deleting an entry also requires all further running optimizers must be moved
            var finder = this.optimizersByIndex[i];

            if (finder)
            {
               this.optimizersByIndex[i - 1] = finder;
               delete this.optimizersByIndex[i];
            }
         }
         this.optimizeSegment(this.findSegmentStart(segmentEnd), segmentEnd);
      }
   },

   /**
    * Starts an optimization for all segments. Typically needed if some parameters changed
    */
   optimizeAll: function()
   {
      var startSystem = 0;

      while (startSystem < this.routeEntries.length)
      {
         var end = this.findSegmentEnd(startSystem);
         var start = this.findSegmentStart(end);

         this.optimizeSegment(start, end);
         startSystem = end + 1;
      }
      this.notify(upro.app.Notifications.ActiveRoutePathChanged);
   },

   /**
    * Requests to optimize the segment between given start and end indices
    * 
    * @param startIndex inclusive start index (source system)
    * @param endIndex inclusive end index
    */
   optimizeSegment: function(startIndex, endIndex)
   {
      var routeEntry;
      var i;

      this.stopOptimizer(startIndex, endIndex + 1);
      for (i = startIndex; i <= endIndex; i++)
      { // reset previous results
         routeEntry = this.routeEntries[i];
         routeEntry.transits = [];
         if (i > startIndex)
         { // don't reset the starting checkpoint
            routeEntry.isReachable = false;
         }
      }
      {
         var waypoints = [];
         var sourceSystem = null;
         var destinationSystem = null;
         var finder = null;

         sourceSystem = this.routeEntries[startIndex].systemEntry.getSolarSystem();
         if (endIndex < (this.routeEntries.length - 1))
         { // got a checkpoint beyond the end
            routeEntry = this.routeEntries[endIndex + 1];
            var systemEntry = routeEntry.systemEntry;

            routeEntry.isReachable = false;
            destinationSystem = systemEntry.getSolarSystem();
         }
         for (i = startIndex + 1; i <= endIndex; i++)
         {
            var solarSystem = this.routeEntries[i].systemEntry.getSolarSystem();

            if (destinationSystem && (destinationSystem.id == solarSystem.id))
            { // no need to run a system both as waypoint and destination - make it fix a destination
               this.routeEntries.splice(i, 1);
               endIndex--;
               i--;
            }
            else
            {
               waypoints.push(solarSystem);
            }
         }
         finder = new upro.nav.finder.RouteFinderGeneticTSP(this.routingCapabilities, this.routingRules,
               this.filterSolarSystems, sourceSystem, waypoints, destinationSystem);

         this.optimizersByIndex[endIndex] = finder;
      }
   },

   /**
    * Runs all current optimizers for one cycle.
    * 
    * @return true if all are currently completed
    */
   runOptimizers: function()
   {
      var key = null;
      var keys = [];
      var someCompleted = false;
      var allCompleted = true;

      for (key in this.optimizersByIndex)
      {
         keys.push(key);
      }
      for ( var i = 0; i < keys.length; i++)
      {
         key = new Number(keys[i]);
         var finder = this.optimizersByIndex[key];

         if (this.runFinderBulk(finder))
         {
            this.onOptimizerCompleted(key);
            someCompleted = true;
         }
         else
         {
            allCompleted = false;
         }
      }
      if (someCompleted)
      {
         this.notify(upro.app.Notifications.ActiveRoutePathChanged);
      }

      return allCompleted;
   },

   /**
    * Runs given finder in bulk. Returns true if finder completed
    * 
    * @return true if finder completed
    */
   runFinderBulk: function(finder)
   {
      var rCode = false;

      for ( var i = 0; !rCode && (i < 100); i++)
      {
         rCode = finder.continueSearch();
      }

      return rCode;
   },

   stopOptimizer: function(startIndex, endIndex)
   {
      for ( var i = startIndex + 1; i <= endIndex; i++)
      {
         if (this.optimizersByIndex[i])
         {
            delete this.optimizersByIndex[i];
         }
      }
   },

   onOptimizerCompleted: function(endIndex)
   {
      var startIndex = this.findSegmentStart(endIndex);
      var finder = this.optimizersByIndex[endIndex];
      var foundRoute = finder.getRouteEntries();
      var lastRouteEntry = this.routeEntries[startIndex];
      var systemEntry;
      var i;

      delete this.optimizersByIndex[endIndex];
      if (foundRoute.length > 0)
      { // found a complete route
         // rewrite the start system, as it might have a different way of reaching the next system (jump type)
         this.routeEntries[startIndex].systemEntry = foundRoute[0]
               .asEntryType(upro.nav.SystemRouteEntry.EntryType.Checkpoint);
         if (endIndex < (this.routeEntries.length - 1))
         { // mark next checkpoint reachable
            this.routeEntries[1 + endIndex].isReachable = true;
         }
      }
      startIndex++; // already skip the first entry (is the starting checkpoint)
      for (i = 1; i < foundRoute.length; i++)
      {
         systemEntry = foundRoute[i];
         if (systemEntry.getEntryType() == upro.nav.SystemRouteEntry.EntryType.Waypoint)
         {
            lastRouteEntry = this.createRouteEntry(systemEntry);
            lastRouteEntry.isReachable = true;
            this.routeEntries.splice(startIndex, 1, lastRouteEntry);
            startIndex++;
         }
         else
         {
            lastRouteEntry.transits.push(systemEntry);
         }
      }
   },

   /**
    * Returns the end of the segment given index into routeEntries is part of
    * 
    * @return the end of the segment
    */
   findSegmentEnd: function(index)
   {
      var end = index + 1;
      var limit = this.routeEntries.length;

      while ((end < limit)
            && (this.routeEntries[end].systemEntry.getEntryType() != upro.nav.SystemRouteEntry.EntryType.Checkpoint))
      {
         end++;
      }

      return end - 1;
   },

   /**
    * Returns the start of the segment given index into routeEntries is part of
    * 
    * @return the start of the segment
    */
   findSegmentStart: function(index)
   {
      var start = index;

      while ((start >= 0)
            && (this.routeEntries[start].systemEntry.getEntryType() != upro.nav.SystemRouteEntry.EntryType.Checkpoint))
      {
         start--;
      }

      return (start >= 0) ? start : 0;
   },

   findSystemInSegmentOf: function(index, solarSystem)
   {
      var endIndex = this.findSegmentEnd(index);
      var startIndex = this.findSegmentStart(endIndex);
      var foundIndex = -1;
      var routeEntry;

      for ( var i = startIndex; (foundIndex < 0) && (i < (endIndex + 1)); i++)
      {
         routeEntry = this.routeEntries[i];

         if (routeEntry.systemEntry.getSolarSystem() == solarSystem)
         {
            foundIndex = i;
         }
      }

      return foundIndex;
   },

   createRouteEntry: function(systemEntry)
   {
      var routeEntry =
      {
         "systemEntry": systemEntry,
         "transits": [],
         "isReachable": false
      };

      return routeEntry;
   }

});

upro.model.proxies.ActiveRouteProxy.NAME = "ActiveRoute";
