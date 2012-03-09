
upro.ctrl.cmd.NotifiedSetActiveGalaxyCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settings = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

      if (settings !== null)
      {
         settings.setActiveGalaxy(notification.getBody());
      }
   }

});
