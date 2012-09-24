/**
 * This proxy is the primary entry point for everything group related
 */
upro.model.proxies.GroupProxy = Class.create(upro.model.proxies.AbstractProxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.GroupProxy.NAME);

      this.predefinedGroups = {};
      this.dataObjects = {};
      this.interestChecker = null;
      this.selectedGroupId = null;
   },

   onRegister: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      this.characterInfo = sessionProxy.getCharacterInfo();

      this.interestChecker = new upro.model.proxies.LocalBasedInterestChecker(this.characterInfo, this);

      this.registerBroadcast(upro.data.clientBroadcastEvents.CharacterLocationStatus.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.GroupMembership.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.GroupInfo.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.GroupOwner.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.GroupShares.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.GroupBannedList.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.GroupBannedStatus.name);

      this.createPredefinedGroupInfoObjects();
   },

   createPredefinedGroupInfoObjects: function()
   {
      for ( var groupId in upro.model.predefinedGroupTypes)
      {
         var type = upro.model.predefinedGroupTypes[groupId];
         var groupData =
         {
            name: upro.res.text.Lang.format("predefined.groups." + type)
         };
         var group = new upro.model.GroupInfo(groupId, this, this.interestChecker, this.characterInfo.characterId);

         group.updateData(groupData);
         this.predefinedGroups[groupId] = group;
      }
   },

   forEachGroup: function(callback)
   {
      for ( var groupId in this.dataObjects)
      {
         callback(this.dataObjects[groupId]);
      }
   },

   getGroup: function(groupId)
   {
      return this.dataObjects[groupId] || this.predefinedGroups[groupId];
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
      var group = this.selectedGroupId ? this.dataObjects[this.selectedGroupId] : null;

      this.facade().sendNotification(upro.app.Notifications.GroupSelected, group);
   },

   /**
    * @returns the selected GroupInfo object or null
    */
   getSelectedGroup: function()
   {
      return this.selectedGroupId ? this.dataObjects[this.selectedGroupId] : null;
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
         data:
         {
            name: groupName
         }
      });
   },

   joinGroup: function(groupId)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      upro.sys.log("Requesting to join group [" + groupId + "]");
      sessionProxy.sendRequest(upro.data.clientRequests.JoinGroup.name,
      {
         id: groupId
      });
   },

   leaveGroup: function(groupId)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      upro.sys.log("Requesting to leave group [" + groupId + "]");
      sessionProxy.sendRequest(upro.data.clientRequests.LeaveGroup.name,
      {
         id: groupId
      });
   },

   destroyGroup: function(groupId)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      upro.sys.log("Requesting to destroy group [" + groupId + "]");
      sessionProxy.sendRequest(upro.data.clientRequests.DestroyGroup.name,
      {
         id: groupId
      });
   },

   addOwner: function(id, interest)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.AddGroupOwner.name,
      {
         id: id,
         interest: interest
      });
   },

   removeOwner: function(id, interest)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.RemoveGroupOwner.name,
      {
         id: id,
         interest: interest
      });
   },

   addShares: function(id, interest)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.AddGroupShares.name,
      {
         id: id,
         interest: interest
      });
   },

   removeShares: function(id, interest)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.RemoveGroupShares.name,
      {
         id: id,
         interest: interest
      });
   },

   banMembers: function(id, characterIdList)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.BanGroupMembers.name,
      {
         id: id,
         characters: characterIdList
      });
   },

   unbanMembers: function(id, characterIdList)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.UnbanGroupMembers.name,
      {
         id: id,
         characters: characterIdList
      });
   },

   notifyDataChanged: function(dataObject)
   {
      this.facade().sendNotification(upro.app.Notifications.GroupDataChanged, dataObject);
      if (this.selectedGroupId == dataObject.getId())
      {
         this.notifyGroupSelected();
      }
   },

   onGroupInfo: function(broadcastBody)
   {
      var dataObject = this.dataObjects[broadcastBody.id];

      if (broadcastBody.data)
      {
         if (!dataObject)
         {
            dataObject = new upro.model.GroupInfo(broadcastBody.id, this, this.interestChecker,
                  this.characterInfo.characterId);
            this.dataObjects[dataObject.getId()] = dataObject;
            dataObject.updateData(broadcastBody.data);
            this.facade().sendNotification(upro.app.Notifications.GroupListChanged);
         }
         else
         {
            dataObject.updateData(broadcastBody.data);
            this.notifyDataChanged(dataObject);
         }
      }
      else if (dataObject)
      {
         delete this.dataObjects[broadcastBody.id];

         if (this.selectedInfoId == broadcastBody.id)
         {
            this.selectGroup(null);
         }
         this.facade().sendNotification(upro.app.Notifications.GroupListChanged);
      }
   },

   onGroupOwner: function(broadcastBody)
   {
      var dataObject = this.dataObjects[broadcastBody.id];

      if (dataObject)
      {
         dataObject.owner = broadcastBody.interest;
         this.notifyDataChanged(dataObject);
      }
   },

   onGroupShares: function(broadcastBody)
   {
      var dataObject = this.dataObjects[broadcastBody.id];

      if (dataObject)
      {
         dataObject.shares = broadcastBody.interest;
         this.notifyDataChanged(dataObject);
      }
   },

   onGroupBannedList: function(broadcastBody)
   {
      var dataObject = this.dataObjects[broadcastBody.id];

      if (dataObject)
      {
         dataObject.blackList = broadcastBody.characters;
         this.notifyDataChanged(dataObject);
      }
   },

   onGroupBannedStatus: function(broadcastBody)
   {
      var dataObject = this.dataObjects[broadcastBody.id];

      if (dataObject)
      {
         dataObject.banned = broadcastBody.banned;
         this.notifyDataChanged(dataObject);
      }
   },

   /**
    * Broadcast Handler
    * 
    * TODO: that the group proxy needs to handle location status to get info is not good.
    */
   onCharacterLocationStatus: function(broadcastBody)
   {
      if (this.characterInfo.corporationId === broadcastBody.characterInfo.corporationId)
      {
         var charId = broadcastBody.characterInfo.characterId;

         this.predefinedGroups[upro.model.predefinedGroupIds["Corporation"]].addMembers([ charId ]);
      }
      if (this.characterInfo.allianceId && (this.characterInfo.allianceId === broadcastBody.characterInfo.allianceId))
      {
         var charId = broadcastBody.characterInfo.characterId;

         this.predefinedGroups[upro.model.predefinedGroupIds["Alliance"]].addMembers([ charId ]);
      }
   },

   onGroupMembership: function(broadcastBody)
   {
      var group = this.dataObjects[broadcastBody.groupId];

      if (group)
      {
         if (broadcastBody.added)
         {
            group.addMembers(broadcastBody.added.members);
         }
         if (broadcastBody.removed)
         {
            group.removeMembers(broadcastBody.removed.members);
         }

         this.notifyGroupMemberListChanged(group);
         if (this.selectedGroupId == group.getId())
         {
            this.notifyGroupSelected();
         }
      }
   },

   notifyGroupMemberListChanged: function(group)
   {
      this.facade().sendNotification(upro.app.Notifications.GroupMemberListChanged, group);
   }
});

upro.model.proxies.GroupProxy.NAME = "Group";
