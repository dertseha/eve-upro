upro.ctrl.cmd.NotifiedDestroyRouteRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var routeProxy = this.facade().retrieveProxy(upro.model.proxies.RouteProxy.NAME);
      var id = notification.getBody();

      routeProxy.destroyRoute(id);
   }
});
