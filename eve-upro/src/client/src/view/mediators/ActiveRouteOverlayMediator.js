/**
 * This mediator is responsible of showing the highlights of route waypoints,
 * using sw-projections from the scene.
 */
upro.view.mediators.ActiveRouteOverlayMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.ActiveRouteOverlayMediator.NAME, null);

      this.systems = {};
   },

   /**
    * Removes all system overlays
    */
   clear: function()
   {
      for (var key in this.systems)
      {
         this.removeSystemOverlay(key);
      }
   },

   /**
    * Sets an overlay for given system and information
    */
   setSystemOverlay: function(solarSystem, index, valid)
   {
      var key = this.createKey(solarSystem);
      var entry = this.systems[key];

      if (!entry)
      {
         var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
         var sceneMediator = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);
         var textColor = valid ? "#FFFF00" : "#FF0000";
         var bracketColor = valid ? "#808000" : "800000";

         entry =
         {
            "solarSystem": solarSystem,
            "bracket": null,
            "info": null,
            "text": "" + index + ": " + solarSystem.name
         };
         entry.bracket = hudSystem.createHexagon(5).hide();
         entry.bracket.attr({ "stroke": bracketColor, "fill": bracketColor, "fill-opacity": 0.1, "stroke-opacity": 0.8});
         entry.info = hudSystem.paper.text(0, 0, "").hide();
         entry.info.attr({"fill": textColor, "font-size": upro.view.mediators.ActiveRouteOverlayMediator.TEXT_HEIGHT, "text-anchor": "start"});
         entry.info.attr({"text": entry.text});
         this.systems[key] = entry;

         sceneMediator.addSolarSystemTrack(key, solarSystem, this.onProjectionChanged.bind(this, key));
      }
      else
      {
         entry.text += "\r\n" + index + ": " + solarSystem.name;
         entry.info.attr({"text": entry.text});
      }
   },

   /**
    * Key creation helper for the projection tracker
    * @param solarSystem for which the key shall be created
    */
   createKey: function(solarSystem)
   {
      return "RouteOverlay:" + solarSystem.id;
   },

   /**
    * Removes the system overlay with given key
    * @param key to remove
    */
   removeSystemOverlay: function(key)
   {
      var sceneMediator = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);
      var entry = this.systems[key];

      if (entry)
      {
         delete this.systems[key];
         sceneMediator.removeSolarSystemTrack(key, entry.solarSystem);

         entry.bracket.remove();
         entry.info.remove();
      }
   },

   /**
    * Callback for a change in a projection
    * @param key for which the callback is
    * @param tracker running the projection
    * @param valid whether the projection is confirmed
    */
   onProjectionChanged: function(key, tracker, confirmed)
   {
      var entry = this.systems[key];
      var realPos = tracker.getProjectedPosition();

      if (realPos)
      {
         var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
         var pixel = hudSystem.realToViewCoordinates(realPos);
         var offset = upro.hud.Button.getOffset[2](0);

         entry.bracket.attr({"transform": "T" + pixel.x + "," + pixel.y});
         entry.bracket.show();
         entry.info.attr({"x": pixel.x + offset.x, "y": pixel.y + offset.y});
         entry.info.show();
      }
      else
      {
         entry.bracket.hide();
         entry.info.hide();
      }
   }
});

upro.view.mediators.ActiveRouteOverlayMediator.NAME = "ActiveRouteOverlay";
upro.view.mediators.ActiveRouteOverlayMediator.TEXT_HEIGHT = 15;
