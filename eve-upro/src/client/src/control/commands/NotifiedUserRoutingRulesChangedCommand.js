upro.ctrl.cmd.NotifiedUserRoutingRulesChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var routeOptimizerProxy = this.facade().retrieveProxy(upro.model.proxies.RouteOptimizerProxy.NAME);
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
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

      activeRouteProxy.setRoutingRules(finderRules);
      routeOptimizerProxy.setRoutingRules(finderRules);
   }
});
