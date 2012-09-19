upro.ctrl.cmd.NotifiedActiveRouteUpdateRouteRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var routeProxy = this.facade().retrieveProxy(upro.model.proxies.RouteProxy.NAME);
      var route = activeRouteProxy.getRoute();
      var notifyBody = notification.getBody();
      var info =
      {
         name: notifyBody.name,
         route: route
      };

      routeProxy.updateRoute(notifyBody.id, info);
   }
});
