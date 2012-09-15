upro.ctrl.cmd.NotifiedRouteOptimizerFinishedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      // var routeOptimizerProxy = this.facade().retrieveProxy(upro.model.proxies.RouteOptimizerProxy.NAME);
      // var notifyBody = notification.getBody();

      // upro.sys.log("optimized: " + notifyBody.id);
      // notifyBody.route.forEach(function(entry)
      // {
      // upro.sys.log(entry.toString());
      // });
   }
});
