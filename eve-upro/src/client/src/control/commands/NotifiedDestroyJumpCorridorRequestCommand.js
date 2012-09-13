upro.ctrl.cmd.NotifiedDestroyJumpCorridorRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var jumpCorridorProxy = this.facade().retrieveProxy(upro.model.proxies.JumpCorridorProxy.NAME);
      var id = notification.getBody();

      jumpCorridorProxy.destroyJumpCorridor(id);
   }
});
