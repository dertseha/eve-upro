var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var UuidFactory = require('../util/UuidFactory.js');

var AbstractDataState = require('./AbstractDataState.js');

/**
 * The active data state handles the necessary things regarding sharing and dispatching for a data object
 */
function ActiveDataState(owner, dataObject)
{
   ActiveDataState.super_.call(this, owner);

   this.dataObject = dataObject;

   /**
    * Character state handler
    */
   this.onCharacterSessionAdded = function(character, interest, responseQueue)
   {
      var owner = this.getOwner();

      if (this.dataObject.isInterestForCharacter(character))
      {
         owner.broadcastDataInfo(this.dataObject, interest, responseQueue);
         owner.broadcastDataOwnership(this.dataObject, interest, responseQueue);
      }
      if (this.dataObject.isCharacterOwner(character))
      {
         owner.broadcastDataShare(this.dataObject, interest, responseQueue);
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterGroupMemberAdded = function(groupId, interest)
   {
      var owner = this.getOwner();

      if (this.dataObject.isInterestForGroup(groupId))
      {
         owner.broadcastDataInfo(this.dataObject, interest);
         owner.broadcastDataOwnership(this.dataObject, interest);
      }
      if (this.dataObject.isGroupOwner(groupId))
      {
         owner.broadcastDataShare(this.dataObject, interest);
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterGroupMemberRemoved = function(character, groupId, interest)
   {
      var owner = this.getOwner();

      if (this.dataObject.isGroupOwner(groupId) && !this.dataObject.isCharacterOwner(character))
      {
         owner.broadcastDataShareReset(this.dataObject, interest);
      }
      if (this.dataObject.isInterestForGroup(groupId) && !this.dataObject.isInterestForCharacter(character))
      {
         owner.broadcastDataInfoReset(this.dataObject, interest);
      }
   };

   /**
    * Broadcast handler
    */
   this.onBroadcast = function(message)
   {
      var owner = this.getOwner();
      var handler = owner['process' + message.header.type];

      handler.call(owner, this.dataObject, message.characterId, message.body);
   };

   /**
    * Requests to activate the state: Set it active at the owner and perform initial tasks
    */
   this.activate = function()
   {
      var owner = this.getOwner();
      var dataInterest = this.dataObject.getDataInterest();

      owner.setDataState(this.dataObject.getDocumentId(), this);

      owner.broadcastDataInfo(this.dataObject, dataInterest);
      owner.broadcastDataOwnership(this.dataObject, dataInterest);
      owner.broadcastDataShare(this.dataObject, this.dataObject.getOwnerInterest());
   };

   this.addShare = function(interest)
   {
      if (this.dataObject.addShare(interest))
      {
         var owner = this.getOwner();

         this.dataObject.saveToStorage(owner.getStorage());

         owner.broadcastDataInfo(this.dataObject, [ interest ]);
         owner.broadcastDataOwnership(this.dataObject, [ interest ]);
      }
   };

   this.removeShare = function(interest)
   {
      if (this.dataObject.removeShare(interest))
      {
         var owner = this.getOwner();

         this.dataObject.saveToStorage(owner.getStorage());
         owner.broadcastDataInfoReset(this.dataObject, [ interest ]);
      }
   };

   this.addOwner = function(interest)
   {
      if (this.dataObject.addOwner(interest))
      {
         var owner = this.getOwner();

         if (this.dataObject.addShare(interest))
         {
            owner.broadcastDataInfo(this.dataObject, [ interest ]);
         }
         this.dataObject.saveToStorage(owner.getStorage());
         owner.broadcastDataOwnership(this.dataObject, this.dataObject.getDataInterest());
         owner.broadcastDataShare(this.dataObject, [ interest ]);
      }
   };

   this.removeOwner = function(interest)
   {
      if (this.dataObject.removeOwner(interest))
      {
         var owner = this.getOwner();

         owner.broadcastDataOwnershipReset(this.dataObject, [ interest ]);
         if (dataObject.hasOwner())
         {
            this.dataObject.saveToStorage(owner.getStorage());
            owner.broadcastDataOwnership(this.dataObject, this.dataObject.getDataInterest());
         }
         else
         {
            this.dataObject.deleteFromStorage(owner.getStorage());
            owner.broadcastDataInfoReset(this.dataObject, this.dataObject.getDataInterest());

            owner.setDataState(this.dataObject.getDocumentId(), null);
         }
      }
   };
}
util.inherits(ActiveDataState, AbstractDataState);

module.exports = ActiveDataState;
