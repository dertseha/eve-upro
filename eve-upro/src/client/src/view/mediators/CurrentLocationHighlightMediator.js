/**
 * This mediator is responsible of showing the highlights of the current location, using sw-projections from the scene.
 */
upro.view.mediators.CurrentLocationHighlightMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.CurrentLocationHighlightMediator.NAME, null);

      this.key = "CurLocation";
      this.system = null;
      this.entry = null;
   },

   /**
    * Removes the overlay
    */
   clear: function()
   {
      this.removeSystemOverlay();
   },

   /**
    * Sets an overlay for given system and information
    */
   setSystemOverlay: function(solarSystem)
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
      var sceneMediator = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);
      var textColor = "#FF8040";
      var bracketColor = "#FFFFFF";
      var entry =
      {
         "solarSystem": solarSystem,
         "bracket": null,
         "info": null,
         "text": solarSystem.name
      };

      this.removeSystemOverlay();

      entry.bracket = hudSystem.createHexagon(5).hide();
      entry.bracket.attr(
      {
         "stroke": bracketColor,
         "fill": bracketColor,
         "fill-opacity": 0.1,
         "stroke-opacity": 0.8
      });
      entry.info = hudSystem.paper.text(0, 0, "").hide();
      entry.info.attr(
      {
         "fill": textColor,
         "font-size": upro.view.mediators.ActiveRouteOverlayMediator.TEXT_HEIGHT,
         "text-anchor": "start"
      });
      entry.info.attr(
      {
         "text": entry.text
      });
      this.entry = entry;

      sceneMediator.addSolarSystemTrack(this.key, solarSystem, this.onProjectionChanged.bind(this, this.key));
   },

   /**
    * Removes the system overlay
    */
   removeSystemOverlay: function()
   {
      if (this.entry)
      {
         var sceneMediator = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);

         sceneMediator.removeSolarSystemTrack(this.key, this.entry.solarSystem);

         this.entry.bracket.remove();
         this.entry.info.remove();
         this.entry = null;
      }
   },

   /**
    * Callback for a change in a projection
    * 
    * @param key for which the callback is
    * @param tracker running the projection
    * @param valid whether the projection is confirmed
    */
   onProjectionChanged: function(key, tracker, confirmed)
   {
      var entry = this.entry;
      var realPos = tracker.getProjectedPosition();

      if (realPos)
      {
         var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
         var pixel = hudSystem.realToViewCoordinates(realPos);
         var offset = upro.hud.Button.getOffset[1](-15);

         entry.bracket.attr(
         {
            "transform": "T" + pixel.x + "," + pixel.y
         });
         entry.bracket.show();
         entry.info.attr(
         {
            "x": pixel.x + offset.x,
            "y": pixel.y + offset.y
         });
         entry.info.show();
      }
      else
      {
         entry.bracket.hide();
         entry.info.hide();
      }
   }
});

upro.view.mediators.CurrentLocationHighlightMediator.NAME = "CurrentLocationHighlight";
upro.view.mediators.CurrentLocationHighlightMediator.TEXT_HEIGHT = 15;
