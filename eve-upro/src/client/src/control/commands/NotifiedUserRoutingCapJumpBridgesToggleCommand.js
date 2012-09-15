upro.ctrl.cmd.NotifiedUserRoutingCapJumpBridgesToggleCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

      settingsProxy.toggleRoutingCapJumpBridges();
   }
});
