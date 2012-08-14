upro.ctrl.cmd.NotifiedActiveRouteSetAutopilotCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var autopilotProxy = this.facade().retrieveProxy(upro.model.proxies.AutopilotProxy.NAME);
      var route = [];

      for ( var i = 0; i < activeRouteProxy.routeEntries.length; i++)
      {
         var routeEntry = activeRouteProxy.routeEntries[i];
         var solarSystem = routeEntry.systemEntry.getSolarSystem();

         route.push(this.createRawRouteEntry(routeEntry.systemEntry.entryType, solarSystem,
               routeEntry.systemEntry.jumpType));

         lastSystem = solarSystem;
         for ( var j = 0; j < routeEntry.transits.length; j++)
         {
            var transitEntry = routeEntry.transits[j];
            var temp = transitEntry.getSolarSystem();

            route.push(this.createRawRouteEntry('Transit', temp, transitEntry.jumpType));
            lastSystem = temp;
         }
      }

      // upro.sys.log('Route: ' + Object.toJSON(route));
      autopilotProxy.setRoute(route);
   },

   createRawRouteEntry: function(entryType, solarSystem, jumpType)
   {
      var rawEntry =
      {
         entryType: entryType,
         solarSystemId: solarSystem.id,
         nextJumpType: jumpType
      };

      return rawEntry;
   }
});
