
upro.ctrl.cmd.NotifiedScenePointerActivationCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
      var scene = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);
      var mainMenuMediator = this.facade().retrieveMediator(upro.view.mediators.MainContextMenuMediator.NAME);
      var realPos = notification.getBody();
      var pickResult = scene.pick(realPos);
      var mainMenuWasVisible = mainMenuMediator.isVisible();

      hudSystem.setActiveContextMenu(null);
      if (pickResult)
      {
         var pickedObject = pickResult.getRefObject();

         if (pickedObject instanceof upro.nav.SolarSystem)
         {
            var menuMediator = this.facade().retrieveMediator(upro.view.mediators.SolarSystemContextMenuMediator.NAME);

            menuMediator.show(pickResult.getViewPosition(), pickedObject);
         }
      }
      else
      {  // clicked into void

         if (!mainMenuWasVisible)
         {
            mainMenuMediator.show(realPos, null);
         }
      }
   }

});
