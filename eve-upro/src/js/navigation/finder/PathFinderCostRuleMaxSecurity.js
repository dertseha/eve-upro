
upro.nav.finder.PathFinderCostRuleMaxSecurity = Class.create(upro.nav.finder.PathFinderCostRule,
{
   initialize: function(securityLimit)
   {
      this.securityLimit = securityLimit;
   },

   comparator: function(costA, costB)
   {
      // -10 for those systems not needing security - either source or destination systems.
      var isGoodA = (costA.maxSecurity !== undefined) ? ((costA.maxSecurity < this.securityLimit) ? -1 : 0) : -10;
      var isGoodB = (costB.maxSecurity !== undefined) ? ((costB.maxSecurity < this.securityLimit) ? -1 : 0) : -10;

      if ((isGoodA == 0) && (isGoodB == 0))
      {  // if both are above the limit, have the system with the lower status count
         isGoodA = costA.maxSecurity - this.securityLimit;
         isGoodB = costB.maxSecurity - this.securityLimit;
      }

      return isGoodA - isGoodB;
   },

   add: function(costA, costB)
   {
      if (costA.maxSecurity !== undefined)
      {
         if ((costB.maxSecurity !== undefined) && (costA.maxSecurity < costB.maxSecurity))
         {
            costA.maxSecurity = costB.maxSecurity;
         }
      }
      else
      {
         costA.maxSecurity = costB.maxSecurity;
      }
   }

});
