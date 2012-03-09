
upro.nav.finder.PathFinderCostRuleMinSecurity = Class.create(upro.nav.finder.PathFinderCostRule,
{
   initialize: function(securityLimit)
   {
      this.securityLimit = securityLimit;
   },

   comparator: function(costA, costB)
   {
      // -10 for those systems not needing security - either source or destination systems.
      var isGoodA = (costA.minSecurity !== undefined) ? ((costA.minSecurity >= this.securityLimit) ? -1 : 0) : -10;
      var isGoodB = (costB.minSecurity !== undefined) ? ((costB.minSecurity >= this.securityLimit) ? -1 : 0) : -10;

      if ((isGoodA == 0) && (isGoodB == 0))
      {  // if both are below the limit, have the system with the higher status count
         isGoodA = this.securityLimit - costA.minSecurity;
         isGoodB = this.securityLimit - costB.minSecurity;
      }

      return isGoodA - isGoodB;
   },

   add: function(costA, costB)
   {
      if (costA.minSecurity !== undefined)
      {
         if ((costB.minSecurity !== undefined) && (costA.minSecurity > costB.minSecurity))
         {
            costA.minSecurity = costB.minSecurity;
         }
      }
      else
      {
         costA.minSecurity = costB.minSecurity;
      }
   }

});
