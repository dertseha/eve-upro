upro.model.proxies.UserSettingsProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.UserSettingsProxy.NAME);

      this.ignoredSolarSystems = [ 30000142 ]; // Jita

      this.routingCapabilities =
      {
         jumpGates:
         {
            inUse: false
         },
         jumpDrive:
         {
            inUse: false,
            range: 0.0
         }
      };

      this.routingRules = {};

      this.createRoutingRule(0, "MinSecurity", true, 5, "minSecurity");
      this.createRoutingRule(1, "MaxSecurity", false, 10, "maxSecurity");
      this.createRoutingRule(2, "Jumps", true, 0, "jumps");
      this.createRoutingRule(3, "JumpFuel", false, 0, "jumpFuel");
   },

   createRoutingRule: function(index, ruleType, inUse, parameter, name)
   {
      var rule = new upro.model.UserRoutingRule();

      rule.index = index;
      rule.ruleType = ruleType;
      rule.inUse = inUse;
      rule.parameter = parameter;
      rule.name = name;

      this.routingRules[ruleType] = rule;

      return rule;
   },

   onRegister: function()
   {
      var self = this;
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.addBroadcastHandler("CharacterActiveGalaxy", function(broadcastBody)
      {
         self.onCharacterActiveGalaxy(broadcastBody);
      });
      sessionProxy.addBroadcastHandler("CharacterIgnoredSolarSystems", function(broadcastBody)
      {
         self.onCharacterIgnoredSolarSystems(broadcastBody);
      });
      sessionProxy.addBroadcastHandler("CharacterRoutingCapabilities", function(broadcastBody)
      {
         self.onCharacterRoutingCapabilities(broadcastBody);
      });
      sessionProxy.addBroadcastHandler("CharacterRoutingRules", function(broadcastBody)
      {
         self.onCharacterRoutingRules(broadcastBody);
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

   onCharacterRoutingCapabilities: function(broadcastBody)
   {
      this.routingCapabilities = broadcastBody;
      this.onRoutingCapabilitiesChanged();
   },

   onRoutingCapabilitiesChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.UserRoutingCapabilitiesChanged);
   },

   getRoutingCapJumpGatesInUse: function()
   {
      return this.routingCapabilities.jumpGates.inUse;
   },

   toggleRoutingCapJumpGates: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest("SetRoutingCapabilityJumpGates",
      {
         inUse: !this.getRoutingCapJumpGatesInUse()
      });
   },

   getRoutingCapJumpDriveInUse: function()
   {
      return this.routingCapabilities.jumpDrive.inUse;
   },

   toggleRoutingCapJumpDrive: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest("SetRoutingCapabilityJumpDrive",
      {
         inUse: !this.getRoutingCapJumpDriveInUse()
      });
   },

   getRoutingCapJumpDriveRange: function()
   {
      return this.routingCapabilities.jumpDrive.range;
   },

   /**
    * Steps the range of the jump drive capability
    * 
    * @param increment whether to increment
    */
   stepRoutingCapJumpDriveRange: function(increment)
   {
      var value = this.getRoutingCapJumpDriveRange()
            + (increment ? upro.model.proxies.UserSettingsProxy.JumpDriveConstants.RangeStep
                  : -upro.model.proxies.UserSettingsProxy.JumpDriveConstants.RangeStep);

      if ((value >= upro.model.proxies.UserSettingsProxy.JumpDriveConstants.MinimumRange)
            && (value <= upro.model.proxies.UserSettingsProxy.JumpDriveConstants.MaximumRange))
      {
         var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

         sessionProxy.sendRequest("SetRoutingCapabilityJumpDrive",
         {
            range: value
         });
      }
   },

   onCharacterIgnoredSolarSystems: function(broadcastBody)
   {
      this.ignoredSolarSystems = broadcastBody.ignoredSolarSystems;
      this.onIgnoredSolarSystemsChanged();
   },

   onIgnoredSolarSystemsChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.UserIgnoredSolarSystemsChanged,
            this.getIgnoredSolarSystemIds());
   },

   toggleIgnoredSolarSystem: function(solarSystemId)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest("SetIgnoredSolarSystem",
      {
         solarSystemId: solarSystemId,
         ignore: !this.isSolarSystemIgnored(solarSystemId)
      });
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
    * @param solarSystemId the ID to look for
    * @returns {Boolean} true if ignored
    */
   isSolarSystemIgnored: function(solarSystemId)
   {
      return this.ignoredSolarSystems.indexOf(solarSystemId) >= 0;
   },

   findRoutingRuleByName: function(name)
   {
      var rule = null;

      for ( var type in this.routingRules)
      {
         var temp = this.routingRules[type];

         if (temp.name == name)
         {
            rule = temp;
         }
      }

      return rule;
   },

   onCharacterRoutingRules: function(broadcastBody)
   {
      for ( var ruleName in broadcastBody)
      {
         var rawData = broadcastBody[ruleName];
         var rule = this.findRoutingRuleByName(ruleName);

         rule.index = rawData.index;
         rule.inUse = rawData.inUse;
         rule.parameter = rawData.parameter;
      }
      this.onRoutingRulesChanged();
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
         var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

         sessionProxy.sendRequest("SetRoutingRuleData",
         {
            name: rule.name,
            inUse: !rule.inUse
         });
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
         var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

         sessionProxy.sendRequest("SetRoutingRuleData",
         {
            name: rule.name,
            parameter: rule.parameter + (increment ? template.Increment : -template.Increment)
         });
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
            var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

            sessionProxy.sendRequest("SetRoutingRuleIndex",
            {
               name: rule.name,
               index: newIndex
            });
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
