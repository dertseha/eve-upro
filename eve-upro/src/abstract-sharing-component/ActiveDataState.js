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
      var broadcaster = owner.getBroadcaster();

      if (this.dataObject.isInterestForCharacter(character))
      {
         broadcaster.broadcastDataInfo(this.dataObject, interest, responseQueue);
         broadcaster.broadcastDataOwnership(this.dataObject, interest, responseQueue);
      }
      if (this.dataObject.isCharacterOwner(character))
      {
         broadcaster.broadcastDataShare(this.dataObject, interest, responseQueue);
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterGroupMemberAdded = function(groupId, interest)
   {
      var owner = this.getOwner();
      var broadcaster = owner.getBroadcaster();

      if (this.dataObject.isInterestForGroup(groupId))
      {
         broadcaster.broadcastDataInfo(this.dataObject, interest);
         broadcaster.broadcastDataOwnership(this.dataObject, interest);
      }
      if (this.dataObject.isGroupOwner(groupId))
      {
         broadcaster.broadcastDataShare(this.dataObject, interest);
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterGroupMemberRemoved = function(character, groupId, interest)
   {
      var owner = this.getOwner();
      var broadcaster = owner.getBroadcaster();

      if (this.dataObject.isGroupOwner(groupId) && !this.dataObject.isCharacterOwner(character))
      {
         broadcaster.broadcastDataShareReset(this.dataObject, interest);
      }
      if (this.dataObject.isInterestForGroup(groupId) && !this.dataObject.isInterestForCharacter(character))
      {
         broadcaster.broadcastDataInfoReset(this.dataObject, interest);
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
      var broadcaster = owner.getBroadcaster();
      var dataInterest = this.dataObject.getDataInterest();

      owner.setDataState(this.dataObject.getDocumentId(), this);

      broadcaster.broadcastDataInfo(this.dataObject, dataInterest);
      broadcaster.broadcastDataOwnership(this.dataObject, dataInterest);
      broadcaster.broadcastDataShare(this.dataObject, this.dataObject.getOwnerInterest());
   };

   this.addShare = function(interest)
   {
      if (this.dataObject.addShare(interest))
      {
         var owner = this.getOwner();
         var broadcaster = owner.getBroadcaster();

         this.dataObject.saveToStorage(owner.getStorage());

         broadcaster.broadcastDataInfo(this.dataObject, [ interest ]);
         broadcaster.broadcastDataOwnership(this.dataObject, [ interest ]);
      }
   };

   this.removeShare = function(interest)
   {
      if (this.dataObject.removeShare(interest))
      {
         var owner = this.getOwner();
         var broadcaster = owner.getBroadcaster();

         this.dataObject.saveToStorage(owner.getStorage());
         broadcaster.broadcastDataInfoReset(this.dataObject, [ interest ]);
      }
   };

   this.addOwner = function(interest)
   {
      if (this.dataObject.addOwner(interest))
      {
         var owner = this.getOwner();
         var broadcaster = owner.getBroadcaster();

         if (this.dataObject.addShare(interest))
         {
            broadcaster.broadcastDataInfo(this.dataObject, [ interest ]);
         }
         this.dataObject.saveToStorage(owner.getStorage());
         broadcaster.broadcastDataOwnership(this.dataObject, this.dataObject.getDataInterest());
         broadcaster.broadcastDataShare(this.dataObject, [ interest ]);
      }
   };

   this.removeOwner = function(interest)
   {
      if (this.dataObject.removeOwner(interest))
      {
         var owner = this.getOwner();
         var broadcaster = owner.getBroadcaster();

         broadcaster.broadcastDataOwnershipReset(this.dataObject, [ interest ]);
         if (dataObject.hasOwner())
         {
            this.dataObject.saveToStorage(owner.getStorage());
            broadcaster.broadcastDataOwnership(this.dataObject, this.dataObject.getDataInterest());
         }
         else
         {
            this.destroy();
         }
      }
   };

   this.destroy = function()
   {
      var owner = this.getOwner();
      var broadcaster = owner.getBroadcaster();

      this.dataObject.deleteFromStorage(owner.getStorage());
      broadcaster.broadcastDataInfoReset(this.dataObject, this.dataObject.getDataInterest(), []);

      owner.setDataState(this.dataObject.getDocumentId(), null);
   };
}
util.inherits(ActiveDataState, AbstractDataState);

module.exports = ActiveDataState;
