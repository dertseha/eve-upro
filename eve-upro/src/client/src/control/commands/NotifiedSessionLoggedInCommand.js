upro.ctrl.cmd.NotifiedSessionLoggedInCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      this.facade().registerProxy(new upro.model.proxies.UniverseProxy());
      this.facade().registerProxy(new upro.model.proxies.UserViewDataProxy());
      this.facade().registerProxy(new upro.model.proxies.LocationTrackerProxy());

      this.facade().registerProxy(new upro.model.proxies.ActiveRouteProxy());

      this.facade().registerMediator(new upro.view.mediators.MainContextMenuMediator());
      this.facade().registerMediator(new upro.view.mediators.SolarSystemHighlightMediator());
      this.facade().registerMediator(new upro.view.mediators.SolarSystemContextMenuMediator());
      this.facade().registerMediator(new upro.view.mediators.ActiveRouteOverlayMediator());
      this.facade().registerMediator(new upro.view.mediators.CurrentLocationHighlightMediator());
      if (upro.scene.SceneSystem.SUPPORTED)
      {
         var scene = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);

         scene.createGalaxies();
      }
   }

});
