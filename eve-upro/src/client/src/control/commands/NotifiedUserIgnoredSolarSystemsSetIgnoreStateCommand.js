upro.ctrl.cmd.NotifiedUserIgnoredSolarSystemsSetIgnoreStateCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);
      var notifyBody = notification.getBody();

      settingsProxy.setIgnoredSolarSystemsIgnoreState(notifyBody.ignore, notifyBody.solarSystemIdList);
   }
});
