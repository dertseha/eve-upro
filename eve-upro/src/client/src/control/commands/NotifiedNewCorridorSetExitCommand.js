upro.ctrl.cmd.NotifiedNewCorridorSetExitCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var jumpCorridorProxy = this.facade().retrieveProxy(upro.model.proxies.JumpCorridorProxy.NAME);
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.UserSessionProxy.NAME);
      var entrySolarSystem = sessionProxy.getCorridorPreparationSolarSystem();
      var exitSolarSystem = notification.getBody();
      var jumpType = sessionProxy.getCorridorPreparationJumpType();

      jumpCorridorProxy.createJumpCorridor('', entrySolarSystem, exitSolarSystem, jumpType);
      sessionProxy.setCorridorPreparation(null, null);
   }
});
