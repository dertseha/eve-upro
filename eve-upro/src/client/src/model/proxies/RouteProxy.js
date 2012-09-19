/**
 * A proxy for the routes
 */
upro.model.proxies.RouteProxy = Class.create(upro.model.proxies.AbstractProxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.RouteProxy.NAME, null);

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

      this.registerBroadcast(upro.data.clientBroadcastEvents.RouteInfo.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.RouteOwner.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.RouteShares.name);
   },

   forEachInfo: function(callback)
   {
      for ( var id in this.dataObjects)
      {
         callback(this.dataObjects[id]);
      }
   },

   selectRoute: function(infoId)
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

      this.facade().sendNotification(upro.app.Notifications.RouteSelected, info);
   },

   /**
    * @returns the selected RouteInfo object or null
    */
   getSelectedInfo: function()
   {
      return this.selectedInfoId ? this.dataObjects[this.selectedInfoId] : null;
   },

   getSelectedInfoId: function()
   {
      return this.selectedInfoId;
   },

   createRoute: function(name, route)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);
      var data =
      {
         name: upro.model.proxies.RouteProxy.filterName(name, route),
         route: []
      };

      route.forEach(function(systemRouteEntry)
      {
         data.route.push(systemRouteEntry.toRawData());
      });
      sessionProxy.sendRequest(upro.data.clientRequests.CreateRoute.name,
      {
         data: data
      });
   },

   updateRoute: function(id, info)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);
      var data =
      {
         name: upro.model.proxies.RouteProxy.filterName(info.name, info.route),
         route: []
      };

      info.route.forEach(function(systemRouteEntry)
      {
         data.route.push(systemRouteEntry.toRawData());
      });
      sessionProxy.sendRequest(upro.data.clientRequests.UpdateRoute.name,
      {
         id: id,
         data: data
      });
   },

   destroyRoute: function(id)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.DestroyRoute.name,
      {
         id: id
      });
   },

   addOwner: function(id, interest)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.AddRouteOwner.name,
      {
         id: id,
         interest: interest
      });
   },

   removeOwner: function(id, interest)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.RemoveRouteOwner.name,
      {
         id: id,
         interest: interest
      });
   },

   addShares: function(id, interest)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.AddRouteShares.name,
      {
         id: id,
         interest: interest
      });
   },

   removeShares: function(id, interest)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest(upro.data.clientRequests.RemoveRouteShares.name,
      {
         id: id,
         interest: interest
      });
   },

   notifyDataChanged: function(dataObject)
   {
      this.facade().sendNotification(upro.app.Notifications.RouteDataChanged, dataObject);
      this.facade().sendNotification(upro.app.Notifications.SharedObjectDataChanged, dataObject);
   },

   onRouteInfo: function(broadcastBody)
   {
      var universeProxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME);
      var dataObject = this.dataObjects[broadcastBody.id];

      if (broadcastBody.data)
      {
         if (!dataObject)
         {
            dataObject = new upro.model.RouteInfo(broadcastBody.id, this, this.interestChecker, universeProxy);
            this.dataObjects[dataObject.getId()] = dataObject;
            dataObject.updateData(broadcastBody.data);
            this.facade().sendNotification(upro.app.Notifications.RouteListChanged);
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
            this.selectRoute(null);
         }
         this.facade().sendNotification(upro.app.Notifications.RouteListChanged);
      }
   },

   onRouteOwner: function(broadcastBody)
   {
      var dataObject = this.dataObjects[broadcastBody.id];

      if (dataObject)
      {
         dataObject.owner = broadcastBody.interest;
         this.notifyDataChanged(dataObject);
      }
   },

   onRouteShares: function(broadcastBody)
   {
      var dataObject = this.dataObjects[broadcastBody.id];

      if (dataObject)
      {
         dataObject.shares = broadcastBody.interest;
         this.notifyDataChanged(dataObject);
      }
   }
});

upro.model.proxies.RouteProxy.NAME = "Route";

/**
 * Ensures a name has a proper value; If empty, some route information is extracted
 */
upro.model.proxies.RouteProxy.filterName = function(value, route)
{
   var result = value;

   if ((result == null) || (result.length == 0))
   {
      if (route && (route.length > 0))
      {
         result = route[0].getSolarSystem().name + " - " + route[route.length - 1].getSolarSystem().name;
      }
      else
      {
         result = "?";
      }
   }

   return result;
};
