upro.ctrl.cmd.NotifiedActiveRouteSetAutopilotCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var autopilotProxy = this.facade().retrieveProxy(upro.model.proxies.AutopilotProxy.NAME);

      autopilotProxy.setRoute(activeRouteProxy.getRoute());
   }
});
