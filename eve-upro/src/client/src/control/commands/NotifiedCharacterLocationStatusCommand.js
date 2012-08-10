upro.ctrl.cmd.NotifiedCharacterLocationStatusCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var sessionControlProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);
      var charId = notification.getBody();

      if (sessionControlProxy.isForCharacter(charId))
      {
         var highlightMediator = this.facade().retrieveMediator(upro.view.mediators.SolarSystemHighlightMediator.NAME);
         var locationTrackerProxy = this.facade().retrieveProxy(upro.model.proxies.LocationTrackerProxy.NAME);
         var solarSystem = locationTrackerProxy.getLocation(charId);

         highlightMediator.setHighlightSolarSystem("CurLocation", solarSystem);
      }
   }
});
