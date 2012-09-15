upro.ctrl.cmd.NotifiedActiveRouteSetAutopilotCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var autopilotProxy = this.facade().retrieveProxy(upro.model.proxies.AutopilotProxy.NAME);
      var route = [];
      var systemRouteEntries = activeRouteProxy.getRoute();

      systemRouteEntries.forEach(function(routeEntry)
      {
         route.push(routeEntry.toRawData());
      });

      autopilotProxy.setRoute(route);
   }
});
