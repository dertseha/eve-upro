/**
 * This proxy is the primary entry point for anything the user does currently. The same session stays active as long as
 * at least one client is bound to it.
 */
upro.model.proxies.UserSessionProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.UserSessionProxy.NAME);

      this.preparedCorridor = null;
   },

   onRegister: function()
   {

   },

   setCorridorPreparation: function(solarSystem, jumpType)
   {
      if (solarSystem && jumpType)
      {
         this.preparedCorridor =
         {
            entrySolarSystemId: solarSystem.getId(),
            jumpType: jumpType
         };
      }
      else
      {
         this.preparedCorridor = null;
      }

      this.onCorridorPreparationChanged();
   },

   /**
    * Returns the prepared jump type for a new corridor
    * 
    * @return the prepared jump type for a new corridor
    */
   getCorridorPreparationJumpType: function()
   {
      return this.preparedCorridor ? this.preparedCorridor.jumpType : upro.nav.JumpType.None;
   },

   /**
    * Returns the prepared solar system for a new corridor or null
    * 
    * @return the prepared solar system for a new corridor or null
    */
   getCorridorPreparationSolarSystem: function()
   {
      var solarSystem = null;

      if (this.preparedCorridor && this.preparedCorridor.entrySolarSystemId)
      {
         var universeProxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME);

         solarSystem = universeProxy.findSolarSystemById(this.preparedCorridor.entrySolarSystemId);
      }

      return solarSystem;
   },

   onCorridorPreparationChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.NewCorridorPreparationChanged, null);
   }

});

upro.model.proxies.UserSessionProxy.NAME = "UserSession";
