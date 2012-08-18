(function(namespace)
{
   function RoutingRuleTemplate(increment, min, max, factor, fixed, defaultIndex, defaultInUse, defaultValue)
   {
      this.increment = increment;
      this.minimum = min;
      this.maximum = max;
      this.factor = factor;
      this.fixed = fixed;

      this.defaultIndex = defaultIndex;
      this.defaultInUse = defaultInUse;
      this.defaultValue = defaultValue;
   }
   namespace.RoutingRuleTemplate = RoutingRuleTemplate;

   /**
    * @param parameter to convert
    * @returns the value in fixed presentation according to the rule
    */
   RoutingRuleTemplate.prototype.getFixedValue = function(parameter)
   {
      return (parameter * this.factor).toFixed(this.fixed);
   };

   /**
    * @param parameter the parameter to check
    * @returns {Boolean} true if the parameter is valid and within limits
    */
   RoutingRuleTemplate.prototype.isParameterValid = function(parameter)
   {
      return (parameter >= this.minimum) && (parameter <= this.maximum);
   };

   namespace.RoutingRules =
   {
      minSecurity: new RoutingRuleTemplate(1, 0, 5, 0.1, 1, 0, true, 5),
      maxSecurity: new RoutingRuleTemplate(1, 5, 10, 0.1, 1, 1, false, 5),
      jumps: new RoutingRuleTemplate(1, 0, 10, 1, 0, 2, true, 0),
      jumpFuel: new RoutingRuleTemplate(0.25, 0, 5, 1, 2, 3, false, 0)
   };

})((typeof module !== 'undefined') ? module.exports : upro.model);
