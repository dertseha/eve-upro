var util = require('util');

function LocationStatusGroupState()
{
   /**
    * Activation request of the state
    */
   this.activate = function()
   {

   };

   /**
    * Character state handler
    */
   this.onCharacterGroupSyncFinished = function()
   {

   };

   /**
    * Character state handler
    */
   this.onCharacterSessionAdded = function(interest, responseQueue)
   {

   };

   /**
    * Character state handler
    */
   this.onCharacterGroupMemberRemoved = function()
   {

   };

   /**
    * Broadcast handler
    */
   this.processBroadcast = function(header, body)
   {

   };

   /**
    * Adds interest to the given list
    * 
    * @returns the new interest list
    */
   this.addInterest = function(interestList)
   {
      return interestList;
   };
}

module.exports = LocationStatusGroupState;
