
upro.ctrl.cmd.NotifiedUserRoutingRuleLessCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

      settingsProxy.stepRoutingRuleParameter(notification.getBody(), false);
   }
});
