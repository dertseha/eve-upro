var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');

var UuidFactory = require('../util/UuidFactory.js');
var predefinedGroupTypes = require('../model/PredefinedGroups.js').predefinedGroupTypes;

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

   /**
    * Returns a group object corresponding to the loaded data and ID information.
    * 
    * @returns LocationStatusGroup instance
    */
   this.getGroupFromData = function(data)
   {
      var group = null;
      var interest = this.getInterestForNewGroup(this.groupId);

      if (data)
      {
         group = new LocationStatusGroup(this.documentId, data, interest);
      }
      else
      {
         group = LocationStatusGroup.create(this.character.getCharacterId(), this.groupId, interest);
      }

      return group;
   };

   /**
    * Returns the interest for given group ID. Checks whether the ID is a predefined one, relating to common bodies.
    * 
    * @returns an array of interest for the group.
    */
   this.getInterestForNewGroup = function(groupId)
   {
      var interest = null;
      var predefinedType = predefinedGroupTypes[groupId];

      if (predefinedType)
      {
         var idGetter = this.character['get' + predefinedType + 'Id'];

         if (idGetter)
         {
            interest = [
            {
               scope: predefinedType,
               id: idGetter.call(this.character)
            } ];
         }
      }

      return interest;
   };

   this.getNextState = function(group)
   {
      return new ConfirmingLocationStatusGroupState(this.service, this.character, group);
   };
}
util.inherits(LoadingLocationStatusGroupState, LocationStatusGroupState);

module.exports = LoadingLocationStatusGroupState;
