/**
 * A service data processing state handles group specific requests/states
 */
function GroupDataProcessingState()
{
   /**
    * Called for groups that are accessed for a character
    */
   this.registerSyncState = function(dataSync)
   {

   };

   /**
    * Character state handler
    */
   this.onCharacterSessionAdded = function(character, interest, responseQueue)
   {

   };

   /**
    * Broadcast handler
    */
   this.processBroadcast = function(characterId, header, body)
   {

   };
}

module.exports = GroupDataProcessingState;
