/**
 * User settings contain the basic things how a user likes his system.
 */
upro.model.UserSettings = Class.create(upro.model.AbstractProxiedDataStoreInfo,
{
   initialize: function($super, infoId)
   {
      $super(infoId);

      this.activeGalaxy = null;
      this.activeGalaxyChanged = null;

      this.ignoredSolarSystems = [];
      this.ignoredSolarSystemsChanged = null;

      this.routingCapJumpGatesInUse = false;
      this.routingCapJumpDriveInUse = false;
      this.routingCapJumpDriveRange = 0;
      this.routingCapabilitiesChanged = null;

      this.routingRules = {};
      this.routingRuleChangedHandler = this.onRoutingRuleChanged.bind(this);
      this.routingRulesChanged = null;
   },

   getActiveGalaxy: function()
   {
      return this.activeGalaxy;
   },

   /**
    * Returns whether the jump gates capability is in use
    * @return whether the jump gates capability is in use
    */
   getRoutingCapJumpGatesInUse: function()
   {
      return this.routingCapJumpGatesInUse;
   },

   /**
    * Returns whether the jump drive capability is in use
    * @return whether the jump drive capability is in use
    */
   getRoutingCapJumpDriveInUse: function()
   {
      return this.routingCapJumpDriveInUse;
   },

   /**
    * Returns the range of the jump drive
    * @return the range of the jump drive
    */
   getRoutingCapJumpDriveRange: function()
   {
      return this.routingCapJumpDriveRange;
   },

   /**
    * Returns an array of UserIgnoredSolarSystem entries
    * @return an array of UserIgnoredSolarSystem entries
    */
   getIgnoredSolarSystems: function()
   {
      return this.ignoredSolarSystems.slice(0);
   },

   setActiveGalaxy: function(galaxyId)
   {
      if (this.activeGalaxy != galaxyId)
      {
         this.activeGalaxy = galaxyId;
         if (this.activeGalaxyChanged !== null)
         {
            this.activeGalaxyChanged();
         }
      }
   },

   /** {@inheritDoc} */
   onUpdated: function(properties)
   {
      {
         var activeGalaxy = properties[upro.model.UserSettings.PROPERTY_ACTIVE_GALAXY];

         if (activeGalaxy !== undefined)
         {
            this.setActiveGalaxy(activeGalaxy);
         }
      }
      {  // routing capabilities
         var capChanged = false;

         if (this.decodeBooleanMember(properties, upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_GATES_IN_USE))
         {
            capChanged = true;
         }
         if (this.decodeBooleanMember(properties, upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_DRIVE_IN_USE))
         {
            capChanged = true;
         }
         if (this.decodeNumberMember(properties, upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_DRIVE_RANGE))
         {
            capChanged = true;
         }
         if (capChanged && this.routingCapabilitiesChanged)
         {
            this.routingCapabilitiesChanged();
         }
      }
   },

   /** {@inheritDoc} */
   onReferenceAdded: function(info)
   {
      if (info.getInfoId().getType() == upro.model.UserIgnoredSolarSystem.TYPE)
      {
         this.ignoredSolarSystems.push(info);
         if (this.ignoredSolarSystemsChanged)
         {
            this.ignoredSolarSystemsChanged();
         }
      }
      else if (info.getInfoId().getType() == upro.model.UserRoutingRule.TYPE)
      {
         this.routingRules[info.getRuleType()] = info;
         info.changedCallback = this.routingRuleChangedHandler;
         this.onRoutingRuleChanged();
      }
   },

   /** {@inheritDoc} */
   onReferenceRemoved: function(info)
   {
      if (info.getInfoId().getType() == upro.model.UserIgnoredSolarSystem.TYPE)
      {
         var index = this.ignoredSolarSystems.indexOf(info);

         if (index >= 0)
         {
            this.ignoredSolarSystems.splice(index, 1);
            if (this.ignoredSolarSystemsChanged)
            {
               this.ignoredSolarSystemsChanged();
            }
         }
      }
      else if (info.getInfoId().getType() == upro.model.UserRoutingRule.TYPE)
      {
         delete this.routingRules[info.getRuleType()];
         info.changedCallback = null;
         this.onRoutingRuleChanged();
      }
   },

   /**
    * Calls the owner change callback
    */
   onRoutingRuleChanged: function()
   {
      if (this.routingRulesChanged)
      {
         this.routingRulesChanged();
      }
   },

   /**
    * Returns the routing rule by rule type
    * @return the routing rule by rule type
    */
   getRoutingRuleByType: function(ruleType)
   {
      return this.routingRules[ruleType];
   },

   /**
    * Returns an array of the assigned rules, sorted by index
    * @return an array of the assigned rules, sorted by index
    */
   getRoutingRules: function()
   {
      var result = [];

      for (var ruleType in this.routingRules)
      {
         result.push(this.routingRules[ruleType]);
      }
      result.sort(function sortByIndex(a, b)
      {
         return a.getIndex() - b.getIndex();
      });

      return result;
   }

});

upro.model.UserSettings.TYPE = "UserSettings";
upro.model.UserSettings.PROPERTY_ACTIVE_GALAXY = "activeGalaxy";
upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_GATES_IN_USE = "routingCapJumpGatesInUse";
upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_DRIVE_IN_USE = "routingCapJumpDriveInUse";
upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_DRIVE_RANGE = "routingCapJumpDriveRange";

upro.model.UserSettings.JumpDriveConstants =
{
   MinimumRange: 0.25,
   MaximumRange: 20.0,
   RangeStep: 0.25
};
