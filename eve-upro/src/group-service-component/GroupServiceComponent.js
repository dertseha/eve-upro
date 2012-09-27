var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');

var UuidFactory = require('../util/UuidFactory.js');
var busMessages = require('../model/BusMessages.js');

var AbstractSharingComponent = require('../abstract-sharing-component/AbstractSharingComponent.js');

var CharacterGroupDataSync = require('./CharacterGroupDataSync.js');

var GroupDataObject = require('./GroupDataObject.js');
var GroupDataStateFactory = require('./GroupDataStateFactory.js');
var GroupDataBroadcaster = require('./GroupDataBroadcaster.js');

function GroupServiceComponent(services)
{
   GroupServiceComponent.super_.call(this, services, GroupDataObject, 'Group');

   this.setBroadcaster(new GroupDataBroadcaster(this.amqp, 'Group'));

   var superStart = this.start;
   var superSetDataState = this.setDataState;
   var superOnBroadcastClientRequestRejectSharedObject = this.onBroadcastClientRequestRejectSharedObject;

   /** {@inheritDoc} */
   this.start = function()
   {
      var self = this;

      superStart.call(this);

      this.setDataStateFactory(new GroupDataStateFactory(this));

      this.registerCharacterHandler('CharacterGroupSyncFinished', '');

      this.amqp.on('broadcast', function(header, body)
      {
         self.onBroadcast(header, body);
      });

      this.registerBroadcastHandler(busMessages.Broadcasts.ClientRequestCreateGroup.name);

      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestUpdateGroup.name);
      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestDestroyGroup.name);

      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestAddGroupOwner.name);
      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestRemoveGroupOwner.name);
      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestAddGroupShares.name);
      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestRemoveGroupShares.name);

      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestJoinGroup.name);
      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestLeaveGroup.name);

      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestBanGroupMembers.name);
      this.registerDataBroadcastHandler(busMessages.Broadcasts.ClientRequestUnbanGroupMembers.name);
   };

   this.forEachSynchronizedCharacter = function(callback)
   {
      this.characterAgent.forEachCharacter(function(character)
      {
         if (character.isGroupSyncFinished())
         {
            callback(character);
         }
      });
   };

   this.cleanMemberListsOfCharacter = function(character)
   {
      var broadcaster = this.getBroadcaster();
      var storage = this.getStorage();
      var removed = [ character.getCharacterId() ];

      this.forEachDataState(function(state)
      {
         if (state.removeMemberIfNotInterest(character))
         {
            state.dataObject.saveToStorage(storage);
            broadcaster.broadcastGroupMembership(state.dataObject, [], removed);
         }
      });
   };

   this.superOnCharacterOnline = this.onCharacterOnline;

   /**
    * Character state handler
    */
   this.onCharacterOnline = function(character)
   {
      var characterId = character.getCharacterId();
      var syncState = new CharacterGroupDataSync(this.amqp, characterId);
      var filter =
      {
         "data.members": characterId
      };
      var self = this;

      this.superOnCharacterOnline(character);

      syncState.broadcastStateMessage(false);
      this.mongodb.getData(GroupDataObject.CollectionName, filter, function(err, id, data)
      {
         if (id)
         {
            var groupId = UuidFactory.fromMongoId(id);

            syncState.addPendingGroup(groupId);
            var state = self.ensureDataState(groupId);
            state.registerSyncState(syncState);
         }
         else
         {
            syncState.finishPendingGroupList();
         }
      },
      {
         _id: true
      });
   };

   this.onCharacterGroupSyncFinished = function(character)
   {
      this.cleanMemberListsOfCharacter(character);
   };

   this.setDataState = function(documentId, state)
   {
      superSetDataState.call(this, documentId, state);

      if (!state)
      {
         logger.info("Groups " + documentId + " destroyed (might occur several times because of late broadcasts)");
         this.getBroadcaster().broadcastGroupDestroyed(documentId);
      }
   };

   /**
    * Broadcast handler
    */
   this.onBroadcast = function(header, body)
   {
      this.verifyGroupExistenceFromInterest(header.interest);
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastClientRequestRejectSharedObject = function(header, body)
   {
      var character = this.characterAgent.getCharacterBySession(header.sessionId);

      superOnBroadcastClientRequestRejectSharedObject.call(this, header, body);

      if (character)
      {
         var idList = [];

         this.forEachDataState(function(state)
         {
            idList = state.addGroupIdIfCharacterIsOwner(idList, character);
         });

         if (idList.length > 0)
         {
            this.getBroadcaster().broadcastGroupOwnerRejectsSharedObject(character.getCharacterId(), body.objectType,
                  body.id, idList);
         }
      }
   };

   this.verifyGroupExistenceFromInterest = function(interestList)
   {
      if (interestList)
      {
         var self = this;

         interestList.forEach(function(interest)
         {
            if (interest.scope == 'Group')
            {
               self.ensureDataState(interest.id);
            }
         });
      }
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastClientRequestCreateGroup = function(header, body)
   {
      var character = this.characterAgent.getCharacterBySession(header.sessionId);

      if (character)
      {
         var id = UuidFactory.v4();
         var initData =
         {
            group: body.data
         };
         var state = this.getDataStateFactory().createActiveDataState(new GroupDataObject(id, initData));
         var interest = [
         {
            scope: 'Character',
            id: character.getCharacterId()
         } ];

         logger.info('Character ' + character.toString() + ' creating group');
         state.activate();
         state.addOwner(interest);
         state.addMember(character);
      }
   };

   /**
    * Broadcast processor
    */
   this.processClientRequestUpdateGroup = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isCharacterOwner(character) && dataObject.updateData(body.data))
      {
         dataObject.saveToStorage(this.getStorage());
         this.getBroadcaster().broadcastDataInfo(dataObject, dataObject.getDataInterest());
      }
   };

   /**
    * Broadcast processor
    */
   this.processClientRequestDestroyGroup = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isCharacterOwner(character))
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];

         state.destroy();
      }
   };

   /**
    * Broadcast processor
    */
   this.processClientRequestAddGroupOwner = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isCharacterOwner(character))
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];

         state.addOwner(body.interest);
      }
   };

   /**
    * Broadcast processor
    */
   this.processClientRequestRemoveGroupOwner = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isCharacterOwner(character))
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];

         state.removeOwner(body.interest);
      }
   };

   /**
    * Broadcast processor
    */
   this.processClientRequestAddGroupShares = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isCharacterOwner(character))
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];

         state.addShares(body.interest);
      }
   };

   /**
    * Broadcast processor
    */
   this.processClientRequestRemoveGroupShares = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isCharacterOwner(character))
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];

         state.removeShares(body.interest);
      }
   };

   /**
    * Broadcast processor
    */
   this.processClientRequestJoinGroup = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isInterestForCharacter(character) && !dataObject.isCharacterBlackListed(character))
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];

         state.addMember(character);
      }
   };

   /**
    * Broadcast processor
    */
   this.processClientRequestLeaveGroup = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character)
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];

         state.removeMembers([ character.getCharacterId() ]);
      }
   };

   /**
    * Broadcast processor
    */
   this.processClientRequestBanGroupMembers = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isCharacterOwner(character))
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];

         state.banMembers(body.characters);
      }
   };

   /**
    * Broadcast processor
    */
   this.processClientRequestUnbanGroupMembers = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character && dataObject.isCharacterOwner(character))
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];

         state.unbanMembers(body.characters);
      }
   };
}
util.inherits(GroupServiceComponent, AbstractSharingComponent);

module.exports = GroupServiceComponent;
