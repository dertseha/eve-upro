upro.ctrl.cmd.NotifiedActiveRoutePathChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var sceneMediator = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);
      var highlightMediator = this.facade().retrieveMediator(upro.view.mediators.SolarSystemHighlightMediator.NAME);
      var routeEntry, isReachable;
      var lastSystem = null, temp = null;
      var waypointCounter = 1;
      var solarSystem = null;

      sceneMediator.clearRoute();
      highlightMediator.removeHighlights(/RouteOverlay:.*/);

      for ( var i = 0; i < activeRouteProxy.routeEntries.length; i++)
      {
         routeEntry = activeRouteProxy.routeEntries[i];
         isReachable = routeEntry.isReachable;
         solarSystem = routeEntry.systemEntry.getSolarSystem();

         if (lastSystem)
         {
            sceneMediator.addRouteEdge(lastSystem, solarSystem, isReachable);
         }
         this.setSystemOverlay(highlightMediator, solarSystem, waypointCounter, isReachable);
         waypointCounter++;

         lastSystem = solarSystem;
         for ( var j = 0; j < routeEntry.transits.length; j++)
         {
            temp = routeEntry.transits[j].getSolarSystem();
            sceneMediator.addRouteEdge(lastSystem, temp, true);
            lastSystem = temp;
         }
      }
   },

   /**
    * Key creation helper for the projection tracker
    * 
    * @param solarSystem for which the key shall be created
    */
   createKey: function(solarSystem)
   {
      return "RouteOverlay:" + solarSystem.id;
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
            bracketSide: 2,
            bracketPadding: upro.hud.Button.Scale * -1
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

upro.ctrl.cmd.NotifiedActiveRoutePathChangedCommand.TEXT_HEIGHT = 15;
