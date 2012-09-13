upro.ctrl.cmd.NotifiedJumpCorridorSelectedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var jumpCorridorEditMediator = this.facade().retrieveMediator(
            upro.view.mediators.JumpCorridorEditPanelMediator.NAME);
      var jumpCorridorInfo = notification.getBody();

      jumpCorridorEditMediator.showJumpCorridor(jumpCorridorInfo);
   }
});
