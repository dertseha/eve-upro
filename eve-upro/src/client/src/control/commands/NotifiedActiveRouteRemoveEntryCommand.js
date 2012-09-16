upro.ctrl.cmd.NotifiedActiveRouteRemoveEntryCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var solarSystem = notification.getBody();
      var changedIds = activeRouteProxy.removeEntry(solarSystem);

      activeRouteProxy.updateOptimizer(changedIds, changedIds);
   }
});
