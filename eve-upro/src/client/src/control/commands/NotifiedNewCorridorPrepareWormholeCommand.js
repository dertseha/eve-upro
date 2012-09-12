upro.ctrl.cmd.NotifiedNewCorridorPrepareWormholeCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.UserSessionProxy.NAME);
      var solarSystem = notification.getBody();

      sessionProxy.setCorridorPreparation(solarSystem, upro.nav.JumpType.DynamicWormhole);

      // {
      // var jumpCorridorProxy = this.facade().retrieveProxy(upro.model.proxies.JumpCorridorProxy.NAME);
      //
      // jumpCorridorProxy.setJumpCorridor(undefined, "test", 30002981, 30002510, upro.nav.JumpType.DynamicWormhole);
      // }
   }
});
