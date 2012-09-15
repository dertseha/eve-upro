/**
 * An optimizer for path finding
 */
upro.model.proxies.RouteOptimizerProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.RouteOptimizerProxy.NAME, null);

      this.filterSolarSystems = [];
      this.routingCapabilities = [];
      this.routingRules = [];

      this.requests = [];
   },

   /** {@inheritDoc} */
   onRegister: function()
   {
      this.timer = new upro.sys.Timer.getSingleTimer(this.runOptimizers.bind(this));
   },

   /**
    * Sets the list of ignored solar systems by their ID
    * 
    * @param solarSystemIds an array of IDs
    */
   setIgnoredSolarSystemIds: function(solarSystemIds)
   {
      var that = this;

      this.filterSolarSystems = [];
      solarSystemIds.forEach(function(id)
      {
         that.filterSolarSystems.push(new upro.nav.finder.PathFinderFilterSystem(id));
      });
   },

   /**
    * Sets the routing capabilities
    * 
    * @param capabilities an array of PathFinderCapability objects
    */
   setRoutingCapabilities: function(capabilities)
   {
      this.routingCapabilities = capabilities;
   },

   /**
    * Sets the routing rules
    * 
    * @param rules an array of PathFinderCostRule objects
    */
   setRoutingRules: function(rules)
   {
      this.routingRules = rules;
   },

   /**
    * Requests to perform a route optimization starting with given source solar system over a list of waypoints to the
    * (optional) destination system.
    * 
    * @param id key for the search
    * @param sourceSolarSystem source
    * @param waypoints array of waypoints
    * @param destinationSolarSystem optional destination
    */
   requestRoute: function(id, sourceSolarSystem, waypoints, destinationSolarSystem)
   {
      var request =
      {
         id: id,
         sourceSolarSystem: sourceSolarSystem,
         waypoints: waypoints,
         destinationSolarSystem: destinationSolarSystem,
         finder: this.createFinder(sourceSolarSystem, waypoints, destinationSolarSystem)
      };

      this.cancelRequest(id);
      this.requests.push(request);
      this.timer.start(0);
   },

   /**
    * Requests to cancel the route optimization by given ID.
    * 
    * @param id key of the previously started search
    */
   cancelRequest: function(id)
   {
      for ( var i = 0; i < this.requests.length; i++)
      {
         var request = this.requests[i];

         if (request.id == id)
         {
            this.requests.splice(i, 1);
            i--;
         }
      }
   },

   /**
    * Factory method for creating a RouteFinder instance
    * 
    * @param sourceSolarSystem source solar system
    * @param waypoints waypoints
    * @param destinationSolarSystem destination solar system
    * @returns {upro.nav.finder.RouteFinder} instance
    */
   createFinder: function(sourceSolarSystem, waypoints, destinationSolarSystem)
   {
      var finder = new upro.nav.finder.RouteFinderGeneticTSP(this.routingCapabilities, this.routingRules,
            this.filterSolarSystems, sourceSolarSystem, waypoints, destinationSolarSystem);

      return finder;
   },

   /**
    * Runs the optimizers for one cycle, restarts timer again if more is necessary
    */
   runOptimizers: function()
   {
      var endTime = upro.sys.Time.tickMSec() + upro.model.proxies.RouteOptimizerProxy.BULK_LIMIT_TIME_MSEC;

      for ( var i = 0; i < this.requests.length; i++)
      {
         var request = this.requests[i];

         if (this.processRequest(request, endTime))
         {
            this.finishRequest(request);
            this.requests.splice(i, 1);
            i--;
         }
      }
      if (this.requests.length > 0)
      {
         this.timer.start(0);
      }
   },

   /**
    * Runs the finder of given request until it is finished or the end time has been reached
    * 
    * @param request to run
    * @param endTime when to stop processing
    * @returns {Boolean} true if the finder was completed
    */
   processRequest: function(request, endTime)
   {
      var rCode = false;

      while (!rCode && (upro.sys.Time.tickMSec() < endTime))
      {
         rCode = request.finder.continueSearch();
      }

      return rCode;
   },

   /**
    * Finishes the request; Extracts the result (if available) and sends notification
    * 
    * @param request the request to finish up
    */
   finishRequest: function(request)
   {
      var foundRoute = request.finder.getRouteEntries();
      var notifyBody =
      {
         id: request.id,
         route: []
      };

      if (foundRoute.length > 0)
      {
         notifyBody.route.push(foundRoute[0].asEntryType(upro.nav.SystemRouteEntry.EntryType.Checkpoint));
         for ( var i = 1; i < foundRoute.length; i++)
         {
            var systemEntry = foundRoute[i];

            notifyBody.route.push(systemEntry);
         }
      }
      this.facade().sendNotification(upro.app.Notifications.RouteOptimizerFinished, notifyBody);
   }
});

upro.model.proxies.RouteOptimizerProxy.NAME = "RouteOptimizer";

/** How long one go at optimizing the paths shall take */
upro.model.proxies.RouteOptimizerProxy.BULK_LIMIT_TIME_MSEC = 20;
