upro.model.proxies.UserSettingsProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.UserSettingsProxy.NAME);

      this.ignoredSolarSystems = [ 30000142 ]; // Jita

      this.routingCapJumpGatesInUse = true;
      this.routingCapJumpDriveInUse = false;
      this.routingCapJumpDriveRange = 5.0;

      this.routingRules = {};
      this.createRoutingRule(0, "MinSecurity", true, 5);
      this.createRoutingRule(1, "MaxSecurity", false, 10);
      this.createRoutingRule(2, "Jumps", true, 0);
      this.createRoutingRule(3, "JumpFuel", false, 0);
   },

   createRoutingRule: function(index, ruleType, inUse, parameter)
   {
      var rule = new upro.model.UserRoutingRule();

      rule.index = index;
      rule.ruleType = ruleType;
      rule.inUse = inUse;
      rule.parameter = parameter;

      this.routingRules[ruleType] = rule;
   },

   onRegister: function()
   {
      var self = this;
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.addBroadcastHandler("CharacterActiveGalaxy", function(broadcastBody)
      {
         self.onCharacterActiveGalaxy(broadcastBody);
      });

      this.onRoutingCapabilitiesChanged();
      this.onIgnoredSolarSystemsChanged();
      this.onRoutingRulesChanged();
   },

   onRemove: function()
   {
      this.notifyActiveGalaxyChanged(undefined);
   },

   setActiveGalaxy: function(galaxyId)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest("SetActiveGalaxy",
      {
         galaxyId: galaxyId
      });
   },

   onCharacterActiveGalaxy: function(broadcastBody)
   {
      this.notifyActiveGalaxyChanged(broadcastBody.galaxyId);
   },

   notifyActiveGalaxyChanged: function(galaxyId)
   {
      this.facade().sendNotification(upro.app.Notifications.ActiveGalaxyChanged, galaxyId);
   },

   onRoutingCapabilitiesChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.UserRoutingCapabilitiesChanged);
   },

   getRoutingCapJumpGatesInUse: function()
   {
      return this.routingCapJumpGatesInUse;
   },

   toggleRoutingCapJumpGates: function()
   {
      this.routingCapJumpGatesInUse = !this.getRoutingCapJumpGatesInUse();
      this.onRoutingCapabilitiesChanged();
   },

   getRoutingCapJumpDriveInUse: function()
   {
      return this.routingCapJumpDriveInUse;
   },

   toggleRoutingCapJumpDrive: function()
   {
      this.routingCapJumpDriveInUse = !this.getRoutingCapJumpDriveInUse();
      this.onRoutingCapabilitiesChanged();
   },

   getRoutingCapJumpDriveRange: function()
   {
      return this.routingCapJumpDriveRange;
   },

   /**
    * Steps the range of the jump drive capability
    * 
    * @param increment whether to increment
    */
   stepRoutingCapJumpDriveRange: function(increment)
   {
      var value = this.routingCapJumpDriveRange
            + (increment ? upro.model.proxies.UserSettingsProxy.JumpDriveConstants.RangeStep
                  : -upro.model.proxies.UserSettingsProxy.JumpDriveConstants.RangeStep);

      if ((value >= upro.model.proxies.UserSettingsProxy.JumpDriveConstants.MinimumRange)
            && (value <= upro.model.proxies.UserSettingsProxy.JumpDriveConstants.MaximumRange))
      {
         this.routingCapJumpDriveRange = value;
         this.onRoutingCapabilitiesChanged();
      }
   },

   onIgnoredSolarSystemsChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.UserIgnoredSolarSystemsChanged,
            this.getIgnoredSolarSystemIds());
   },

   toggleIgnoredSolarSystem: function(solarSystemId)
   {
      var entries = this.ignoredSolarSystems;
      var newArray = [];
      var found = false;

      for ( var i = entries.length - 1; i >= 0; i--)
      {
         var entry = entries[i];

         if (entry == solarSystemId)
         {
            found = true;
         }
         else
         {
            newArray.push(entry);
         }
      }
      if (!found)
      {
         newArray.push(solarSystemId);
      }
      this.ignoredSolarSystems = newArray;
      this.onIgnoredSolarSystemsChanged();
   },

   /**
    * Returns an array of solar system id entries that should be ignored
    * 
    * @return an array of solar system id entries
    */
   getIgnoredSolarSystemIds: function()
   {
      return this.ignoredSolarSystems;
   },

   /**
    * Callback on changed routing rules
    */
   onRoutingRulesChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.UserRoutingRulesChanged, this.getRoutingRules());
   },

   /**
    * Returns the routing rules
    * 
    * @return the routing rules
    */
   getRoutingRules: function()
   {
      var result = [];

      for ( var ruleType in this.routingRules)
      {
         result.push(this.routingRules[ruleType]);
      }
      result.sort(function sortByIndex(a, b)
      {
         return a.getIndex() - b.getIndex();
      });

      return result;
   },

   /**
    * Toggles the InUse parameter of the routing rule identified by ruleType
    * 
    * @param ruleType to modify
    */
   toggleRoutingRule: function(ruleType)
   {
      var rule = this.routingRules[ruleType];

      if (rule)
      {
         rule.inUse = !rule.inUse;
         this.onRoutingRulesChanged();
      }
   },

   /**
    * Steps the parameter value of the routing rule identified by ruleType
    * 
    * @param ruleType to modify
    * @param increment whether to increment
    */
   stepRoutingRuleParameter: function(ruleType, increment)
   {
      var rule = this.routingRules[ruleType];

      if (rule)
      {
         var template = upro.model.UserRoutingRule.RuleConstants[rule.ruleType];

         rule.parameter = rule.parameter + (increment ? template.Increment : -template.Increment);
         this.onRoutingRulesChanged();
      }
   },

   /**
    * Moves the routing rule identified by ruleType
    * 
    * @param ruleType to modify
    * @param up whether it should be ordered up
    */
   moveRoutingRule: function(ruleType, up)
   {
      var rule = this.routingRules[ruleType];

      if (rule)
      {
         var oldIndex = rule.getIndex();
         var newIndex = oldIndex + (up ? -1 : 1);

         if ((newIndex >= 0) && (newIndex < upro.model.UserRoutingRule.RuleLimit))
         {
            var rules = this.getRoutingRules();

            for ( var i = 0; i < rules.length; i++)
            { // go through other rules and swap their index
               var tempRule = rules[i];

               if (tempRule.getIndex() == newIndex)
               {
                  tempRule.index = oldIndex;
               }
            }
            // update the specified rule
            rule.index = newIndex;
            this.onRoutingRulesChanged();
         }
      }
   }

});

upro.model.proxies.UserSettingsProxy.NAME = "UserSettings";

upro.model.proxies.UserSettingsProxy.JumpDriveConstants =
{
   MinimumRange: 0.25,
   MaximumRange: 20.0,
   RangeStep: 0.25
};
