
upro.ctrl.cmd.NotifiedUserRoutingRuleUpCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

      settingsProxy.moveRoutingRule(notification.getBody(), true);
   }
});
