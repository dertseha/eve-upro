/**
 * A routing rule
 */
upro.model.UserRoutingRule = Class.create(
{
   initialize: function(ruleType, pathFinderRuleConstructor)
   {
      this.ruleType = ruleType;
      this.pathFinderRuleConstructor = pathFinderRuleConstructor;

      this.template = upro.model.RoutingRules[this.ruleType];

      this.index = this.template.defaultIndex;
      this.inUse = this.template.defaultInUse;
      this.parameter = this.template.defaultValue;
   },

   /**
    * @return the index
    */
   getIndex: function()
   {
      return this.index;
   },

   /**
    * @return the rule type
    */
   getRuleType: function()
   {
      return this.ruleType;
   },

   /**
    * @returns the corresponding path finder rule based on current parameter
    */
   getPathFinderRule: function()
   {
      return new this.pathFinderRuleConstructor(this.getFixedParameter());
   },

   /**
    * @return whether the rule is in use
    */
   getInUse: function()
   {
      return this.inUse;
   },

   /**
    * @return the raw parameter
    */
   getParameter: function()
   {
      return this.parameter;
   },

   /**
    * @return true if the parameter is currently below the maximum
    */
   isBelowMaximum: function()
   {
      return this.parameter < this.template.maximum;
   },

   /**
    * @return true if the parameter is currently above the minimum
    */
   isAboveMinimum: function()
   {
      return this.parameter > this.template.minimum;
   },

   /**
    * @returns the parameter in fixed form
    */
   getFixedParameter: function()
   {
      return this.template.getFixedValue(this.parameter);
   },

   /**
    * @returns the parameter in fixed form, incremented by one step
    */
   getFixedParameterIncremented: function()
   {
      return this.template.getFixedValue(this.parameter + this.template.increment);
   },

   /**
    * @returns the parameter in fixed form, decremented by one step
    */
   getFixedParameterDecremented: function()
   {
      return this.template.getFixedValue(this.parameter - this.template.increment);
   }
});
