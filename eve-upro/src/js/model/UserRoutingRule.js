/**
 * A routing rule
 */
upro.model.UserRoutingRule = Class.create(upro.data.DataStoreInfo,
{
   initialize: function($super, infoId)
   {
      $super(infoId);

      this.index = -1;
      this.ruleType = null;
      this.inUse = false;
      this.parameter = null;

      this.changedCallback = null;
   },

   /**
    * Returns the index
    * @return the index
    */
   getIndex: function()
   {
      return this.index;
   },

   /**
    * Returns the rule type
    * @return the rule type
    */
   getRuleType: function()
   {
      return this.ruleType;
   },

   /**
    * Returns whether the rule is in use
    * @return whether the rule is in use
    */
   getInUse: function()
   {
      return this.inUse;
   },

   /**
    * Returns the parameter
    * @return the parameter
    */
   getParameter: function()
   {
      return this.parameter;
   },

   /** {@inheritDoc} */
   onUpdated: function(properties)
   {
      this.decodeNumberMember(properties, upro.model.UserRoutingRule.PROPERTY_INDEX);
      this.decodeStringMember(properties, upro.model.UserRoutingRule.PROPERTY_RULE_TYPE);
      this.decodeBooleanMember(properties, upro.model.UserRoutingRule.PROPERTY_IN_USE);
      this.decodeNumberMember(properties, upro.model.UserRoutingRule.PROPERTY_PARAMETER);
      if (this.changedCallback)
      {
         this.changedCallback(this);
      }
   }

});

upro.model.UserRoutingRule.RuleConstants = {};
upro.model.UserRoutingRule.RuleConstants["Jumps"] = { Type: "Jumps", Increment: 1, Minimum: 0, Maximum: 10, Factor: 1, Fixed: 0 };
upro.model.UserRoutingRule.RuleConstants["Jumps"].Constructor = upro.nav.finder.PathFinderCostRuleJumps;
upro.model.UserRoutingRule.RuleConstants["JumpFuel"] = { Type: "Fuel", Increment: 0.25, Minimum: 0, Maximum: 5, Factor: 1, Fixed: 2 };
upro.model.UserRoutingRule.RuleConstants["JumpFuel"].Constructor = upro.nav.finder.PathFinderCostRuleJumpFuel;
upro.model.UserRoutingRule.RuleConstants["MinSecurity"] = { Type: "MinSecurity", Increment: 1, Minimum: 0, Maximum: 5, Factor: 0.1, Fixed: 1 };
upro.model.UserRoutingRule.RuleConstants["MinSecurity"].Constructor = upro.nav.finder.PathFinderCostRuleMinSecurity;
upro.model.UserRoutingRule.RuleConstants["MaxSecurity"] = { Type: "MaxSecurity", Increment: 1, Minimum: 5, Maximum: 10, Factor: 0.1, Fixed: 1 };
upro.model.UserRoutingRule.RuleConstants["MaxSecurity"].Constructor = upro.nav.finder.PathFinderCostRuleMaxSecurity;

upro.model.UserRoutingRule.RuleLimit = 4;

upro.model.UserRoutingRule.TYPE = "UserRoutingRule";
upro.model.UserRoutingRule.PROPERTY_INDEX = "index";
upro.model.UserRoutingRule.PROPERTY_RULE_TYPE = "ruleType";
upro.model.UserRoutingRule.PROPERTY_IN_USE = "inUse";
upro.model.UserRoutingRule.PROPERTY_PARAMETER = "parameter";
