upro.ctrl.cmd.NotifiedAutopilotNextRouteIndexChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var autopilotProxy = this.facade().retrieveProxy(upro.model.proxies.AutopilotProxy.NAME);
      var igbMediator = this.facade().retrieveMediator(upro.view.mediators.InGameBrowserMediator.NAME);
      var igb = igbMediator.getViewComponent();
      var route = autopilotProxy.getRoute();
      var nextRouteIndex = autopilotProxy.getNextRouteIndex();
      var limit = nextRouteIndex
            + upro.ctrl.cmd.NotifiedAutopilotNextRouteIndexChangedCommand.AUTOPILOT_NEXT_SYSTEM_COUNT;

      if (limit > route.length)
      {
         limit = route.length;
      }

      for ( var i = igbMediator.getLastReportedRouteIndex() + 1; i < limit; i++)
      {
         var routeEntry = route[i];

         igb.addWaypoint(routeEntry.solarSystemId);
         igbMediator.setLastReportedRouteIndex(i);
      }
   }
});

/**
 * How many systems shall be displayed in the autopilot of the client. Must be a small number, so that it is filled
 * quickly enough when set, but have at least two entries: When the actual ship autopilot reaches the next system it
 * takes some time until the next system is registered. If that is too slow, the route is not extended and the ship
 * autopilot might disengage.
 * 
 * Three seems a reasonable number.
 */
upro.ctrl.cmd.NotifiedAutopilotNextRouteIndexChangedCommand.AUTOPILOT_NEXT_SYSTEM_COUNT = 3;
