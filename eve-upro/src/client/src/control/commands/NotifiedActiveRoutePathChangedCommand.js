upro.ctrl.cmd.NotifiedActiveRoutePathChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var sceneMediator = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);
      var overlayMediator = this.facade().retrieveMediator(upro.view.mediators.ActiveRouteOverlayMediator.NAME);
      var routeEntry, isReachable;
      var lastSystem = null, temp = null;
      var waypointCounter = 1;

      sceneMediator.clearRoute();
      overlayMediator.clear();

      for ( var i = 0; i < activeRouteProxy.routeEntries.length; i++)
      {
         routeEntry = activeRouteProxy.routeEntries[i];
         isReachable = routeEntry.isReachable;

         if (lastSystem)
         {
            sceneMediator.addRouteEdge(lastSystem, routeEntry.systemEntry.getSolarSystem(), isReachable);
         }
         overlayMediator.setSystemOverlay(routeEntry.systemEntry.getSolarSystem(), waypointCounter, isReachable);
         waypointCounter++;

         lastSystem = routeEntry.systemEntry.getSolarSystem();
         for ( var j = 0; j < routeEntry.transits.length; j++)
         {
            temp = routeEntry.transits[j].getSolarSystem();
            sceneMediator.addRouteEdge(lastSystem, temp, true);
            lastSystem = temp;
         }
      }
   }
});
