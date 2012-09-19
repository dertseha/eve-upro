upro.ctrl.cmd.NotifiedSetActiveRouteRequestCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var activeRouteListMediator = this.facade().retrieveMediator(
            upro.view.mediators.ActiveRouteListPanelMediator.NAME);
      var route = notification.getBody();

      activeRouteProxy.setRoute(route.getRoute());
      activeRouteListMediator.setRouteInfo(route);
   }
});
