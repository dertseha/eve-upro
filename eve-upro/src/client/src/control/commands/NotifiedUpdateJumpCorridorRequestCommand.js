upro.ctrl.cmd.NotifiedUpdateJumpCorridorRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var jumpCorridorProxy = this.facade().retrieveProxy(upro.model.proxies.JumpCorridorProxy.NAME);
      var notifyBody = notification.getBody();

      jumpCorridorProxy.updateJumpCorridor(notifyBody.id, notifyBody.data);
   }
});
