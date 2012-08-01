
upro.model.proxies.SessionControlProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.SessionControlProxy.NAME, null);

   },

   onRegister: function()
   {

   },

   shutdown: function()
   {
      var dataStore = this.getData();

      if (dataStore)
      {
         dataStore.deleteEntry(upro.data.InfoId.System);
         this.setData(null);
      }
   },

   runUnregistered: function()
   {
      this.shutdown();

      var dataStore = new upro.data.MemoryDataStore();

      this.setData(dataStore);
      dataStore.createEntry(upro.data.InfoId.System);

      {  // create basic system data structure
         var trans = dataStore.createWriteTransaction();
         var sessionId = new upro.data.InfoId(upro.model.UserSession.TYPE);
         var settingsId = new upro.data.InfoId(upro.model.UserSettings.TYPE);

         trans.createInfo(upro.data.InfoId.System, sessionId, { });
         trans.createInfo(sessionId, settingsId,
         {
            "activeGalaxy": upro.model.proxies.UniverseProxy.GALAXY_ID_NEW_EDEN,
            "routingCapJumpGatesInUse": "1",
            "routingCapJumpDriveInUse": "0",
            "routingCapJumpDriveRange": "5.0"
         });
         {  // ignored solar systems
            var ignoredId = new upro.data.InfoId(upro.model.UserIgnoredSolarSystem.TYPE);

            trans.createInfo(settingsId, ignoredId, { "solarSystemId": 30000142 }); // Jita
         }
         // routing rules
         this.createRoutingRule(trans, settingsId, 0, "MinSecurity", true, 5);
         this.createRoutingRule(trans, settingsId, 1, "MaxSecurity", false, 10);
         this.createRoutingRule(trans, settingsId, 2, "Jumps", true, 0);
         this.createRoutingRule(trans, settingsId, 3, "JumpFuel", false, 0);
         trans.commit();
      }
   },

   createRoutingRule: function(trans, settingsId, index, ruleType, inUse, parameter)
   {
      var ruleId = new upro.data.InfoId(upro.model.UserRoutingRule.TYPE);
      var properties = {};

      properties[upro.model.UserRoutingRule.PROPERTY_INDEX] = index;
      properties[upro.model.UserRoutingRule.PROPERTY_RULE_TYPE] = ruleType;
      properties[upro.model.UserRoutingRule.PROPERTY_IN_USE] = inUse ? 1 : 0;
      properties[upro.model.UserRoutingRule.PROPERTY_PARAMETER] = parameter;
      trans.createInfo(settingsId, ruleId, properties);
   },

   login: function(userName, password)
   {

   }

});

upro.model.proxies.SessionControlProxy.NAME = "SessionControl";
