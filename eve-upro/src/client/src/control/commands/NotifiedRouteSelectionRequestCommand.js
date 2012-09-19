upro.ctrl.cmd.NotifiedRouteSelectionRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var routeProxy = this.facade().retrieveProxy(upro.model.proxies.RouteProxy.NAME);
      var id = notification.getBody();

      routeProxy.selectRoute(id);
   }
});
