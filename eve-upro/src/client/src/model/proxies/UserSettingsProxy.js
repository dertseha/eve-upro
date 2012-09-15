upro.model.proxies.UserSettingsProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.UserSettingsProxy.NAME);

      this.ignoredSolarSystems = [ 30000142 ]; // Jita

      this.routingCapabilities =
      {
         jumpBridges:
         {
            inUse: false
         },
         jumpGates:
         {
            inUse: false
         },
         jumpDrive:
         {
            inUse: false,
            range: 0.0
         },
         wormholes:
         {
            inUse: false
         }
      };

      this.routingRules = {};

      this.registerRoutingRule("minSecurity", upro.nav.finder.PathFinderCostRuleMinSecurity);
      this.registerRoutingRule("maxSecurity", upro.nav.finder.PathFinderCostRuleMaxSecurity);
      this.registerRoutingRule("jumps", upro.nav.finder.PathFinderCostRuleJumps);
      this.registerRoutingRule("jumpFuel", upro.nav.finder.PathFinderCostRuleJumpFuel);
   },

   registerRoutingRule: function(ruleType, pathFinderConstructor)
   {
      this.routingRules[ruleType] = new upro.model.UserRoutingRule(ruleType, pathFinderConstructor);
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
         galaxyId: galaxyId | 0
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

   getRoutingCapJumpBridgesInUse: function()
   {
      return this.routingCapabilities.jumpBridges.inUse;
   },

   toggleRoutingCapJumpBridges: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest("SetRoutingCapabilityJumpBridges",
      {
         inUse: !this.getRoutingCapJumpBridgesInUse()
      });
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

   getRoutingCapWormholesInUse: function()
   {
      return this.routingCapabilities.wormholes.inUse;
   },

   toggleRoutingCapWormholes: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest("SetRoutingCapabilityWormholes",
      {
         inUse: !this.getRoutingCapWormholesInUse()
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
      var rangeStep = upro.model.RoutingCapabilities.jumpDrive.rangeStep;
      var value = this.getRoutingCapJumpDriveRange() + (increment ? rangeStep : -rangeStep);
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest("SetRoutingCapabilityJumpDrive",
      {
         range: value
      });
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

   onCharacterRoutingRules: function(broadcastBody)
   {
      for ( var ruleName in broadcastBody)
      {
         var rawData = broadcastBody[ruleName];
         var rule = this.routingRules[ruleName];

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
            name: ruleType,
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
         var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

         sessionProxy.sendRequest("SetRoutingRuleData",
         {
            name: ruleType,
            parameter: rule.parameter + (increment ? rule.template.increment : -rule.template.increment)
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

         if (newIndex >= 0)
         {
            var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

            sessionProxy.sendRequest("SetRoutingRuleIndex",
            {
               name: ruleType,
               index: newIndex
            });
         }
      }
   }

});

upro.model.proxies.UserSettingsProxy.NAME = "UserSettings";
