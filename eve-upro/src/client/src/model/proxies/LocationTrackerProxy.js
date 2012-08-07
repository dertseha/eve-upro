upro.model.proxies.LocationTrackerProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.LocationTrackerProxy.NAME, new upro.model.LocationTracker());

   },

   onRegister: function()
   {
      var self = this;
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionProxy.addBroadcastHandler("CharacterLocationStatus", function(broadcastBody)
      {
         self.onCharacterLocationStatus(broadcastBody);
      });
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
   }

});

upro.model.proxies.LocationTrackerProxy.NAME = "LocationTracker";
