upro.ctrl.cmd.NotifiedJumpCorridorSelectedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var sharedObjectInterestMediator = this.facade().retrieveMediator(
            upro.view.mediators.SharedObjectInterestPanelMediator.NAME);
      var jumpCorridorEditMediator = this.facade().retrieveMediator(
            upro.view.mediators.JumpCorridorEditPanelMediator.NAME);
      var jumpCorridorInfo = notification.getBody();

      sharedObjectInterestMediator.setSharedObject(jumpCorridorInfo);
      jumpCorridorEditMediator.showJumpCorridor(jumpCorridorInfo);
   }
});
