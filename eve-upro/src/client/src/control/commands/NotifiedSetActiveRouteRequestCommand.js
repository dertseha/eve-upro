upro.ctrl.cmd.NotifiedSetActiveRouteRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var route = notification.getBody();

      activeRouteProxy.setRoute(route.getRoute());
      activeRouteProxy.syncRoute();
   }
});
