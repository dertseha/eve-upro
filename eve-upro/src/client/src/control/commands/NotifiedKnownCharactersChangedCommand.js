upro.ctrl.cmd.NotifiedKnownCharactersChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var locationTrackerProxy = this.facade().retrieveProxy(upro.model.proxies.LocationTrackerProxy.NAME);
      var notifyBody = notification.getBody();

      notifyBody.forEach(function(body)
      {
         locationTrackerProxy.fireCharacterListInSolarSystemChangedIfOnlyChar(body.getId());
      });
   }
});
