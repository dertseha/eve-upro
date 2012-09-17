upro.ctrl.cmd.NotifiedRouteOptimizerFinishedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var routeOptimizerProxy = this.facade().retrieveProxy(upro.model.proxies.RouteOptimizerProxy.NAME);
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var notifyBody = notification.getBody();

      if (notifyBody.route.length > 0)
      {
         activeRouteProxy.setRouteSegment(notifyBody.id, notifyBody.route);
      }
      else
      {
         activeRouteProxy.resetRouteSegmentToMinimum(notifyBody.id);
      }
      if (routeOptimizerProxy.isIdle())
      {
         activeRouteProxy.syncRoute();
      }
   }
});
