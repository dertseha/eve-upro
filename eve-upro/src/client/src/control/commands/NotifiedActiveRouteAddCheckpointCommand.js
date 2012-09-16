upro.ctrl.cmd.NotifiedActiveRouteAddCheckpointCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var solarSystem = notification.getBody();
      var changedIds = activeRouteProxy.addCheckpoint(solarSystem);

      activeRouteProxy.updateOptimizer([], changedIds);
   }
});
