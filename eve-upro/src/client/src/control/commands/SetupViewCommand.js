upro.ctrl.cmd.SetupViewCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      this.facade().registerMediator(new upro.view.mediators.InGameBrowserMediator());
      this.facade().registerMediator(new upro.view.mediators.DocumentMouseMediator());
      this.facade().registerMediator(new upro.view.mediators.HudMediator());

      if (upro.scene.SceneSystem.SUPPORTED)
      {
         this.facade().registerMediator(new upro.view.mediators.SceneMediator());
      }
   }
});
