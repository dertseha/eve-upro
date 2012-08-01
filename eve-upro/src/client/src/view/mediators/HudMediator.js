
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
   },

   onNotifyDebugMessage: function(text)
   {
      this.getViewComponent().debugMessage(text);
   },
/*
   onNotifyActiveGalaxyChanged: function(galaxyId)
   {
      var galaxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME).getGalaxy(galaxyId);

      this.getViewComponent().debugMessage("ActiveGalaxy: " + (galaxy ? galaxy.name : "<none>"));
   },
*/
   onNotifySessionLoggedIn: function()
   {
      this.getViewComponent().debugMessage("Online!");
   }

});

upro.view.mediators.HudMediator.NAME = "HUD";
