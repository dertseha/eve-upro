/**
 * A proxy for the jump corridors
 */
upro.model.proxies.JumpCorridorProxy = Class.create(upro.model.proxies.AbstractProxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.JumpCorridorProxy.NAME, null);

      this.dataObjects = {};
      this.interestChecker = null;
      this.selectedInfoId = null;
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

   selectJumpCorridor: function(infoId)
   {
      if (this.selectedInfoId != infoId)
      {
         this.selectedInfoId = infoId;
         this.notifyInfoSelected();
      }
   },

   notifyInfoSelected: function()
   {
      var info = this.selectedInfoId ? this.dataObjects[this.selectedInfoId] : null;

      this.facade().sendNotification(upro.app.Notifications.JumpCorridorSelected, info);
   },

   /**
    * @returns the selected JumpCorridorInfo object or null
    */
   getSelectedInfo: function()
   {
      return this.selectedInfoId ? this.dataObjects[this.selectedInfoId] : null;
   },

   getSelectedInfoId: function()
   {
      return this.selectedInfoId;
   },

   createJumpCorridor: function(name, entrySolarSystem, exitSolarSystem, jumpType)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.CreateJumpCorridor.name,
      {
         data:
         {
            name: upro.model.proxies.JumpCorridorProxy.filterName(name, entrySolarSystem.name, exitSolarSystem.name),
            entrySolarSystemId: entrySolarSystem.getId(),
            exitSolarSystemId: exitSolarSystem.getId(),
            jumpType: jumpType
         }
      });
   },

   updateJumpCorridor: function(id, data)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.UpdateJumpCorridor.name,
      {
         id: id,
         data:
         {
            name: data.name
         }
      });
   },

   destroyJumpCorridor: function(id)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.DestroyJumpCorridor.name,
      {
         id: id
      });
   },

   onJumpCorridorInfo: function(broadcastBody)
   {
      var dataObject = this.dataObjects[broadcastBody.id];

      if (broadcastBody.data)
      {
         if (!dataObject)
         {
            var universeProxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME);

            dataObject = new upro.model.JumpCorridorInfo(broadcastBody.id, this.interestChecker, broadcastBody.data,
                  universeProxy);
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

         if (this.selectedInfoId == broadcastBody.id)
         {
            this.selectJumpCorridor(null);
         }
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

/**
 * Ensures a name has a proper value; If empty, the names of the solar systems are used
 */
upro.model.proxies.JumpCorridorProxy.filterName = function(value, entryName, exitName)
{
   var result = value;

   if ((result == null) || (result.length == 0))
   {
      result = entryName + ' - ' + exitName;
   }

   return result;
};
