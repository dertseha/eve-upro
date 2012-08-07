upro.ctrl.cmd.NotifiedCharacterLocationStatusCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var sessionControlProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);
      var charId = notification.getBody();

      if (sessionControlProxy.isForCharacter(charId))
      {
         var locationTrackerProxy = this.facade().retrieveProxy(upro.model.proxies.LocationTrackerProxy.NAME);
         var highlightMediator = this.facade().retrieveMediator(
               upro.view.mediators.CurrentLocationHighlightMediator.NAME);
         var solarSystem = locationTrackerProxy.getLocation(charId);

         highlightMediator.clear();

         if (solarSystem)
         {
            highlightMediator.setSystemOverlay(solarSystem);
         }
      }
   }
});
