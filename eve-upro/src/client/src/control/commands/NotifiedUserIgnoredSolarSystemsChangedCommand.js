
upro.ctrl.cmd.NotifiedUserIgnoredSolarSystemsChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var ignored = notification.getBody();

      activeRouteProxy.setIgnoredSolarSystemIds(ignored);
   }
});
