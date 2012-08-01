
upro.view.mediators.SolarSystemHighlightMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.SolarSystemHighlightMediator.NAME, null);
   },

   onRegister: function()
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();

      this.bracket = hudSystem.createHexagon(upro.hud.Button.Scale).hide();

      this.info = hudSystem.paper.text(0, 0, "");
      this.info.attr({"fill": "#FFF", "font-size": upro.view.mediators.SolarSystemHighlightMediator.TEXT_HEIGHT, "text-anchor": "end"});

      this.clearHighlight();
   },

   setHighlight: function(solarSystem, realPos)
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
      var pixel = hudSystem.realToViewCoordinates(realPos);
      var offset = upro.hud.Button.getOffset[5](0);

      this.bracket.stop();
      this.bracket.animate({"transform": "T" + pixel.x + "," + pixel.y, "fill-opacity": 0.2, "stroke-opacity": 0.3}, 50);

      this.info.attr({"text": solarSystem.name});
      this.info.attr({"x": pixel.x + offset.x, "y": pixel.y + offset.y});

      this.bracket.show();
      this.info.show();
   },

   clearHighlight: function()
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
      var pixel = hudSystem.realToViewCoordinates({ x: 0, y: 0 });

      this.bracket.hide();
      this.info.hide();

      this.bracket.attr({"transform": "T" + pixel.x + "," + pixel.y, "fill-opacity": 0.0, "stroke-opacity": 0.0});
      this.info.attr({"text": "", "x": pixel.x, "y": pixel.y});
   }

});

upro.view.mediators.SolarSystemHighlightMediator.NAME = "SolarSystemHighlight";
upro.view.mediators.SolarSystemHighlightMediator.TEXT_HEIGHT = 20;
