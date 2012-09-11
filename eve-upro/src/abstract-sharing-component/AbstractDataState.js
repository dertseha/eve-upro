/**
 * The abstract data processing state handles data object specific requests/states
 */
function AbstractDataState(owner)
{
   this.owner = owner;

   /**
    * @returns the owner of the state
    */
   this.getOwner = function()
   {
      return this.owner;
   };

   /**
    * Character state handler
    */
   this.onCharacterSessionAdded = function(character, interest, responseQueue)
   {

   };

   /**
    * Character state handler
    */
   this.onCharacterGroupMemberAdded = function(groupId, interest)
   {

   };

   /**
    * Character state handler
    */
   this.onCharacterGroupMemberRemoved = function(character, groupId, interest)
   {

   };

   /**
    * Broadcast handler
    */
   this.onBroadcast = function(message)
   {

   };

   /**
    * Requests to activate the state: Set it active at the owner and perform initial tasks
    */
   this.activate = function()
   {

   };
}

module.exports = AbstractDataState;
