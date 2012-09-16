upro.ctrl.cmd.NotifiedUserRoutingRulesChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var routeOptimizerProxy = this.facade().retrieveProxy(upro.model.proxies.RouteOptimizerProxy.NAME);
      var rules = notification.getBody();
      var finderRules = [];

      for ( var i = 0; i < rules.length; i++)
      {
         var rule = rules[i];

         if (rule.getInUse())
         {
            var finderRule = rule.getPathFinderRule();

            finderRules.push(finderRule);
         }
      }

      routeOptimizerProxy.setRoutingRules(finderRules);
   }
});
