upro.view.mediators.InGameBrowserMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.InGameBrowserMediator.NAME, new upro.eve.NullInGameBrowser());

      this.lastReportedRouteIndex = -1;
      this.expectedNextRouteIndex = 0;
   },

   onRegister: function()
   {

   },

   /**
    * Activates or deactivates the control over the client functions
    * 
    * @param active boolean whether the client functions should be enabled
    */
   setControlActive: function(active)
   {
      var igb = null;

      if (active)
      {
         igb = upro.eve.getInGameBrowser();
      }
      else
      {
         igb = new upro.eve.NullInGameBrowser();
      }
      this.setViewComponent(igb);
   },

   /**
    * Clears the autopilot route
    */
   clearAutopilotRoute: function()
   {
      var igb = this.getViewComponent();

      igb.clearAllWaypoints();
      this.lastReportedRouteIndex = -1;
      this.expectedNextRouteIndex = 0;
   },

   /**
    * Sets the route and notes the next index within it
    * 
    * @param route the route to use
    * @param nextRouteIndex the next pending waypoint to reach
    */
   setAutopilotNextRouteIndex: function(route, nextRouteIndex)
   {
      var igb = this.getViewComponent();
      var limit = nextRouteIndex + upro.view.mediators.InGameBrowserMediator.AUTOPILOT_NEXT_SYSTEM_COUNT;

      if (limit > route.length)
      {
         limit = route.length;
      }

      if (this.expectedNextRouteIndex < nextRouteIndex)
      {
         upro.sys.log('Skipped some systems on autopilot route, resetting');
         igb.clearAllWaypoints();
         this.lastReportedRouteIndex = nextRouteIndex - 1;
      }

      for ( var i = this.lastReportedRouteIndex + 1; i < limit; i++)
      {
         var routeEntry = route[i];

         igb.addWaypoint(routeEntry.solarSystemId);
         this.lastReportedRouteIndex = i;
      }
      this.expectedNextRouteIndex = nextRouteIndex + 1;
   }

});

upro.view.mediators.InGameBrowserMediator.NAME = "IGB";

/**
 * How many systems shall be displayed in the autopilot of the client. Must be a small number, so that it is filled
 * quickly enough when set, but have at least two entries: When the actual ship autopilot reaches the next system it
 * takes some time until the next system is registered. If that is too slow, the route is not extended and the ship
 * autopilot might disengage.
 * 
 * Three seems to be a reasonable number.
 */
upro.view.mediators.InGameBrowserMediator.AUTOPILOT_NEXT_SYSTEM_COUNT = 3;
