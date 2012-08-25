upro.ctrl.cmd.SetupViewCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var uiMediator = new upro.view.mediators.UiMediator();

      this.facade().registerMediator(new upro.view.mediators.InGameBrowserMediator());
      this.facade().registerMediator(new upro.view.mediators.HudMediator());
      this.facade().registerMediator(uiMediator);

      if (upro.scene.SceneSystem.SUPPORTED)
      {
         uiMediator.setBaseBlur();
         this.facade().registerMediator(new upro.view.mediators.DocumentMouseMediator());
         this.facade().registerMediator(new upro.view.mediators.SceneMediator());
         this.facade().registerMediator(new upro.view.mediators.HideUiSideButtonMediator("westBar"));
      }
   }
});
