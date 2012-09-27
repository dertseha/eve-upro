/**
 * This proxy handles the autopilot route
 */
upro.model.proxies.AutopilotProxy = Class.create(upro.model.proxies.AbstractProxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.AutopilotProxy.NAME, null);

      this.route = [];
      this.nextRouteIndex = -1;
   },

   onRegister: function()
   {
      this.registerBroadcast(upro.data.clientBroadcastEvents.CharacterAutopilotRoute.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.CharacterAutopilotRouteIndex.name);
   },

   /**
    * Sets the route of the autopilot
    * 
    * @param route an array of SystemRouteEntry objects
    */
   setRoute: function(route)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);
      var body =
      {
         route: route.map(function(routeEntry)
         {
            return routeEntry.toRawData();
         })
      };

      sessionProxy.sendRequest(upro.data.clientRequests.SetAutopilotRoute.name, body);
   },

   getRoute: function()
   {
      return this.route;
   },

   getNextRouteIndex: function()
   {
      return this.nextRouteIndex;
   },

   onCharacterAutopilotRoute: function(broadcastBody)
   {
      var universeProxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME);

      this.nextRouteIndex = -1;
      this.route = broadcastBody.route.map(function(rawData)
      {
         var solarSystem = universeProxy.findSolarSystemById(rawData.solarSystemId);

         return new upro.nav.SystemRouteEntry(solarSystem, rawData.entryType, rawData.nextJumpType);
      });

      this.facade().sendNotification(upro.app.Notifications.AutopilotRouteChanged, null);
   },

   onCharacterAutopilotRouteIndex: function(broadcastBody)
   {
      this.nextRouteIndex = broadcastBody.nextRouteIndex;

      this.facade().sendNotification(upro.app.Notifications.AutopilotNextRouteIndexChanged, null);
   }

});

upro.model.proxies.AutopilotProxy.NAME = "Autopilot";
