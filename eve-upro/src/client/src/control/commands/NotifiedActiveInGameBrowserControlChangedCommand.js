upro.ctrl.cmd.NotifiedActiveInGameBrowserControlChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var igbMediator = this.facade().retrieveMediator(upro.view.mediators.InGameBrowserMediator.NAME);
      var active = notification.getBody();

      igbMediator.setControlActive(active);
      if (active)
      {
         var autopilotProxy = this.facade().retrieveProxy(upro.model.proxies.AutopilotProxy.NAME);
         var route = autopilotProxy.getRoute();
         var nextRouteIndex = autopilotProxy.getNextRouteIndex();

         igbMediator.clearAutopilotRoute();
         igbMediator.setAutopilotNextRouteIndex(route, nextRouteIndex);
      }
   }
});
