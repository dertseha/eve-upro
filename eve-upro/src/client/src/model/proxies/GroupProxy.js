/**
 * This proxy is the primary entry point for everything group related
 */
upro.model.proxies.GroupProxy = Class.create(upro.model.proxies.AbstractProxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.GroupProxy.NAME);

      this.groups = {};
   },

   onRegister: function()
   {
      this.registerBroadcast(upro.data.clientBroadcastEvents.GroupMembership.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.GroupAdvertisement.name);
   },

   forEachGroup: function(callback)
   {
      for ( var groupId in this.groups)
      {
         callback(this.groups[groupId]);
      }
   },

   createGroup: function(groupName)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      upro.sys.log("Requesting to create group [" + groupName + "]");
      sessionProxy.sendRequest(upro.data.clientRequests.CreateGroup.name,
      {
         name: groupName
      });
   },

   onGroupMembership: function(broadcastBody)
   {
      console.log('got membership: ' + Object.toJSON(broadcastBody));
      if (broadcastBody.added)
      {
         var group = this.ensureGroupInfo(broadcastBody.groupId, broadcastBody.added.groupData);

      }
   },

   onGroupAdvertisement: function(broadcastBody)
   {
      console.log('got advertisement: ' + Object.toJSON(broadcastBody));
   },

   /**
    * Ensures the existence of a GroupInfo object based on given data
    * 
    * @param groupData init data as provided from the server
    * @returns upro.model.GroupInfo
    */
   ensureGroupInfo: function(groupId, groupData)
   {
      var group = this.groups[groupId];

      if (!group)
      {
         group = new upro.model.GroupInfo(groupId, groupData);
         this.groups[groupId] = group;

         this.facade().sendNotification(upro.app.Notifications.GroupCreated, group);
      }

      return group;
   }
});

upro.model.proxies.GroupProxy.NAME = "Group";
