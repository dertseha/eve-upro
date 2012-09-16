upro.ctrl.cmd.NotifiedUserIgnoredSolarSystemsChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var routeOptimizerProxy = this.facade().retrieveProxy(upro.model.proxies.RouteOptimizerProxy.NAME);
      var ignored = notification.getBody();

      routeOptimizerProxy.setIgnoredSolarSystemIds(ignored);
   }
});
