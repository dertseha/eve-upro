
upro.ctrl.cmd.NotifiedActiveRouteResetCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);

      activeRouteProxy.resetRoute();
   }
});
