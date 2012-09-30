upro.nav.finder.PathFinderCostRuleMaxSecurity = Class.create(upro.nav.finder.PathFinderCostRule,
{
   initialize: function(securityLimit)
   {
      this.securityLimit = securityLimit;
   },

   comparator: function(costA, costB)
   {
      var result = costA.maxSecurityAboveCount - costB.maxSecurityAboveCount;

      if ((result === 0) && (costA.security >= this.securityLimit))
      {
         result = costA.security - costB.security;
      }

      return result;
   },

   addBasicCost: function(cost, solarSystem, isDestinationSystem)
   {
      var security = solarSystem.security;

      cost.security = security;
      cost.maxSecurityAboveCount = 0;
      if (!isDestinationSystem && (security >= this.securityLimit))
      {
         cost.maxSecurityAboveCount = 1;
      }

      return cost;
   },

   add: function(costA, costB)
   {
      if (costA.maxSecurityAboveCount !== undefined)
      {
         costA.maxSecurityAboveCount += costB.maxSecurityAboveCount;
      }
      else
      {
         costA.maxSecurityAboveCount = costB.maxSecurityAboveCount;
      }
   }

});
