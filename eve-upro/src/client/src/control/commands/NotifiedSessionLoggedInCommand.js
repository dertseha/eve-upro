upro.ctrl.cmd.NotifiedSessionLoggedInCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var uiMediator = this.facade().retrieveMediator(upro.view.mediators.UiMediator.NAME);

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

      this.setupRouteListMenu(uiMediator);
      this.setupSettingsMenu(uiMediator);

      if (upro.scene.SceneSystem.SUPPORTED)
      {
         var scene = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);

         scene.createGalaxies();
      }
      else
      {
         uiMediator.setVisible(true);
      }

      this.facade().sendNotification(upro.app.Notifications.DebugMessage, "SessionLoggedIn complete");

      uiMediator.showBaseView("swCtrl", "debug"); // for now, always show debugging output
      uiMediator.showBaseView("wList", "autopilotRoute");
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
   },

   setupRouteListMenu: function(uiMediator)
   {
      var panelId = "wList";

      uiMediator.setSubMenu(panelId, "route", 0, upro.res.menu.IconData.Routing, upro.res.text.Lang
            .format("routeList.menuLabel"));

      this.facade().registerMediator(new upro.view.mediators.AutopilotRoutePanelMediator(panelId, panelId + ".route"));
   },

   setupSettingsMenu: function(uiMediator)
   {
      var panelId = "swCtrl";

      uiMediator.setSubMenu(panelId, "settings", 4, upro.res.menu.IconData.Settings, upro.res.text.Lang
            .format("settings.menuLabel"));

      this.facade().registerMediator(new upro.view.mediators.DebugPanelMediator(panelId, panelId + ".settings"));
   }

});
