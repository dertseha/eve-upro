upro.model.proxies.LocationTrackerProxy = Class.create(upro.model.proxies.AbstractProxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.LocationTrackerProxy.NAME, new upro.model.LocationTracker());

      this.statusGroups = {};
   },

   onRegister: function()
   {
      this.registerBroadcast(upro.data.clientBroadcastEvents.CharacterLocationStatusGroupSettings.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.CharacterLocationStatus.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.GroupMembership.name);
   },

   forEachGroup: function(callback)
   {
      for ( var groupId in this.statusGroups)
      {
         callback(this.statusGroups[groupId]);
      }
   },

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

   onCharacterLocationStatusGroupSettings: function(broadcastBody)
   {
      var group = this.ensureLocationStatusGroup(broadcastBody.groupId);
      upro.sys.log("settings changed: " + Object.toJSON(broadcastBody));
      group.setSendLocation(broadcastBody.sendLocation);
      group.setDisplayLocation(broadcastBody.displayLocation);

      this.facade().sendNotification(upro.app.Notifications.LocationStatusGroupListChanged);
   },

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
   },

   onCharacterLocationStatus: function(broadcastBody)
   {
      var data = this.getData();
      var charId = broadcastBody.characterInfo.characterId;
      var universeProxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME);
      var solarSystem = universeProxy.findSolarSystemById(broadcastBody.solarSystemId);

      data.setLocationForCharacter(charId, solarSystem);
      this.facade().sendNotification(upro.app.Notifications.CharacterLocationStatus, charId);
   },

   getLocation: function(charId)
   {
      var data = this.getData();

      return data.getLocationByCharacter(charId);
   },

   ensureLocationStatusGroup: function(groupId)
   {
      var group = this.statusGroups[groupId];

      if (!group)
      {
         group = new upro.model.LocationStatusGroupInfo(groupId);
         this.statusGroups[groupId] = group;
      }

      return group;
   }

});

upro.model.proxies.LocationTrackerProxy.NAME = "LocationTracker";
