var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');

var busMessages = require('../model/BusMessages.js');

var StandardDataBroadcaster = require('../abstract-sharing-component/StandardDataBroadcaster.js');

/**
 * The state factory for group specific tasks
 */
function GroupDataBroadcaster(broadcaster, dataName)
{
   GroupDataBroadcaster.super_.call(this, broadcaster, dataName);

   /**
    * Broadcasts destroyed status of a group
    * 
    * @param groupId the ID of the group
    */
   this.broadcastGroupDestroyed = function(groupId)
   {
      var header =
      {
         type: busMessages.Broadcasts.GroupDestroyed.name,
      };
      var body =
      {
         groupId: groupId
      };

      this.broadcaster.broadcast(header, body);
   };

   this.broadcastGroupMembership = function(dataObject, addedMembers, removedMembers, interest, queueName)
   {
      var header =
      {
         type: busMessages.Broadcasts.GroupMembership.name,
         interest: interest || [
         {
            scope: 'Group',
            id: dataObject.getDocumentId()
         } ]
      };
      var body =
      {
         groupId: dataObject.getDocumentId(),
         removed:
         {
            members: removedMembers
         },
         added:
         {
            members: addedMembers
         }
      };

      this.broadcaster.broadcast(header, body, queueName);
   };

   this.broadcastGroupOwnerRejectsSharedObject = function(characterId, objectType, id, groups)
   {
      var header =
      {
         type: busMessages.Broadcasts.GroupOwnerRejectsSharedDataObject.name,
         characterId: characterId
      };
      var body =
      {
         objectType: objectType,
         id: id,
         groups: groups
      };

      this.broadcaster.broadcast(header, body);
   };

   this.broadcastGroupBannedList = function(dataObject, interest, queueName)
   {
      var header =
      {
         type: busMessages.Broadcasts.GroupBannedList.name,
         interest: interest
      };
      var body =
      {
         id: dataObject.getDocumentId(),
         characters: dataObject.getBlackList()
      };

      this.broadcaster.broadcast(header, body, queueName);
   };

   this.broadcastGroupBannedListReset = function(dataObject, interest, disinterest)
   {
      var header =
      {
         type: busMessages.Broadcasts.GroupBannedList.name,
         interest: interest,
         disinterest: disinterest || dataObject.getOwnerInterest()
      };
      var body =
      {
         id: dataObject.getDocumentId(),
         characters: []
      };

      this.broadcaster.broadcast(header, body);
   };

   this.broadcastGroupBannedStatus = function(dataObject, banned, interest, queueName)
   {
      var header =
      {
         type: busMessages.Broadcasts.GroupBannedStatus.name,
         interest: interest
      };
      var body =
      {
         id: dataObject.getDocumentId(),
         banned: banned
      };

      this.broadcaster.broadcast(header, body, queueName);
   };
}
util.inherits(GroupDataBroadcaster, StandardDataBroadcaster);

module.exports = GroupDataBroadcaster;
