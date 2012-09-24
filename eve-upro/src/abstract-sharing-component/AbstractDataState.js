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

   /**
    * Informing about a dropped group
    */
   this.onGroupDestroyed = function(interest)
   {

   };

   /**
    * If the given character has interest for this group, the state shall add itself to the given object by ID.
    * 
    * @return object containing the sum of given object and the entry
    */
   this.addIfCharacterHasInterest = function(obj, character)
   {
      return obj;
   };
}

module.exports = AbstractDataState;
