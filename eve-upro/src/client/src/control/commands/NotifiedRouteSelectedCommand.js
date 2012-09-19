upro.ctrl.cmd.NotifiedRouteSelectedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var sharedObjectInterestMediator = this.facade().retrieveMediator(
            upro.view.mediators.SharedObjectInterestPanelMediator.NAME);
      var routeInfo = notification.getBody();

      sharedObjectInterestMediator.setSharedObject(routeInfo);
   }
});
