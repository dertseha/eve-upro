upro.ctrl.cmd.NotifiedUserIgnoredSolarSystemsChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var routeOptimizerProxy = this.facade().retrieveProxy(upro.model.proxies.RouteOptimizerProxy.NAME);
      var listPanelMediator = this.facade().retrieveMediator(
            upro.view.mediators.IgnoredSolarSystemListPanelMediator.NAME);
      var ignored = notification.getBody();

      routeOptimizerProxy.setIgnoredSolarSystemIds(ignored);
      listPanelMediator.setList(ignored);
   }
});
