upro.ctrl.cmd.NotifiedJumpCorridorSelectionRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var jumpCorridorProxy = this.facade().retrieveProxy(upro.model.proxies.JumpCorridorProxy.NAME);
      var id = notification.getBody();

      jumpCorridorProxy.selectJumpCorridor(id);
   }
});
