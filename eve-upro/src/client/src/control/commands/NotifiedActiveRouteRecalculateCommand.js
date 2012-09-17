upro.ctrl.cmd.NotifiedActiveRouteRecalculateCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);

      activeRouteProxy.recalculateAllSegments();
   }
});
