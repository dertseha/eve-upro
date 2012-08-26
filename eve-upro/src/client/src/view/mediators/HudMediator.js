upro.view.mediators.HudMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.HudMediator.NAME, null);

      this.rotations = 0;
      this.rotationDisplay = null;
   },

   onRegister: function()
   {
      var context = new upro.sys.ResizableContextWindow("hud");
      var system = new upro.hud.HudSystem(context);

      this.setViewComponent(system);
   },

   onNotifyCameraRotatedFullCircle: function()
   {
      this.rotations++;
      if (this.rotations >= upro.view.mediators.HudMediator.ROTATION_DISPLAY_LIMIT)
      {
         if (!this.rotationDisplay)
         {
            this.createRotationDisplay();
         }
         this.rotationDisplay.attr("text", this.rotations);
      }
   },

   createRotationDisplay: function()
   {
      var hudSystem = this.getViewComponent();
      var paper = hudSystem.paper;
      var viewCoord = hudSystem.realToViewCoordinates(
      {
         x: 0,
         y: -0.95
      });

      this.rotationDisplay = paper.text(viewCoord.x, viewCoord.y, "");
      this.rotationDisplay.attr(
      {
         "fill": "#FFF",
         "opacity": 0.5,
         "font-size": 20
      });
   }
});

upro.view.mediators.HudMediator.NAME = "HUD";
upro.view.mediators.HudMediator.ROTATION_DISPLAY_LIMIT = 10;
