
upro.nav.finder.PathFinderCostRuleJumpFuel = Class.create(upro.nav.finder.PathFinderCostRule,
{
   initialize: function(margin)
   {
      var lightYearToMeters = 9460.7304725808; // this number is reduced by the factor also applied to the system positions

      this.margin = margin * lightYearToMeters;
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
