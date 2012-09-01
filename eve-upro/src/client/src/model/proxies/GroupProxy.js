/**
 * This proxy is the primary entry point for everything group related
 */
upro.model.proxies.GroupProxy = Class.create(upro.model.proxies.AbstractProxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.GroupProxy.NAME);

      this.groups = {};
      this.selectedGroupId = null;
   },

   onRegister: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      this.characterInfo = sessionProxy.getCharacterInfo();
      this.registerBroadcast(upro.data.clientBroadcastEvents.GroupMembership.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.GroupAdvertisement.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.GroupAdvertisementList.name);
   },

   forEachGroup: function(callback)
   {
      for ( var groupId in this.groups)
      {
         callback(this.groups[groupId]);
      }
   },

   setSelectedGroup: function(groupId)
   {
      if (this.selectedGroupId != groupId)
      {
         this.selectedGroupId = groupId;
         this.notifyGroupSelected();
      }
   },

   notifyGroupSelected: function()
   {
      var group = this.selectedGroupId ? this.groups[this.selectedGroupId] : null;

      this.facade().sendNotification(upro.app.Notifications.GroupSelected, group);
   },

   /**
    * @returns the selected GroupInfo object or null
    */
   getSelectedGroup: function()
   {
      return this.selectedGroupId ? this.groups[this.selectedGroupId] : null;
   },

   getSelectedGroupId: function()
   {
      return this.selectedGroupId;
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

   joinGroup: function(groupId)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      upro.sys.log("Requesting to join group [" + groupId + "]");
      sessionProxy.sendRequest(upro.data.clientRequests.JoinGroup.name,
      {
         groupId: groupId
      });
   },

   leaveGroup: function(groupId)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      upro.sys.log("Requesting to leave group [" + groupId + "]");
      sessionProxy.sendRequest(upro.data.clientRequests.LeaveGroup.name,
      {
         groupId: groupId
      });
   },

   destroyGroup: function(groupId)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      upro.sys.log("Requesting to destroy group [" + groupId + "]");
      sessionProxy.sendRequest(upro.data.clientRequests.DestroyGroup.name,
      {
         groupId: groupId
      });
   },

   advertiseSelectedGroup: function(interest)
   {
      if (this.selectedGroupId)
      {
         this.advertiseGroup(this.selectedGroupId, interest);
      }
   },

   advertiseGroup: function(groupId, interest)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      upro.sys.log("Requesting to advertise group [" + groupId + "]");
      sessionProxy.sendRequest(upro.data.clientRequests.AdvertiseGroup.name,
      {
         groupId: groupId,
         interest: interest
      });
   },

   removeAdvertisementsOfSelectedGroup: function(interest)
   {
      if (this.selectedGroupId)
      {
         this.removeAdvertisementOfGroup(this.selectedGroupId, interest);
      }
   },

   removeAdvertisementOfGroup: function(groupId, interest)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      upro.sys.log("Requesting to remove group advertisement [" + groupId + "]");
      sessionProxy.sendRequest(upro.data.clientRequests.RemoveGroupAdvertisements.name,
      {
         groupId: groupId,
         interest: interest
      });
   },

   onGroupMembership: function(broadcastBody)
   {
      var group = this.groups[broadcastBody.groupId];
      var changed = false;
      var created = false;

      if (broadcastBody.added)
      {
         if (!group)
         {
            group = new upro.model.GroupInfo(broadcastBody.groupId, broadcastBody.added.groupData,
                  this.characterInfo.characterId);
            this.groups[broadcastBody.groupId] = group;
            created = changed = true;
         }
         if (group.addMembers(broadcastBody.added.members))
         {
            changed = true;
         }
      }
      if (broadcastBody.removed)
      {
         group = this.groups[broadcastBody.groupId];
         if (group && group.removeMembers(broadcastBody.removed.members))
         {
            changed = true;
            if (!group.isClientMember())
            {
               group.setAdvertisements([]);
            }
         }
      }
      if (changed && this.handleGroupDataChange(group))
      {
         if (created)
         {
            this.facade().sendNotification(upro.app.Notifications.GroupListChanged);
         }
         this.notifyGroupMemberListChanged(group);
      }
   },

   notifyGroupMemberListChanged: function(group)
   {
      this.facade().sendNotification(upro.app.Notifications.GroupMemberListChanged, group);
   },

   onGroupAdvertisement: function(broadcastBody)
   {
      var group = this.groups[broadcastBody.groupId];
      var changed = false;

      if (broadcastBody.groupData)
      {
         if (!group)
         {
            group = new upro.model.GroupInfo(broadcastBody.groupId, broadcastBody.groupData,
                  this.characterInfo.characterId);
            this.groups[broadcastBody.groupId] = group;
            changed = true;
         }
         if (group.setClientAdvertised(true))
         {
            changed = true;
         }
      }
      else
      {
         group = this.groups[broadcastBody.groupId];
         if (group && group.setClientAdvertised(false))
         {
            changed = true;
         }
      }
      if (changed && this.handleGroupDataChange(group))
      {
         this.facade().sendNotification(upro.app.Notifications.GroupListChanged);
      }
   },

   onGroupAdvertisementList: function(broadcastBody)
   {
      var group = this.groups[broadcastBody.groupId];

      if (group)
      {
         group.setAdvertisements(broadcastBody.interest);
         if (this.selectedGroupId == group.getId())
         { // re-notify the selected group
            this.notifyGroupSelected();
         }
      }
   },

   /**
    * Handles a change of group data which might have it deleted.
    * 
    * @param group the group that was changed
    * @returns {Boolean} true if the group still exists
    */
   handleGroupDataChange: function(group)
   {
      var rCode = false;

      if (group.isClientMember() || group.isClientAdvertised())
      {
         rCode = true;
         if (this.selectedGroupId == group.getId())
         { // re-notify the selected group
            this.notifyGroupSelected();
         }
      }
      else
      {
         if (this.selectedGroupId == group.getId())
         {
            this.setSelectedGroup(null);
         }
         delete this.groups[group.getId()];
         this.facade().sendNotification(upro.app.Notifications.GroupListChanged);
      }

      return rCode;
   }
});

upro.model.proxies.GroupProxy.NAME = "Group";
