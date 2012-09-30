upro.nav.finder.PathFinderCostRuleMinSecurity = Class.create(upro.nav.finder.PathFinderCostRule,
{
   initialize: function(securityLimit)
   {
      this.securityLimit = securityLimit;
   },

   comparator: function(costA, costB)
   {
      var result = costA.minSecurityBelowCount - costB.minSecurityBelowCount;

      if ((result === 0) && (costA.security < this.securityLimit))
      {
         result = costB.security - costA.security;
      }

      return result;
   },

   addBasicCost: function(cost, solarSystem, isDestinationSystem)
   {
      var security = solarSystem.security;

      cost.security = security;
      cost.minSecurityBelowCount = 0;
      if (!isDestinationSystem && (security < this.securityLimit))
      {
         cost.minSecurityBelowCount = 1;
      }

      return cost;
   },

   add: function(costA, costB)
   {
      if (costA.minSecurityBelowCount !== undefined)
      {
         costA.minSecurityBelowCount += costB.minSecurityBelowCount;
      }
      else
      {
         costA.minSecurityBelowCount = costB.minSecurityBelowCount;
      }
   }

});
