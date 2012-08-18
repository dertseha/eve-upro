/**
 * A routing rule
 */
upro.model.UserRoutingRule = Class.create(
{
   initialize: function(ruleType, pathFinderRuleConstructor, index, inUse, parameter)
   {
      this.ruleType = ruleType;
      this.pathFinderRuleConstructor = pathFinderRuleConstructor;
      this.index = index;
      this.inUse = inUse;
      this.parameter = parameter;

      this.template = upro.model.UserRoutingRule.RuleConstants[this.ruleType];
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
      return new this.pathFinderRuleConstructor((this.parameter * this.template.Factor).toFixed(this.template.Fixed));
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
      return this.parameter < this.template.Maximum;
   },

   /**
    * @return true if the parameter is currently above the minimum
    */
   isAboveMinimum: function()
   {
      return this.parameter > this.template.Minimum;
   },

   /**
    * @returns the parameter in fixed form
    */
   getFixedParameter: function()
   {
      return this.getFixedValue(this.parameter);
   },

   /**
    * @returns the parameter in fixed form, incremented by one step
    */
   getFixedParameterIncremented: function()
   {
      return this.getFixedValue(this.parameter + this.template.Increment);
   },

   /**
    * @returns the parameter in fixed form, decremented by one step
    */
   getFixedParameterDecremented: function()
   {
      return this.getFixedValue(this.parameter - this.template.Increment);
   },

   /**
    * @returns the value in fixed notation as per template definition
    */
   getFixedValue: function(value)
   {
      return (value * this.template.Factor).toFixed(this.template.Fixed);
   },
});

upro.model.UserRoutingRule.RuleConstants = {};
upro.model.UserRoutingRule.RuleConstants["jumps"] =
{
   Increment: 1,
   Minimum: 0,
   Maximum: 10,
   Factor: 1,
   Fixed: 0
};
upro.model.UserRoutingRule.RuleConstants["jumpFuel"] =
{
   Increment: 0.25,
   Minimum: 0,
   Maximum: 5,
   Factor: 1,
   Fixed: 2
};
upro.model.UserRoutingRule.RuleConstants["minSecurity"] =
{
   Increment: 1,
   Minimum: 0,
   Maximum: 5,
   Factor: 0.1,
   Fixed: 1
};
upro.model.UserRoutingRule.RuleConstants["maxSecurity"] =
{
   Increment: 1,
   Minimum: 5,
   Maximum: 10,
   Factor: 0.1,
   Fixed: 1
};
