upro.nav.finder.PathFinderCost = Class.create(
{
   initialize: function()
   {
      this.costItems = {};
   },

   toString: function()
   {
      var text = "{";

      for ( var key in this.costItems)
      {
         text += key + ": " + this.costItems[key] + ",";
      }
      text += " }";

      return text;
   },

   compareTo: function(other, rules)
   {
      var rCode = 0;

      for ( var i = 0; (rCode == 0) && (i < rules.length); i++)
      {
         var rule = rules[i];

         rCode = rule.comparator(this.costItems, other.costItems);
      }

      return rCode;
   },

   plus: function(other, rules)
   {
      var result = new upro.nav.finder.PathFinderCost();

      for ( var item in this.costItems)
      {
         result.costItems[item] = this.costItems[item];
      }
      for ( var i = 0; i < rules.length; i++)
      {
         var rule = rules[i];

         rule.add(result.costItems, other.costItems);
      }

      return result;
   }
});
