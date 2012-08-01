
upro.ctrl.cmd.NotifiedUserIgnoredSolarSystemIgnoreToggleCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);
      var solarSystem = notification.getBody();

      settingsProxy.toggleIgnoredSolarSystem(solarSystem.id);
   }
});
