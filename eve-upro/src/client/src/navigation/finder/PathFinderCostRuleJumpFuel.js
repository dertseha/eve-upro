upro.nav.finder.PathFinderCostRuleJumpFuel = Class.create(upro.nav.finder.PathFinderCostRule,
{
   initialize: function(margin)
   {
      this.margin = margin;
   },

   comparator: function(costA, costB)
   {
      var distA = costA.jumpDistance ? costA.jumpDistance : 0;
      var distB = costB.jumpDistance ? costB.jumpDistance : 0;
      var result = distA - distB;

      if (this.margin > 0)
      {
         result /= this.margin;
         result = ((result < 0) ? Math.ceil(result) : Math.floor(result)) * this.margin;
      }

      return result;
   },

   add: function(costA, costB)
   {
      if (costB.jumpDistance !== undefined)
      {
         if (costA.jumpDistance)
         {
            costA.jumpDistance += costB.jumpDistance;
         }
         else
         {
            costA.jumpDistance = costB.jumpDistance;
         }
      }
   }

});
