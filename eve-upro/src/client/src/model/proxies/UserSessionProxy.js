/**
 * This proxy is the primary entry point for anything the user does currently. The same session stays active as long as
 * at least one client is bound to it.
 */
upro.model.proxies.UserSessionProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.UserSessionProxy.NAME);

   },

   onRegister: function()
   {

   },

   setCorridorPreparation: function(solarSystem, jumpType)
   {

   },

   /**
    * Returns the prepared jump type for a new corridor
    * 
    * @return the prepared jump type for a new corridor
    */
   getCorridorPreparationJumpType: function()
   {
      return upro.nav.JumpType.None;
   },

   /**
    * Returns the prepared solar system for a new corridor or null
    * 
    * @return the prepared solar system for a new corridor or null
    */
   getCorridorPreparationSolarSystem: function()
   {
      return null;
   },

   onCorridorPreparationChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.NewCorridorPreparationChanged, null);
   }

});

upro.model.proxies.UserSessionProxy.NAME = "UserSession";
