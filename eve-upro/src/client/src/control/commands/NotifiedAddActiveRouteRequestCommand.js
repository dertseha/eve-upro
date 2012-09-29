upro.ctrl.cmd.NotifiedAddActiveRouteRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var route = notification.getBody();
      var changedIds = activeRouteProxy.addRoute(route.getRoute());

      activeRouteProxy.syncRoute();
      activeRouteProxy.updateOptimizer([], changedIds);
   }
});
