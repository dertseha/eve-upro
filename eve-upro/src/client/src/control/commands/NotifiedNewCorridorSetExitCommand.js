upro.ctrl.cmd.NotifiedNewCorridorSetExitCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.UserSessionProxy.NAME);
      // var solarSystemEntry = sessionProxy.getCorridorPreparationSolarSystem();
      // var solarSystemExit = notification.getBody();
      // var jumpType = sessionProxy.getCorridorPreparationJumpType();

      // TODO: do it!
      sessionProxy.setCorridorPreparation(null, null);
   }
});
