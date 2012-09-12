/**
 * 
 */
upro.model.proxies.JumpCorridorProxy = Class.create(upro.model.proxies.AbstractProxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.JumpCorridorProxy.NAME, null);

      this.dataObjects = {};
      this.interestChecker = null;
   },

   onRegister: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);
      var groupProxy = this.facade().retrieveProxy(upro.model.proxies.GroupProxy.NAME);

      this.interestChecker = new upro.model.proxies.LocalBasedInterestChecker(sessionProxy.getCharacterInfo(),
            groupProxy);

      this.registerBroadcast(upro.data.clientBroadcastEvents.JumpCorridorInfo.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.JumpCorridorOwner.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.JumpCorridorShares.name);
   },

   forEachInfo: function(callback)
   {
      for ( var id in this.dataObjects)
      {
         callback(this.dataObjects[id]);
      }
   },

   setJumpCorridor: function(id, name, entry, exit, jumpType)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.SetJumpCorridor.name,
      {
         id: id,
         data:
         {
            name: name,
            entrySolarSystemId: entry,
            exitSolarSystemId: exit,
            jumpType: jumpType
         }
      });
   },

   onJumpCorridorInfo: function(broadcastBody)
   {
      var dataObject = this.dataObjects[broadcastBody.id];

      if (broadcastBody.data)
      {
         if (!dataObject)
         {
            dataObject = new upro.model.JumpCorridorInfo(broadcastBody.id, this.interestChecker, broadcastBody.data);
            this.dataObjects[dataObject.getId()] = dataObject;
            this.facade().sendNotification(upro.app.Notifications.JumpCorridorListChanged);
         }
         if (dataObject.updateData(broadcastBody.data))
         {
            this.facade().sendNotification(upro.app.Notifications.JumpCorridorDataChanged, dataObject);
         }
      }
      else if (dataObject)
      {
         delete this.dataObjects[broadcastBody.id];
         this.facade().sendNotification(upro.app.Notifications.JumpCorridorListChanged);
      }
   },

   onJumpCorridorOwner: function(broadcastBody)
   {
      var dataObject = this.dataObjects[broadcastBody.id];

      if (dataObject)
      {
         dataObject.owner = broadcastBody.interest;
         this.facade().sendNotification(upro.app.Notifications.JumpCorridorDataChanged, dataObject);
      }
   },

   onJumpCorridorShares: function(broadcastBody)
   {
      var dataObject = this.dataObjects[broadcastBody.id];

      if (dataObject)
      {
         dataObject.shares = broadcastBody.interest;
         this.facade().sendNotification(upro.app.Notifications.JumpCorridorDataChanged, dataObject);
      }
   }
});

upro.model.proxies.JumpCorridorProxy.NAME = "JumpCorridor";
