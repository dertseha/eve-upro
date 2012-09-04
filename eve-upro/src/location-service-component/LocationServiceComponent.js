var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var Component = require('../components/Component.js');
var busMessages = require('../model/BusMessages.js');
var predefinedGroupIds = require('../model/PredefinedGroups.js').predefinedGroupIds;

var LocationStatusGroup = require('./LocationStatusGroup.js');

var LocationStatusGroup = require('./LocationStatusGroup.js');
var LoadingLocationStatusGroupState = require('./LoadingLocationStatusGroupState.js');

function LocationServiceComponent(services)
{
   LocationServiceComponent.super_.call(this);

   this.amqp = services['amqp'];
   this.mongodb = services['mongodb'];
   this.characterAgent = services['character-agent'];

   /** {@inheritDoc} */
   this.start = function()
   {
      var self = this;

      this.registerCharacterHandler('CharacterOnline', '');
      this.registerCharacterHandler('CharacterOffline', '');
      this.registerCharacterHandler('SessionAdded', 'Character');
      this.registerCharacterHandler('SessionRemoved', 'Character');
      this.registerCharacterHandler('CharacterGroupMemberAdded', '');
      this.registerCharacterHandler('CharacterGroupMemberRemoved', '');
      this.registerCharacterHandler('CharacterGroupSyncFinished', '');

      this.registerBroadcastHandler(busMessages.Broadcasts.EveStatusUpdateRequest.name);

      this.registerGroupBroadcastHandler(busMessages.Broadcasts.ClientRequestModifyCharacterLocationStatusGroup.name);

      this.mongodb.defineCollection(LocationStatusGroup.CollectionName, [ 'data.characterId', 'data.groupId' ],
            function()
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

   this.registerGroupBroadcastHandler = function(broadcastName)
   {
      var self = this;

      this.amqp.on('broadcast:' + broadcastName, function(header, body)
      {
         self.onGroupBroadcast(header, body);
      });
   };

   /**
    * Broadcast handler
    */
   this.onGroupBroadcast = function(header, body)
   {
      var character = this.characterAgent.getCharacterBySession(header.sessionId);

      if (character)
      {
         var state = this.ensureGroupState(character, body.groupId);

         state.processBroadcast(header, body);
      }
   };

   this.ensureGroupStateForPredefined = function(character)
   {
      for ( var groupType in predefinedGroupIds)
      {
         var groupId = predefinedGroupIds[groupType];

         this.ensureGroupState(character, groupId);
      }
   };

   this.ensureGroupState = function(character, groupId)
   {
      var serviceData = character.serviceData['location-service'];
      var state = serviceData.groupStatesById[groupId];

      if (!state)
      {
         state = new LoadingLocationStatusGroupState(this, character, groupId, LocationStatusGroup.getDocumentId(
               character.getCharacterId(), groupId));
         state.activate();
      }

      return state;
   };

   this.setGroupState = function(character, groupId, state)
   {
      if (character.isOnline())
      {
         var serviceData = character.serviceData['location-service'];

         if (state)
         {
            serviceData.groupStatesById[groupId] = state;
         }
         else
         {
            delete serviceData.groupStatesById[groupId];
         }
      }
      else
      {
         logger.info('Character ' + character.toString() + ' has gone offline again, ignoring group state');
      }
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastEveStatusUpdateRequest = function(header, body)
   {
      var character = this.characterAgent.getCharacterBySession(header.sessionId);

      if (character)
      {
         var serviceData = character.serviceData['location-service'];
         var newLocation = body.eveInfo.solarSystemId;

         if (serviceData.lastKnownLocation != newLocation)
         {
            serviceData.lastKnownLocation = newLocation;
            serviceData.locationsBySessionId[header.sessionId] = newLocation;
            this.broadcastLocationStatus(character);
         }
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterOnline = function(character)
   {
      var self = this;
      var characterId = character.getCharacterId();
      var filter =
      {
         "data.characterId": characterId
      };

      character.serviceData['location-service'] =
      {
         lastKnownLocation: null,
         locationsBySessionId: {},
         groupStatesById: {}
      };

      this.ensureGroupStateForPredefined(character);
      this.mongodb.getData(LocationStatusGroup.CollectionName, filter, function(err, id, data)
      {
         if (data)
         {
            self.ensureGroupState(character, data.groupId);
         }
      },
      {
         _id: true,
         'data.groupId': true
      });
   };

   /**
    * Character state handler
    */
   this.onCharacterSessionAdded = function(character, sessionId)
   {
      var serviceData = character.serviceData['location-service'];
      var responseQueue = character.getResponseQueue(sessionId);
      var interest = [
      {
         scope: 'Session',
         id: sessionId
      } ];

      if (serviceData.lastKnownLocation)
      {
         this.broadcastLocationStatus(character, interest, responseQueue);
      }
      for ( var groupId in serviceData.groupStatesById)
      {
         var state = serviceData.groupStatesById[groupId];

         state.onCharacterSessionAdded(interest, responseQueue);
      }
      this.notifyCharacterOfOtherLocations(character, interest, responseQueue);
   };

   /**
    * Character state handler
    */
   this.onCharacterSessionRemoved = function(character, sessionId)
   {
      var serviceData = character.serviceData['location-service'];

      if (serviceData.lastKnownLocation)
      {
         if (serviceData.locationsBySessionId[sessionId])
         {
            var amount = 0;

            delete serviceData.locationsBySessionId[sessionId];
            for (existingId in serviceData.locationsBySessionId)
            {
               amount++;
            }
            if (amount == 0)
            {
               this.onCharacterLocationUnknown(character);
            }
         }
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterOffline = function(character)
   {
      var serviceData = character.serviceData['location-service'];

      if (serviceData.lastKnownLocation)
      {
         this.onCharacterLocationUnknown(character);
      }
   };

   this.onCharacterLocationUnknown = function(character)
   {
      var serviceData = character.serviceData['location-service'];

      serviceData.lastKnownLocation = null;
      this.broadcastLocationStatus(character);
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

      this.ensureGroupState(character, groupId);
      this.notifyCharacterOfOtherLocations(character, interest);
   };

   /**
    * Character state handler
    */
   this.onCharacterGroupMemberRemoved = function(character, groupId)
   {
      var self = this;
      var interest = [
      {
         scope: 'Character',
         id: character.getCharacterId()
      } ];

      // lets this char send undefined to group
      this.ensureGroupState(character, groupId).onCharacterGroupMemberRemoved();

      this.characterAgent.forEachCharacter(function(existingCharacter)
      { // let this character receive undefined from all other characters of this group
         if (character.getCharacterId() != existingCharacter.getCharacterId())
         {
            var existingServiceData = existingCharacter.serviceData['location-service'];
            var existingGroup = existingServiceData.groupStatesById[groupId];

            if (existingServiceData.lastKnownLocation && existingGroup && (existingGroup.addInterest([]).length > 0))
            {
               self.broadcastLocationStatusUndefined(existingCharacter, interest);
            }
         }
      });
   };

   /**
    * Character state handler
    */
   this.onCharacterGroupSyncFinished = function(character)
   {
      var serviceData = character.serviceData['location-service'];

      for ( var groupId in serviceData.groupStatesById)
      {
         var state = serviceData.groupStatesById[groupId];

         state.onCharacterGroupSyncFinished();
      }
   };

   this.notifyCharacterOfOtherLocations = function(character, interest, responseQueue)
   {
      var self = this;

      this.characterAgent.forEachCharacter(function(existingCharacter)
      {
         if (character.getCharacterId() != existingCharacter.getCharacterId())
         {
            var existingServiceData = existingCharacter.serviceData['location-service'];
            var existingInterest = self.getLocationInterest(existingCharacter);

            if (existingServiceData.lastKnownLocation && character.hasInterestIn(existingInterest))
            {
               self.broadcastLocationStatus(existingCharacter, interest, responseQueue);
            }
         }
      });
   };

   /**
    * @param character the character for which the interest is to create
    * @returns the location interest for given character
    */
   this.getLocationInterest = function(character)
   {
      var serviceData = character.serviceData['location-service'];
      var interest = [
      {
         scope: 'Character',
         id: character.getCharacterId()
      } ];

      for ( var groupId in serviceData.groupStatesById)
      {
         interest = serviceData.groupStatesById[groupId].addInterest(interest);
      }

      return interest;
   };

   /**
    * Broadcast the location status of given character
    * 
    * @param character the Character object
    * @param interest the interest for the broadcast message
    * @param queueName optional explicit queue information
    */
   this.broadcastLocationStatus = function(character, interest, queueName)
   {
      var serviceData = character.serviceData['location-service'];
      var header =
      {
         type: busMessages.Broadcasts.CharacterLocationStatus.name,
         interest: interest || this.getLocationInterest(character),
         characterId: character.getCharacterId()
      };
      var body =
      {
         characterInfo: character.getCharacterInfo(),
         solarSystemId: serviceData.lastKnownLocation
      };

      this.amqp.broadcast(header, body, queueName);
   };

   /**
    * Broadcast an undefined location status of given character, used when destinations should no longer receive the
    * information.
    * 
    * @param character the Character object
    * @param interest the explicit interest for the broadcast message
    */
   this.broadcastLocationStatusUndefined = function(character, interest)
   {
      var header =
      {
         type: busMessages.Broadcasts.CharacterLocationStatus.name,
         interest: interest,
         disinterest: this.getLocationInterest(character),
         characterId: character.getCharacterId()
      };
      var body =
      {
         characterInfo: character.getCharacterInfo(),
         solarSystemId: undefined
      };

      this.amqp.broadcast(header, body);
   };
}
util.inherits(LocationServiceComponent, Component);

module.exports = LocationServiceComponent;
