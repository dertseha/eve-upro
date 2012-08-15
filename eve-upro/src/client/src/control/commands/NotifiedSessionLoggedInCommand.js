upro.ctrl.cmd.NotifiedSessionLoggedInCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      this.facade().registerProxy(new upro.model.proxies.UniverseProxy());
      this.facade().registerProxy(new upro.model.proxies.UserViewDataProxy());
      this.facade().registerProxy(new upro.model.proxies.LocationTrackerProxy());

      this.facade().registerProxy(new upro.model.proxies.AutopilotProxy());
      this.facade().registerProxy(new upro.model.proxies.ActiveRouteProxy());

      this.facade().registerMediator(new upro.view.mediators.MainContextMenuMediator());
      {
         var highlightMediator = new upro.view.mediators.SolarSystemHighlightMediator();

         this.facade().registerMediator(highlightMediator);
         this.setupHoverPosHighlight(highlightMediator);
         this.setupCurLocationHighlight(highlightMediator);
      }

      this.facade().registerProxy(new upro.model.proxies.UserSessionProxy());
      this.facade().registerProxy(new upro.model.proxies.UserSettingsProxy());

      this.facade().registerMediator(new upro.view.mediators.SolarSystemContextMenuMediator());
      if (upro.scene.SceneSystem.SUPPORTED)
      {
         var scene = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);

         scene.createGalaxies();
      }
   },

   setupHoverPosHighlight: function(highlightMediator)
   {
      var textOptions =
      {
         color: "#FFFFFF",
         height: upro.view.mediators.SolarSystemHighlightMediator.TEXT_HEIGHT
      };
      var bracketOptions =
      {
         fillColor: "#423f22",
         fillOpacity: 0.2,
         strokeColor: "#741",
         strokeOpacity: 0.3
      };

      highlightMediator.addHighlight("HoverPos", textOptions, bracketOptions);
   },

   setupCurLocationHighlight: function(highlightMediator)
   {
      var textOptions =
      {
         color: "#00C0F0",
         height: 15,
         bracketSide: 1,
         bracketPadding: upro.hud.Button.Scale * -2
      };
      var bracketOptions =
      {
         fillColor: "#FFFFFF",
         fillOpacity: 0.1,
         strokeColor: "#FFFFFF",
         strokeOpacity: 0.8,
         size: 5
      };

      highlightMediator.addHighlight("CurLocation", textOptions, bracketOptions);
   }

});
