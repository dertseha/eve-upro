
upro.ctrl.cmd.NotifiedUserRoutingRulesChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var rules = notification.getBody();
      var finderRules = [];

      for (var i = 0; i < rules.length; i++)
      {
         var rule = rules[i];
         var template = upro.model.UserRoutingRule.RuleConstants[rule.getRuleType()];

         if (rule.getInUse() && template)
         {
            var finderRule = new template.Constructor((rule.getParameter() * template.Factor).toFixed(template.Fixed));

            finderRules.push(finderRule);
         }
      }

      activeRouteProxy.setRoutingRules(finderRules);
   }
});
