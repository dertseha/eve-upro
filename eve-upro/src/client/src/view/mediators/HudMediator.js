upro.view.mediators.HudMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.HudMediator.NAME, null);
   },

   onRegister: function()
   {
      var context = new upro.sys.ResizableContextWindow("hud");
      var system = new upro.hud.HudSystem(context);

      this.setViewComponent(system);
   }
});

upro.view.mediators.HudMediator.NAME = "HUD";
