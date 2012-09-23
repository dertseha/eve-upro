upro.ctrl.cmd.NotifiedSelectSolarSystemCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var solarSystem = notification.getBody();

      if (upro.scene.SceneSystem.SUPPORTED)
      {
         this.centerSceneOnSolarSystem(solarSystem);
         this.openContextMenu(solarSystem);
      }
   },

   centerSceneOnSolarSystem: function(solarSystem)
   {
      var sceneMediator = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);

      sceneMediator.centerOnSolarSystem(solarSystem);
   },

   openContextMenu: function(solarSystem)
   {
      var menuMediator = this.facade().retrieveMediator(upro.view.mediators.SolarSystemContextMenuMediator.NAME);

      menuMediator.show(
      {
         x: 0,
         y: 0
      }, solarSystem);
   }
});
