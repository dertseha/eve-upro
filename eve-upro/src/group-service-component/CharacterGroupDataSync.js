var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var UuidFactory = require('../util/UuidFactory.js');

var busMessages = require('../model/BusMessages.js');

/**
 * The data sync state is for notifying the system which groups a character is in after getting online. See description
 * at message definition of CharacterGroupDataSyncState.
 * 
 * @param broadcaster the broadcaster interface to use for the messages
 * @param characterId for which character this sync state is
 */
function CharacterGroupDataSync(broadcaster, characterId)
{
   this.id = UuidFactory.v4();

   this.broadcaster = broadcaster;
   this.characterId = characterId;
   this.pendingGroupIds = [];
   this.pendingListFinished = false;

   /**
    * @returns string presentation for logs
    */
   this.toString = function()
   {
      return this.id;
   };

   /**
    * @returns the id of the sync state
    */
   this.getId = function()
   {
      return this.id;
   };

   /**
    * Adds given group ID to the list of pending.
    */
   this.addPendingGroup = function(groupId)
   {
      this.pendingGroupIds.push(groupId);
   };

   /**
    * Called when there will be no more pending groups.
    */
   this.finishPendingGroupList = function()
   {
      this.pendingListFinished = true;
      this.updateOnChange();
   };

   /**
    * Called for a pending group when it has been loaded.
    */
   this.onPendingGroupLoaded = function(groupId)
   {
      var index = this.pendingGroupIds.indexOf(groupId);

      if (index >= 0)
      {
         var part1 = this.pendingGroupIds.slice(0, index);
         var part2 = this.pendingGroupIds.slice(index + 1);

         this.pendingGroupIds = part1.concat(part2);
         this.updateOnChange();
      }
   };

   /**
    * Called when either the pending list was finished or a pending group was loaded. Will send the finished message if
    * all is done.
    */
   this.updateOnChange = function()
   {
      if ((this.pendingGroupIds.length == 0) && this.pendingListFinished)
      {
         this.broadcastStateMessage(true);
      }
   };

   /**
    * Broadcasts the state message for this sync state
    */
   this.broadcastStateMessage = function(finished)
   {
      var header =
      {
         type: busMessages.Broadcasts.CharacterGroupDataSyncState.name,
      };
      var body =
      {
         characterId: this.characterId,
         syncId: this.id,
         finished: finished
      };

      this.broadcaster.broadcast(header, body);
   };
};

module.exports = CharacterGroupDataSync;
