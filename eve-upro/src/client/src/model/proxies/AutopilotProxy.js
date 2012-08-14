upro.model.proxies.AutopilotProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.AutopilotProxy.NAME, null);

      this.route = [];
      this.nextRouteIndex = -1;
   },

   onRegister: function()
   {
      var self = this;
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.addBroadcastHandler("CharacterAutopilotRoute", function(broadcastBody)
      {
         self.onCharacterAutopilotRoute(broadcastBody);
      });
      sessionProxy.addBroadcastHandler("CharacterAutopilotRouteIndex", function(broadcastBody)
      {
         self.onCharacterAutopilotRouteIndex(broadcastBody);
      });
   },

   setRoute: function(route)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.sendRequest("SetAutopilotRoute",
      {
         route: route
      });
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
      this.route = broadcastBody.route;
      this.nextRouteIndex = -1;

      this.facade().sendNotification(upro.app.Notifications.AutopilotRouteChanged, null);
   },

   onCharacterAutopilotRouteIndex: function(broadcastBody)
   {
      this.nextRouteIndex = broadcastBody.nextRouteIndex;

      this.facade().sendNotification(upro.app.Notifications.AutopilotNextRouteIndexChanged, null);
   }

});

upro.model.proxies.AutopilotProxy.NAME = "Autopilot";
