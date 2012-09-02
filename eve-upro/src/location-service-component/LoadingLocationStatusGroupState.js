var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var UuidFactory = require('../util/UuidFactory.js');

var LocationStatusGroup = require('./LocationStatusGroup.js');
var LocationStatusGroupState = require('./LocationStatusGroupState.js');
var ConfirmingLocationStatusGroupState = require('./ConfirmingLocationStatusGroupState.js');

function LoadingLocationStatusGroupState(service, character, groupId, documentId)
{
   this.service = service;
   this.character = character;
   this.groupId = groupId;
   this.documentId = documentId;

   this.broadcastQueue = [];

   /** {@inheritDoc} */
   this.activate = function()
   {
      var self = this;
      var filter =
      {
         _id: UuidFactory.toMongoId(this.documentId)
      };
      var firstDataReturned = false;

      this.service.setGroupState(this.character, this.groupId, this);

      this.service.mongodb.getData(LocationStatusGroup.CollectionName, filter, function(err, id, data)
      {
         if (!firstDataReturned)
         {
            self.onFirstDataResult(data);
            firstDataReturned = true;
         }
      });
   };

   /** {@inheritDoc} */
   this.onCharacterGroupSyncFinished = function()
   {
      // ignored, can't handle it as long as not loaded
   };

   /** {@inheritDoc} */
   this.onCharacterSessionAdded = function(interest, responseQueue)
   {
      // ignored, nothing to send here
   };

   /** {@inheritDoc} */
   this.processBroadcast = function(header, body)
   {
      var broadcast =
      {
         header: header,
         body: body
      };

      this.broadcastQueue.push(broadcast);
   };

   /** {@inheritDoc} */
   this.addInterest = function(interestList)
   {
      return interestList;
   };

   this.onFirstDataResult = function(data)
   {
      if (data && !LocationStatusGroup.documentIsValid(data))
      {
         logger.warn('DB data of location status group with ID ' + this.groupId
               + 'is not valid according to schema. Deleting.');
         LocationStatusGroup.erase(this.service.mongodb, this.documentId);
         data = null;
      }

      var group = this.getGroupFromData(data);
      var nextState = this.getNextState(group);

      nextState = nextState.activate();

      this.broadcastQueue.forEach(function(broadcast)
      {
         nextState.processBroadcast(broadcast.characterId, broadcast.header, broadcast.body);
      });
   };

   this.getGroupFromData = function(data)
   {
      var group = null;

      if (data)
      {
         group = new LocationStatusGroup(this.documentId, data);
      }
      else
      {
         group = LocationStatusGroup.create(this.character.getCharacterId(), this.groupId);
      }

      return group;
   };

   this.getNextState = function(group)
   {
      return new ConfirmingLocationStatusGroupState(this.service, this.character, group);
   };
}
util.inherits(LoadingLocationStatusGroupState, LocationStatusGroupState);

module.exports = LoadingLocationStatusGroupState;
