
upro.nav.finder.PathFinderCostRuleJumps = Class.create(upro.nav.finder.PathFinderCostRule,
{
   initialize: function(margin)
   {
      this.margin = margin;
   },

   comparator: function(costA, costB)
   {
      var result = costA.jumps - costB.jumps;

      if (this.margin > 0)
      {
         result /= this.margin;
         result = ((result < 0) ? Math.ceil(result) : Math.floor(result)) * this.margin;
      }

      return result;
   },

   add: function(costA, costB)
   {
      if (costA.jumps)
      {
         costA.jumps += costB.jumps;
      }
      else
      {
         costA.jumps = costB.jumps;
      }
   }

});
