upro.ctrl.cmd.NotifiedSetAutopilotRouteRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var autopilotProxy = this.facade().retrieveProxy(upro.model.proxies.AutopilotProxy.NAME);
      var notifyBody = notification.getBody();

      autopilotProxy.setRoute(notifyBody);
   }
});
