/**
 * This proxy is the primary entry point for anything the user does currently. The same session stays active as long as
 * at least one client is bound to it.
 */
upro.model.proxies.UserSessionProxy = Class.create(upro.model.proxies.AbstractDataStoreInfoProxy,
{
   initialize: function($super, data, dataStore)
   {
      $super(upro.model.proxies.UserSessionProxy.NAME, data, dataStore);

      data.corridorPreparationChanged = this.onCorridorPreparationChanged.bind(this);

   },

   onRegister: function()
   {
      this.facade().sendNotification(upro.app.Notifications.SessionLoggedIn, null);
   },

   setCorridorPreparation: function(solarSystem, jumpType)
   {
      var properties = {};

      properties[upro.model.UserSession.PROPERTY_CORRIDOR_PREP_SYSTEM_ID] = solarSystem ? solarSystem.id : "";
      properties[upro.model.UserSession.PROPERTY_CORRIDOR_PREP_JUMP_TYPE] = jumpType ? jumpType : "";

      this.updateProperties(properties);
   },

   /**
    * Returns the prepared jump type for a new corridor
    * 
    * @return the prepared jump type for a new corridor
    */
   getCorridorPreparationJumpType: function()
   {
      var temp = this.getData().getCorridorPrepJumpType();

      return (temp && (temp.length > 0)) ? temp : upro.nav.JumpType.None;
   },

   /**
    * Returns the prepared solar system for a new corridor or null
    * 
    * @return the prepared solar system for a new corridor or null
    */
   getCorridorPreparationSolarSystem: function()
   {
      var id = this.getData().getCorridorPrepSystemId();
      var universeProxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME);

      return id ? universeProxy.findSolarSystemById(id) : null;
   },

   onCorridorPreparationChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.NewCorridorPreparationChanged, null);
   }

});

upro.model.proxies.UserSessionProxy.NAME = "UserSession";
