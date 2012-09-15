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

   this.addShares = function(interest)
   {
      var dataInterest = [];
      var self = this;

      interest.forEach(function(entry)
      {
         if (self.dataObject.addShare(entry))
         {
            dataInterest.push(entry);
         }
      });
      if (dataInterest.length > 0)
      {
         var owner = this.getOwner();
         var broadcaster = owner.getBroadcaster();

         this.dataObject.saveToStorage(owner.getStorage());

         broadcaster.broadcastDataInfo(this.dataObject, dataInterest);
         broadcaster.broadcastDataOwnership(this.dataObject, dataInterest);
         broadcaster.broadcastDataShare(this.dataObject, this.dataObject.getOwnerInterest());
      }
   };

   this.removeShares = function(interest)
   {
      var dataInterest = [];
      var self = this;
      var changedOwner = false;

      interest.forEach(function(entry)
      {
         if (self.dataObject.removeShare(entry))
         {
            dataInterest.push(entry);
            if (self.dataObject.removeOwner(entry))
            {
               changedOwner = true;
            }
         }
      });
      if (dataInterest.length > 0)
      {
         var owner = this.getOwner();
         var broadcaster = owner.getBroadcaster();

         this.dataObject.saveToStorage(owner.getStorage());
         broadcaster.broadcastDataInfoReset(this.dataObject, dataInterest);
         if (changedOwner)
         {
            broadcaster.broadcastDataOwnership(this.dataObject, this.dataObject.getDataInterest());
         }
         broadcaster.broadcastDataShare(this.dataObject, this.dataObject.getOwnerInterest());
      }
   };

   this.addOwner = function(interest)
   {
      var owner = this.getOwner();
      var broadcaster = owner.getBroadcaster();
      var ownerInterest = [];
      var dataInterest = [];
      var self = this;

      interest.forEach(function(entry)
      {
         if (self.dataObject.addOwner(entry))
         {
            ownerInterest.push(entry);
            if (self.dataObject.addShare(entry))
            {
               dataInterest.push(entry);
            }
         }
      });
      if (ownerInterest.length > 0)
      {
         if (dataInterest.length > 0)
         {
            broadcaster.broadcastDataInfo(this.dataObject, dataInterest);
         }
         this.dataObject.saveToStorage(owner.getStorage());
         broadcaster.broadcastDataOwnership(this.dataObject, this.dataObject.getDataInterest());
         broadcaster.broadcastDataShare(this.dataObject, this.dataObject.getOwnerInterest());
      }
   };

   this.removeOwner = function(interest)
   {
      var ownerInterest = [];
      var self = this;

      interest.forEach(function(entry)
      {
         if (self.dataObject.removeOwner(entry))
         {
            ownerInterest.push(entry);
         }
      });
      if (ownerInterest.length > 0)
      {
         var owner = this.getOwner();
         var broadcaster = owner.getBroadcaster();

         broadcaster.broadcastDataShareReset(this.dataObject, ownerInterest);
         broadcaster.broadcastDataOwnershipReset(this.dataObject, ownerInterest);
         if (dataObject.hasOwner())
         {
            this.dataObject.saveToStorage(owner.getStorage());
            broadcaster.broadcastDataOwnership(this.dataObject, this.dataObject.getDataInterest());
            broadcaster.broadcastDataShare(this.dataObject, this.dataObject.getOwnerInterest());
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
