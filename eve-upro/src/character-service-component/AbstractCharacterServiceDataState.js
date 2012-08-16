function AbstractCharacterServiceDataState(character, service)
{
   this.character = character;
   this.service = service;

   this.rawData =
   {
      activeGalaxyId: null,
      ignoredSolarSystems: []
   };

   /**
    * Activates the state
    */
   this.activate = function()
   {

   };

   /**
    * Character state handler
    */
   this.onCharacterSessionAdded = function(sessionId)
   {

   };

   /**
    * Broadcast handler
    */
   this.onBroadcastClientRequestSetActiveGalaxy = function(header, body)
   {

   };

   /**
    * Broadcast handler
    */
   this.onBroadcastClientRequestSetIgnoredSolarSystem = function(header, body)
   {

   };
}

module.exports = AbstractCharacterServiceDataState;
