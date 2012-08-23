upro.ctrl.cmd.NotifiedSetUserInterfaceVisibleCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var uiMediator = this.facade().retrieveMediator(upro.view.mediators.UiMediator.NAME);

      uiMediator.setVisible(true);
   }
});
