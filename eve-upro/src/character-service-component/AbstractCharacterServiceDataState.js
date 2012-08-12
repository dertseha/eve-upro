function AbstractCharacterServiceDataState(character, service)
{
   this.character = character;
   this.service = service;

   this.rawData =
   {
      activeGalaxyId: null
   };

   /**
    * Activates the state
    */
   this.activate = function()
   {

   };

   /**
    * Broadcast handler
    */
   this.onBroadcastClientRequestSetActiveGalaxy = function(header, body)
   {

   };

   /**
    * Character state handler
    */
   this.onCharacterSessionAdded = function(sessionId)
   {

   };
}

module.exports = AbstractCharacterServiceDataState;
