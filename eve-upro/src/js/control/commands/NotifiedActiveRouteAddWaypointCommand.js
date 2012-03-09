
upro.ctrl.cmd.NotifiedActiveRouteAddWaypointCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var solarSystem = notification.getBody();

      activeRouteProxy.addEntry(solarSystem, upro.nav.SystemRouteEntry.EntryType.Waypoint);
   }
});
