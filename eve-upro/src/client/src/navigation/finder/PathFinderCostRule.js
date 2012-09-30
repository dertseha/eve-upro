/**
 * A path finder cost rule weighs cost and return their relative order.
 */
upro.nav.finder.PathFinderCostRule = Class.create(
{
   initialize: function()
   {

   },

   comparator: function(costA, costB)
   {
      return 0;
   },

   addBasicCost: function(cost, solarSystem, isDestinationSystem)
   {
      return cost;
   },

   add: function(costA, costB)
   {

   }

});
