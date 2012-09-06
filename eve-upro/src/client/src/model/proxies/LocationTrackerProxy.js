/**
 * The location tracker holds all the location information for pilots
 */
upro.model.proxies.LocationTrackerProxy = Class.create(upro.model.proxies.AbstractProxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.LocationTrackerProxy.NAME, new upro.model.LocationTracker(this));

      this.statusGroups = {};
   },

   /** {@inheritDoc} */
   onRegister: function()
   {
      this.registerBroadcast(upro.data.clientBroadcastEvents.CharacterLocationStatusGroupSettings.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.CharacterLocationStatus.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.GroupMembership.name);
   },

   fireCharacterListInSolarSystemChangedIfOnlyChar: function(charId)
   {
      var data = this.getData();
      var solarSystem = data.getLocationByCharacter(charId);

      if (solarSystem)
      {
         var charIds = data.getCharactersByLocation(solarSystem.getId());

         if (charIds.length == 1)
         {
            this.notifyCharacterListInSolarSystemChanged(solarSystem.getId(), charIds);
         }
      }
   },

   /**
    * Returns the current location of given character
    * 
    * @param charId identifying the character
    * @returns either a SolarSytem instance or undefined
    */
   getLocation: function(charId)
   {
      var data = this.getData();

      return data.getLocationByCharacter(charId);
   },

   /**
    * Calls the callback for each status group
    * 
    * @param callback to be called, signature: function(statusGroup) {}
    */
   forEachGroup: function(callback)
   {
      for ( var groupId in this.statusGroups)
      {
         callback(this.statusGroups[groupId]);
      }
   },

   forEachVisibleCharacter: function(callback)
   {
      var that = this;
      var data = this.getData();

      data.forEachCharacter(function(charId)
      {
         if (that.isCharacterVisible(charId))
         {
            callback(charId);
         }
      });
   },

   isCharacterVisible: function(characterId)
   {
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);
      var rCode = false;

      this.forEachGroup(function(statusGroup)
      {
         if (statusGroup.isDisplayLocationEnabled())
         {
            var group = groupProxy.getGroup(statusGroup.getId());

            if (group.isCharacterMember(characterId))
            {
               rCode = true;
            }
         }
      });

      return rCode;
   },

   /**
    * Requests to modify the settings of a status group
    * 
    * @param groupId identifying the group to modify
    * @param data object containing optional sendLocation and displayLocation members
    */
   modifyLocationStatusGroup: function(groupId, data)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.ModifyCharacterLocationStatusGroup.name,
      {
         groupId: groupId,
         sendLocation: data.sendLocation,
         displayLocation: data.displayLocation
      });
   },

   /**
    * Broadcast Handler
    */
   onCharacterLocationStatusGroupSettings: function(broadcastBody)
   {
      var data = this.getData();
      var group = this.ensureLocationStatusGroup(broadcastBody.groupId);
      var that = this;

      group.setSendLocation(broadcastBody.sendLocation);
      if (group.updateDisplayLocation(broadcastBody.displayLocation))
      {
         data.forEachLocation(function(solarSystemId)
         {
            var charIds = data.getCharactersByLocation(solarSystemId);

            that.notifyCharacterListInSolarSystemChanged(solarSystemId, charIds);
         });
         this.facade().sendNotification(upro.app.Notifications.LocationStatusDisplayListChanged);
      }
      this.facade().sendNotification(upro.app.Notifications.LocationStatusGroupListChanged);
   },

   /**
    * Broadcast Handler
    */
   onGroupMembership: function(broadcastBody)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);
      var characterInfo = sessionProxy.getCharacterInfo();
      var statusGroup = this.statusGroups[broadcastBody.groupId];

      if (statusGroup && broadcastBody.removed
            && (broadcastBody.removed.members.indexOf(characterInfo.characterId) >= 0))
      {
         delete this.statusGroups[broadcastBody.groupId];
         this.facade().sendNotification(upro.app.Notifications.LocationStatusGroupListChanged);
      }
      this.facade().sendNotification(upro.app.Notifications.LocationStatusDisplayListChanged);
   },

   /**
    * Broadcast Handler
    */
   onCharacterLocationStatus: function(broadcastBody)
   {
      var data = this.getData();
      var charId = broadcastBody.characterInfo.characterId;
      var universeProxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME);
      var solarSystem = universeProxy.findSolarSystemById(broadcastBody.solarSystemId);

      data.setLocationForCharacter(charId, solarSystem);
      this.facade().sendNotification(upro.app.Notifications.CharacterLocationStatus, charId);
   },

   /**
    * Ensures that a LocationStatusGroupInfo exists for given groupId
    * 
    * @param groupId the ID of the group
    * @returns a LocationStatusGroupInfo instance
    */
   ensureLocationStatusGroup: function(groupId)
   {
      var group = this.statusGroups[groupId];

      if (!group)
      {
         group = new upro.model.LocationStatusGroupInfo(groupId);
         this.statusGroups[groupId] = group;
      }

      return group;
   },

   onCharactersByLocationChanged: function(solarSystemId, characterIdList)
   {
      this.notifyCharacterListInSolarSystemChanged(solarSystemId, characterIdList);
   },

   notifyCharacterListInSolarSystemChanged: function(solarSystemId, characterIdList)
   {
      var universeProxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME);
      var notifyBody =
      {
         solarSystem: universeProxy.findSolarSystemById(solarSystemId),
         characterIdList: characterIdList
      };

      this.facade().sendNotification(upro.app.Notifications.CharacterListInSolarSystemChanged, notifyBody);
   }

});

upro.model.proxies.LocationTrackerProxy.NAME = "LocationTracker";
