upro.ctrl.cmd.NotifiedActiveRouteCreateNewRouteRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var routeProxy = this.facade().retrieveProxy(upro.model.proxies.RouteProxy.NAME);
      var route = activeRouteProxy.getRoute();
      var notifyBody = notification.getBody();

      routeProxy.createRoute(notifyBody.name, route);
   }
});
