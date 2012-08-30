var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var UuidFactory = require('../util/UuidFactory.js');

var Group = require('./Group.js');

var GroupDataProcessingState = require('./GroupDataProcessingState.js');
var ActiveGroupDataProcessingState = require('./ActiveGroupDataProcessingState.js');

function PendingGroupDataProcessingState(service, groupId)
{
   this.service = service;
   this.groupId = groupId;

   this.broadcastQueue = [];

   /** {@inheritDoc} */
   this.onCharacterSessionAdded = function(character, interest, responseQueue)
   {
      // ignored, when the group is loaded, all data is broadcast
   };

   /** {@inheritDoc} */
   this.processBroadcast = function(characterId, header, body)
   {
      var broadcast =
      {
         characterId: characterId,
         header: header,
         body: body
      };

      this.broadcastQueue.push(broadcast);
   };

   /**
    * Starts the state machine
    */
   this.activate = function()
   {
      var self = this;

      this.service.setGroupDataProcessingState(this.groupId, this);
      var filter =
      {
         _id: UuidFactory.toMongoId(this.groupId)
      };
      var firstDataReturned = false;

      this.service.mongodb.getData(Group.CollectionName, filter, function(err, id, data)
      {
         if (!firstDataReturned)
         {
            self.onFirstDataResult(data);
            firstDataReturned = true;
         }
      });
   };

   /**
    * Handler of the first data result from the storage
    * 
    * @param data either null or the raw data
    */
   this.onFirstDataResult = function(data)
   {
      if (data && !Group.documentIsValid(data))
      {
         logger.warn('DB data of group with ID ' + this.groupId + 'is not valid according to schema. Deleting.');
         Group.erase(this.service.mongodb, this.groupId);
         data = null;
      }
      if (data)
      {
         var group = new Group(this.groupId, data);
         var newState = this.getActiveProcessingState(group);

         this.service.broadcastGroupData(group);

         this.broadcastQueue.forEach(function(broadcast)
         {
            newState.processBroadcast(broadcast.characterId, broadcast.header, broadcast.body);
         });

         this.service.setGroupDataProcessingState(this.groupId, newState);
      }
      else
      {
         this.service.setGroupDataProcessingState(this.groupId, null);
      }
   };

   /**
    * Factory method to return the active state
    * 
    * @param group the group for which to create the state
    * @returns the active state that should follow this state
    */
   this.getActiveProcessingState = function(group)
   {
      return new ActiveGroupDataProcessingState(this.service, group);
   };
};
util.inherits(PendingGroupDataProcessingState, GroupDataProcessingState);

module.exports = PendingGroupDataProcessingState;
