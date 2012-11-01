var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');

var UuidFactory = require('../util/UuidFactory.js');
var Functional = require('../util/Functional.js');
var Component = require('../components/Component.js');
var busMessages = require('../model/BusMessages.js');

var AbstractDataObject = require('./AbstractDataObject.js');
var StandardDataBroadcaster = require('./StandardDataBroadcaster.js');
var DataStateFactory = require('./DataStateFactory.js');
var InterestFilter = require('./InterestFilter.js');

function AbstractSharingComponent(services, dataObjectConstructor, objectTypeBaseName)
{
   AbstractSharingComponent.super_.call(this);

   this.msgBus = services['msgBus'];
   this.mongodb = services['mongodb'];
   this.characterAgent = services['character-agent'];

   this.dataStatesById = {};
   this.dataObjectConstructor = dataObjectConstructor;
   this.broadcaster = new StandardDataBroadcaster(this.msgBus, objectTypeBaseName);
   this.dataStateFactory = new DataStateFactory(this);

   /** {@inheritDoc} */
   this.start = function()
   {
      var self = this;

      this.registerCharacterHandler('CharacterOnline', '');
      this.registerCharacterHandler('CharacterOffline', '');
      this.registerCharacterHandler('SessionAdded', 'Character');
      this.registerCharacterHandler('CharacterGroupMemberAdded', '');
      this.registerCharacterHandler('CharacterGroupMemberRemoved', '');

      this.registerBroadcastHandler(busMessages.Broadcasts.GroupDestroyed.name);
      this.registerBroadcastHandler(busMessages.Broadcasts.ClientRequestRejectSharedObject.name);
      this.registerBroadcastHandler(busMessages.Broadcasts.GroupOwnerRejectsSharedDataObject.name);

      var index = dataObjectConstructor.addIndexDefinitions([]);

      this.mongodb.defineCollection(this.dataObjectConstructor.CollectionName, index, function()
      {
         self.onStarted();
      });
   };

   /**
    * Filters the given interest according to given character
    */
   this.filterInterestByCharacter = function(interest, character)
   {
      return interest.filter(InterestFilter.filterFunctionForCharacter(character));
   };

   /**
    * Iterates through all existing data states and calls given callback
    */
   this.forEachDataState = function(callback)
   {
      for ( var documentId in this.dataStatesById)
      {
         var state = this.dataStatesById[documentId];

         callback(state);
      }
   };

   this.registerCharacterHandler = function(eventName, infix)
   {
      var self = this;

      this.characterAgent.on(eventName, function()
      {
         var handler = self['on' + infix + eventName];

         handler.apply(self, arguments);
      });
   };

   this.registerBroadcastHandler = function(broadcastName)
   {
      var self = this;
      var handler = this['onBroadcast' + broadcastName];

      this.msgBus.on('broadcast:' + broadcastName, function(header, body)
      {
         handler.call(self, header, body);
      });
   };

   /**
    * Registers a broadcast handler that is meant for a data object. Must have an 'id' field in the body.
    */
   this.registerDataBroadcastHandler = function(broadcastName)
   {
      var self = this;

      this.msgBus.on('broadcast:' + broadcastName, function(header, body)
      {
         self.onDataBroadcast(header, body);
      });
   };

   /**
    * Broadcast handler for data
    */
   this.onDataBroadcast = function(header, body)
   {
      var characterId = header.characterId;

      if (!characterId)
      {
         var character = this.characterAgent.getCharacterBySession(header.sessionId);

         if (character)
         {
            characterId = character.getCharacterId();
         }
      }
      if (characterId)
      {
         var state = this.ensureDataState(body.id);
         var message =
         {
            characterId: characterId,
            header: header,
            body: body
         };

         state.onBroadcast(message);
      }
   };

   this.onBroadcastGroupDestroyed = function(header, body)
   {
      var documentIds = [];
      var self = this;
      var interest = [
      {
         scope: 'Group',
         id: body.groupId
      } ];

      for ( var documentId in this.dataStatesById)
      {
         documentIds.push(documentId);
      }
      documentIds.forEach(function(documentId)
      {
         var dataState = self.dataStatesById[documentId];

         dataState.onGroupDestroyed(interest);
      });
   };

   this.onBroadcastClientRequestRejectSharedObject = function(header, body)
   {
      if (body.objectType === objectTypeBaseName)
      {
         this.onDataBroadcast(header, body);
      }
   };

   this.onBroadcastGroupOwnerRejectsSharedDataObject = function(header, body)
   {
      if (body.objectType === objectTypeBaseName)
      {
         this.onDataBroadcast(header, body);
      }
   };

   this.ensureDataState = function(documentId)
   {
      var state = this.dataStatesById[documentId];

      if (!state)
      {
         state = this.getDataStateFactory().createLoadingDataState(documentId);
         state.activate();
      }

      return state;
   };

   this.setDataState = function(documentId, state)
   {
      if (state)
      {
         this.dataStatesById[documentId] = state;
      }
      else
      {
         delete this.dataStatesById[documentId];
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterOnline = function(character)
   {
      this.searchObjects('Character', character.getCharacterId());
      this.searchObjects('Corporation', character.getCorporationId());

      if (character.isInAlliance())
      {
         this.searchObjects('Alliance', character.getAllianceId());
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterSessionAdded = function(character, sessionId)
   {
      var responseQueue = character.getResponseQueue(sessionId);
      var interest = [
      {
         scope: 'Session',
         id: sessionId
      } ];

      this.forEachDataState(function(state)
      {
         state.onCharacterSessionAdded(character, interest, responseQueue);
      });
   };

   /**
    * Character state handler. Removes all references to shared objects that are not needed by any remaining character.
    */
   this.onCharacterOffline = function(character)
   {
      var candidates = {};
      var inUse;
      var state;

      this.forEachDataState(function(state)
      {
         candidates = state.addIfCharacterHasInterest(candidates, character);
      });
      for ( var documentId in candidates)
      {
         state = candidates[documentId];
         inUse = {};

         this.characterAgent.forEachCharacter(function(existingChar)
         {
            if (existingChar.isGroupSyncFinished())
            {
               inUse = state.addIfCharacterHasInterest(inUse, existingChar);
            }
            else
            { // the character is not yet complete, can't determine whether interest exists
               inUse[documentId] = state;
            }
         });
         if (!inUse[documentId])
         {
            logger.verbose('Shared Object ' + objectTypeBaseName + ' [' + documentId
                  + '] is not referenced anymore. Cleanup.');
            delete this.dataStatesById[documentId];
         }
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterGroupMemberAdded = function(character, groupId)
   {
      var interest = [
      {
         scope: 'Character',
         id: character.getCharacterId()
      } ];

      this.searchObjects('Group', groupId);

      this.forEachDataState(function(state)
      {
         state.onCharacterGroupMemberAdded(groupId, interest);
      });
   };

   /**
    * Character state handler
    */
   this.onCharacterGroupMemberRemoved = function(character, groupId)
   {
      var interest = [
      {
         scope: 'Character',
         id: character.getCharacterId()
      } ];

      this.forEachDataState(function(state)
      {
         state.onCharacterGroupMemberRemoved(character, groupId, interest);
      });
   };

   this.searchObjects = function(scope, id)
   {
      var self = this;
      var filter =
      {
         $or: []
      };

      {
         var entry = {};

         entry['data.owner.list' + scope] = id;
         filter['$or'].push(entry);
      }
      {
         var entry = {};

         entry['data.shares.list' + scope] = id;
         filter['$or'].push(entry);
      }

      this.mongodb.getData(this.dataObjectConstructor.CollectionName, filter, function(err, id, data)
      {
         if (id)
         {
            var documentId = UuidFactory.fromMongoId(id);

            self.ensureDataState(documentId);
         }
      },
      {
         _id: true
      });
   };

   /**
    * @returns the storage for the states
    */
   this.getStorage = function()
   {
      return this.mongodb;
   };

   /**
    * @returns the broadcaster
    */
   this.getBroadcaster = function()
   {
      return this.broadcaster;
   };

   /**
    * Sets the broadcaster to use
    */
   this.setBroadcaster = function(broadcaster)
   {
      this.broadcaster = broadcaster;
   };

   /**
    * @returns a new instance of a data object
    */
   this.createDataObject = function(documentId, initData)
   {
      return new this.dataObjectConstructor(documentId, initData);
   };

   /**
    * @returns a factory for data states
    */
   this.getDataStateFactory = function()
   {
      return this.dataStateFactory;
   };

   /**
    * sets the data state factory to use
    */
   this.setDataStateFactory = function(factory)
   {
      this.dataStateFactory = factory;
   };

   /**
    * Broadcast processor
    */
   this.processClientRequestRejectSharedObject = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character)
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];
         var interest = [
         {
            scope: 'Character',
            id: character.getCharacterId()
         },
         {
            scope: 'Corporation',
            id: character.getCorporationId()
         } ];

         if (character.isInAlliance())
         {
            interest.push(
            {
               scope: 'Alliance',
               id: character.getAllianceId()
            });
         }

         logger.info('Character ' + character + ' rejects object ' + state.dataObject);
         state.removeShares(interest);
      }
   };

   this.processGroupOwnerRejectsSharedDataObject = function(dataObject, characterId, body)
   {
      var character = this.characterAgent.getCharacterById(characterId);

      if (character)
      {
         var state = this.dataStatesById[dataObject.getDocumentId()];
         var interest = [];

         body.groups.forEach(function(groupId)
         {
            interest.push(
            {
               scope: 'Group',
               id: groupId
            });
         });
         logger.info('Character ' + character + ' rejects object ' + state.dataObject + ' through ' + interest.length
               + ' groups as owner');
         state.removeShares(interest);
      }
   };

}
util.inherits(AbstractSharingComponent, Component);

module.exports = AbstractSharingComponent;
