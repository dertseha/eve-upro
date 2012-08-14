upro.ctrl.cmd.NotifiedAutopilotRouteChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var autopilotProxy = this.facade().retrieveProxy(upro.model.proxies.AutopilotProxy.NAME);
      var route = autopilotProxy.getRoute();

      upro.sys.log('Autopilot new route: ' + Object.toJSON(route));
   }
});
