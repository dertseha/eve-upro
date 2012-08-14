upro.ctrl.cmd.NotifiedAutopilotNextRouteIndexChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var autopilotProxy = this.facade().retrieveProxy(upro.model.proxies.AutopilotProxy.NAME);
      var nextRouteIndex = autopilotProxy.getNextRouteIndex();

      upro.sys.log('Autopilot next index: ' + nextRouteIndex);
   }
});
