/**
 * A route finder creates a route between a source system and a list of waypoint systems
 * and to (but not including!) a destination system.
 */
upro.nav.finder.RouteFinder = Class.create(
{
   initialize: function(capabilities, rules, filters, sourceSystem, waypoints, destinationSystem)
   {
      this.capabilities = capabilities;
      this.rules = rules;
      this.filters = filters;

      this.sourceSystem = sourceSystem;
      this.waypoints = waypoints;
      this.destinationSystem = destinationSystem;

      this.pendingTask = undefined;
      this.route = [];
   },


   /**
    * Continues an ongoing search or starts a new one
    * @return true if the search is completed
    */
   continueSearch: function()
   {
      if (this.pendingTask === undefined)
      {  // start a new search
         this.clearRoute();
         this.pendingTask = this.internalStart;
      }
      if (this.pendingTask !== undefined)
      {  // got something to do
         this.pendingTask = this.pendingTask();
      }

      return this.pendingTask === undefined;
   },

   /**
    * The internal start function. Needs to be overwritten to have this thing do
    * something.
    * @return a local function to call next time
    */
   internalStart: function()
   {
      return undefined;
   },

   /**
    * Returns the current route entries. An array of SystemRouteEntry instances.
    * Entries will have types of either Waypoint or Transit. The start system
    * will be Waypoint as well - the user should convert it to Checkpoint if needed.
    * @return the current route entries
    */
   getRouteEntries: function()
   {
      return this.route;
   },

   /**
    * Adds the given system to the route
    * @param solarSystem the solar system to add
    * @param entryType the entry type
    * @param jumpType the jump type
    */
   addRouteEntry: function(solarSystem, entryType, jumpType)
   {
      this.route.push(new upro.nav.SystemRouteEntry(solarSystem, entryType, jumpType));
   },

   /**
    * Resets the route
    */
   clearRoute: function()
   {
      this.route = [];
   },

   /**
    * Cleanup procedure on a failed search. Clears the route.
    */
   searchFailed: function()
   {
      this.clearRoute();
   }

});
