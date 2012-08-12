upro.model.proxies.UserSettingsProxy = Class.create(upro.model.proxies.AbstractDataStoreInfoProxy,
{
   initialize: function($super, data, dataStore)
   {
      $super(upro.model.proxies.UserSettingsProxy.NAME, data, dataStore);

      data.routingCapabilitiesChanged = this.onRoutingCapabilitiesChanged.bind(this);
      data.ignoredSolarSystemsChanged = this.onIgnoredSolarSystemsChanged.bind(this);
      data.routingRulesChanged = this.onRoutingRulesChanged.bind(this);
   },

   onRegister: function()
   {
      var self = this;
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.addBroadcastHandler("CharacterActiveGalaxy", function(broadcastBody)
      {
         self.onCharacterActiveGalaxy(broadcastBody);
      });
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
      return this.getData().getRoutingCapJumpGatesInUse();
   },

   toggleRoutingCapJumpGates: function()
   {
      var properties = {};

      properties[upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_GATES_IN_USE] = this.encodeBoolean(!this
            .getRoutingCapJumpGatesInUse());

      this.updateProperties(properties);
   },

   getRoutingCapJumpDriveInUse: function()
   {
      return this.getData().getRoutingCapJumpDriveInUse();
   },

   toggleRoutingCapJumpDrive: function()
   {
      var properties = {};

      properties[upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_DRIVE_IN_USE] = this.encodeBoolean(!this
            .getRoutingCapJumpDriveInUse());

      this.updateProperties(properties);
   },

   getRoutingCapJumpDriveRange: function()
   {
      return this.getData().getRoutingCapJumpDriveRange();
   },

   /**
    * Steps the range of the jump drive capability
    * 
    * @param increment whether to increment
    */
   stepRoutingCapJumpDriveRange: function(increment)
   {
      var value = this.getRoutingCapJumpDriveRange()
            + (increment ? upro.model.UserSettings.JumpDriveConstants.RangeStep
                  : -upro.model.UserSettings.JumpDriveConstants.RangeStep);

      if ((value >= upro.model.UserSettings.JumpDriveConstants.MinimumRange)
            && (value <= upro.model.UserSettings.JumpDriveConstants.MaximumRange))
      {
         var properties = {};

         properties[upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_DRIVE_RANGE] = value;

         this.updateProperties(properties);
      }
   },

   onIgnoredSolarSystemsChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.UserIgnoredSolarSystemsChanged,
            this.getIgnoredSolarSystemIds());
   },

   toggleIgnoredSolarSystem: function(solarSystemId)
   {
      var transaction = this.getDataStore().createWriteTransaction();
      var data = this.getData();
      var entries = data.getIgnoredSolarSystems();
      var found = false;

      for ( var i = 0; i < entries.length; i++)
      {
         var entry = entries[i];

         if (entry.getSolarSystemId() == solarSystemId)
         {
            transaction.deleteInfo(entry.getInfoId());
            found = true;
         }
      }
      if (!found)
      {
         var ignoredId = new upro.data.InfoId(upro.model.UserIgnoredSolarSystem.TYPE);

         transaction.createInfo(data.getInfoId(), ignoredId,
         {
            "solarSystemId": solarSystemId
         });
      }
      transaction.commit();
   },

   /**
    * Returns an array of solar system id entries that should be ignored
    * 
    * @return an array of solar system id entries
    */
   getIgnoredSolarSystemIds: function()
   {
      var entries = this.getData().getIgnoredSolarSystems();
      var result = [];

      for ( var i = 0; i < entries.length; i++)
      {
         var entry = entries[i];

         result.push(entry.getSolarSystemId());
      }

      return result;
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
      return this.getData().getRoutingRules();
   },

   /**
    * Toggles the InUse parameter of the routing rule identified by ruleType
    * 
    * @param ruleType to modify
    */
   toggleRoutingRule: function(ruleType)
   {
      var rule = this.getData().getRoutingRuleByType(ruleType);

      if (rule)
      {
         var transaction = this.getDataStore().createWriteTransaction();
         var properties = {};

         properties[upro.model.UserRoutingRule.PROPERTY_IN_USE] = rule.getInUse() ? 0 : 1;
         transaction.updateInfo(rule.getInfoId(), properties);
         transaction.commit();
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
      var rule = this.getData().getRoutingRuleByType(ruleType);

      if (rule)
      {
         var template = upro.model.UserRoutingRule.RuleConstants[rule.getRuleType()];
         var transaction = this.getDataStore().createWriteTransaction();
         var properties = {};

         properties[upro.model.UserRoutingRule.PROPERTY_PARAMETER] = rule.getParameter()
               + (increment ? template.Increment : -template.Increment);
         transaction.updateInfo(rule.getInfoId(), properties);
         transaction.commit();
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
      var rule = this.getData().getRoutingRuleByType(ruleType);

      if (rule)
      {
         var oldIndex = rule.getIndex();
         var newIndex = oldIndex + (up ? -1 : 1);

         if ((newIndex >= 0) && (newIndex < upro.model.UserRoutingRule.RuleLimit))
         {
            var rules = this.getRoutingRules();
            var transaction = this.getDataStore().createWriteTransaction();
            var properties = {};

            // update the specified rule
            properties[upro.model.UserRoutingRule.PROPERTY_INDEX] = newIndex;
            transaction.updateInfo(rule.getInfoId(), properties);
            for ( var i = 0; i < rules.length; i++)
            { // go through other rules and swapt their index
               rule = rules[i];
               if (rule.getIndex() == newIndex)
               {
                  properties = {};
                  properties[upro.model.UserRoutingRule.PROPERTY_INDEX] = oldIndex;
                  transaction.updateInfo(rule.getInfoId(), properties);
               }
            }
            transaction.commit();
         }
      }
   }

});

upro.model.proxies.UserSettingsProxy.NAME = "UserSettings";
