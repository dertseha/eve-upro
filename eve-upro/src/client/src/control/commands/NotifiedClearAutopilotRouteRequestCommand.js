upro.ctrl.cmd.NotifiedClearAutopilotRouteRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var autopilotProxy = this.facade().retrieveProxy(upro.model.proxies.AutopilotProxy.NAME);

      autopilotProxy.setRoute([]);
   }
});
