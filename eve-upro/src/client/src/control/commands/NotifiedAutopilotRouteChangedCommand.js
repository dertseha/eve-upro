upro.ctrl.cmd.NotifiedAutopilotRouteChangedCommand = Class.create(SimpleCommand,
      {
         execute: function(notification)
         {
            var autopilotProxy = this.facade().retrieveProxy(upro.model.proxies.AutopilotProxy.NAME);
            var route = autopilotProxy.getRoute();

            if (upro.scene.SceneSystem.SUPPORTED)
            {
               this.displayRouteOnMap(route);
            }
            this.setClientRoute(route);
         },

         setClientRoute: function(route)
         {
            var igbMediator = this.facade().retrieveMediator(upro.view.mediators.InGameBrowserMediator.NAME);
            var igb = igbMediator.getViewComponent();

            igb.clearAllWaypoints();
            igbMediator.setLastReportedRouteIndex(-1);
         },

         displayRouteOnMap: function(route)
         {
            var universeProxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME);
            var sceneMediator = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);
            var highlightMediator = this.facade().retrieveMediator(
                  upro.view.mediators.SolarSystemHighlightMediator.NAME);
            var okColor = [ 1.0, 1.0, 0.0, 2.0 ];
            var lastEntry = null;
            var lastSystem = null;
            var waypointCounter = 1;

            sceneMediator.clearRoute('Autopilot');
            highlightMediator.removeHighlights(/Autopilot:.*/);

            for ( var i = 0; i < route.length; i++)
            {
               var routeEntry = route[i];
               var isReachable = true;
               var solarSystem = universeProxy.findSolarSystemById(routeEntry.solarSystemId);

               if (lastEntry)
               {
                  isReachable = lastEntry.nextJumpType != upro.nav.JumpType.None;
                  sceneMediator.addRouteEdge('Autopilot', lastSystem, solarSystem, isReachable ? okColor : [ 1.0, 0.0,
                        0.0 ]);
               }
               if (routeEntry.entryType != upro.nav.SystemRouteEntry.EntryType.Transit)
               {
                  this.setSystemOverlay(highlightMediator, solarSystem, waypointCounter, isReachable);
                  waypointCounter++;
               }

               lastEntry = routeEntry;
               lastSystem = solarSystem;
            }
         },

         /**
          * Key creation helper for the projection tracker
          * 
          * @param solarSystem for which the key shall be created
          */
         createKey: function(solarSystem)
         {
            return "Autopilot:" + solarSystem.id;
         },

         /**
          * Sets the overlay for a given system and given index
          * 
          * @param highlightMediator the mediator to use
          * @param solarSystem the system to add an overlay for
          * @param index route index
          * @param isReachable whether the waypoint is valid in the route
          */
         setSystemOverlay: function(highlightMediator, solarSystem, index, isReachable)
         {
            var key = this.createKey(solarSystem);
            var entry = highlightMediator.getHighlight(key);

            if (!entry)
            {
               var textColor = isReachable ? "#FFFF00" : "#FF0000";
               var bracketColor = isReachable ? "#808000" : "800000";

               var textOptions =
               {
                  value: "" + index + ": " + solarSystem.name,
                  color: textColor,
                  height: upro.ctrl.cmd.NotifiedActiveRoutePathChangedCommand.TEXT_HEIGHT,
                  bracketSide: 3,
                  bracketPadding: upro.hud.Button.Scale * -1,
                  textAnchor: 'end'
               };
               var bracketOptions =
               {
                  size: 5,
                  fillColor: bracketColor,
                  fillOpacity: 0.1,
                  strokeColor: bracketColor,
                  strokeOpacity: 0.8
               };

               entry = highlightMediator.addHighlight(key, textOptions, bracketOptions);
               entry.setSolarSystem(solarSystem);
               entry.show();
            }
            else
            {
               var textOptions =
               {
                  value: entry.getTextOption("value") + "\r\n" + index + ": " + solarSystem.name
               };

               entry.setTextOptions(textOptions);
            }
         }

      });
