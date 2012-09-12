var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var UuidFactory = require('../util/UuidFactory.js');
var Component = require('../components/Component.js');
var busMessages = require('../model/BusMessages.js');

var AbstractDataObject = require('./AbstractDataObject.js');
var StandardDataBroadcaster = require('./StandardDataBroadcaster.js');
var LoadingDataState = require('./LoadingDataState.js');

function AbstractSharingComponent(services, dataObjectConstructor, dataBaseName)
{
   AbstractSharingComponent.super_.call(this);

   this.amqp = services['amqp'];
   this.mongodb = services['mongodb'];
   this.characterAgent = services['character-agent'];

   this.dataStatesById = {};
   this.dataObjectConstructor = dataObjectConstructor;
   this.broadcaster = new StandardDataBroadcaster(this.amqp, dataBaseName);

   /** {@inheritDoc} */
   this.start = function()
   {
      var self = this;

      this.registerCharacterHandler('CharacterOnline', '');
      this.registerCharacterHandler('CharacterOffline', '');
      this.registerCharacterHandler('SessionAdded', 'Character');
      this.registerCharacterHandler('CharacterGroupMemberAdded', '');
      this.registerCharacterHandler('CharacterGroupMemberRemoved', '');

      var index = [];

      AbstractDataObject.Scopes.forEach(function(scope)
      {
         index.push('data.owner.list' + scope);
         index.push('data.shares.list' + scope);
      });

      this.mongodb.defineCollection(this.dataObjectConstructor.CollectionName, index, function()
      {
         self.onStarted();
      });
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

      this.amqp.on('broadcast:' + broadcastName, function(header, body)
      {
         handler.call(self, header, body);
      });
   };

   this.ensureDataState = function(documentId)
   {
      var state = this.dataStatesById[documentId];

      if (!state)
      {
         state = new LoadingDataState(this, this.dataObjectConstructor, documentId);
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

      for ( var documentId in this.dataStatesById)
      {
         var state = this.dataStatesById[documentId];

         state.onCharacterSessionAdded(character, interest, responseQueue);
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterOffline = function(character)
   {
      // TODO: check whether a data object is still needed, remove otherwise
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

      for ( var documentId in this.dataStatesById)
      {
         var state = this.dataStatesById[documentId];

         state.onCharacterGroupMemberAdded(groupId, interest);
      }
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

      for ( var documentId in this.dataStatesById)
      {
         var state = this.dataStatesById[documentId];

         state.onCharacterGroupMemberRemoved(groupId, interest);
      }
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
    * @returns a new instance of a data object
    */
   this.createDataObject = function(documentId, initData)
   {
      return new this.dataObjectConstructor(documentId, initData);
   };
}
util.inherits(AbstractSharingComponent, Component);

module.exports = AbstractSharingComponent;
