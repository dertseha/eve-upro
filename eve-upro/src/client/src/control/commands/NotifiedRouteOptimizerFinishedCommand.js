upro.ctrl.cmd.NotifiedRouteOptimizerFinishedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
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
   }
});
