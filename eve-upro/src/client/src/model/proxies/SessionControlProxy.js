upro.model.proxies.SessionControlProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.SessionControlProxy.NAME, null);

      this.uplink = new upro.data.CommunicationUplink(this);
      this.broadcastHandler = {};
      this.characterInfo = null;
   },

   addBroadcastHandler: function(type, callback)
   {
      var handlerList = this.broadcastHandler[type];

      if (!handlerList)
      {
         this.broadcastHandler[type] = handlerList = [];
      }
      handlerList.push(callback);
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

      this.uplink.start();

      var dataStore = new upro.data.MemoryDataStore();

      this.setData(dataStore);
      dataStore.createEntry(upro.data.InfoId.System);

      { // create basic system data structure
         var trans = dataStore.createWriteTransaction();
         var sessionId = new upro.data.InfoId(upro.model.UserSession.TYPE);
         var settingsId = new upro.data.InfoId(upro.model.UserSettings.TYPE);

         trans.createInfo(upro.data.InfoId.System, sessionId, {});
         trans.createInfo(sessionId, settingsId,
         {
            "activeGalaxy": upro.model.proxies.UniverseProxy.GALAXY_ID_NEW_EDEN,
            "routingCapJumpGatesInUse": "1",
            "routingCapJumpDriveInUse": "0",
            "routingCapJumpDriveRange": "5.0"
         });
         { // ignored solar systems
            var ignoredId = new upro.data.InfoId(upro.model.UserIgnoredSolarSystem.TYPE);

            trans.createInfo(settingsId, ignoredId,
            {
               "solarSystemId": 30000142
            }); // Jita
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

   },

   /**
    * @returns the character information this session runs for
    */
   getCharacterInfo: function()
   {
      return this.characterInfo;
   },

   /**
    * @param charId The character id to check
    * @returns {Boolean} true if the given character is the one this session is for
    */
   isForCharacter: function(charId)
   {
      return this.characterInfo && (this.characterInfo.characterId == charId);
   },

   onSessionEstablished: function(characterInfo)
   {
      upro.sys.log("Session Established for: " + characterInfo.characterName + " (" + characterInfo.corporationName
            + ")");
      this.characterInfo = characterInfo;
   },

   onBroadcast: function(header, body)
   {
      // upro.sys.log("Broadcast: " + Object.toJSON(header) + "/" + Object.toJSON(body));
      var handlerList = this.broadcastHandler[header.type];

      if (handlerList)
      {
         handlerList.forEach(function(callback)
         {
            callback(body);
         });
      }
   }

});

upro.model.proxies.SessionControlProxy.NAME = "SessionControl";
