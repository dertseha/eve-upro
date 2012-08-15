/**
 * This class forwards the IGB requests to the actual CCPEVE object
 */
upro.eve.RealInGameBrowser = Class.create(
{
   initialize: function()
   {

   },

   /**
    * Adds a waypoint to the autopilot route using given solar system id
    * 
    * @param solarSystemId the ID of the solar system
    */
   addWaypoint: function(solarSystemId)
   {
      CCPEVE.addWaypoint(solarSystemId);
   },

   /**
    * Clears the autopilot route
    */
   clearAllWaypoints: function()
   {
      CCPEVE.clearAllWaypoints();
   }
});
