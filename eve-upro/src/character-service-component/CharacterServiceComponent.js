var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var Component = require('../components/Component.js');
var busMessages = require('../model/BusMessages.js');

var PendingCharacterServiceDataState = require('./PendingCharacterServiceDataState.js');

function CharacterServiceComponent(services)
{
   CharacterServiceComponent.super_.call(this);

   this.amqp = services['amqp'];
   this.mongodb = services['mongodb'];
   this.characterAgent = services['character-agent'];

   /** {@inheritDoc} */
   this.start = function()
   {
      var self = this;

      this.characterAgent.on('CharacterOnline', function(character)
      {
         self.onCharacterOnline(character);
      });
      this.characterAgent.on('SessionAdded', function(character, sessionId)
      {
         self.onCharacterSessionAdded(character, sessionId);
      });
      this.characterAgent.on('SessionRemoved', function(character, sessionId)
      {
         self.onCharacterSessionRemoved(character, sessionId);
      });
      this.characterAgent.on('CharacterOffline', function(character)
      {
         self.onCharacterOffline(character);
      });

      this.registerBroadcastHandler(busMessages.Broadcasts.ClientRequestSetActiveGalaxy);
      this.registerBroadcastHandler(busMessages.Broadcasts.EveStatusUpdateRequest);

      this.mongodb.defineCollection('CharacterData', {}, function()
      {
         self.onStarted();
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

   /**
    * Broadcast handler
    */
   this.onBroadcastClientRequestSetActiveGalaxy = function(header, body)
   {
      var character = this.characterAgent.getCharacterBySession(header.sessionId);

      if (character)
      {
         character.serviceData['character-service'].dataState.onBroadcastClientRequestSetActiveGalaxy(header, body);
      }
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastEveStatusUpdateRequest = function(header, body)
   {
      var sessionId = header.sessionId;
      var character = this.characterAgent.getCharacterBySession(sessionId);

      if (character)
      {
         var serviceData = character.serviceData['character-service'];

         if (!serviceData.igbSessions[sessionId])
         {
            var session =
            {
               activeControl: false
            };

            logger.info('Detected IGB session: [' + sessionId + '] for character [' + character.characterName + ']');
            serviceData.igbSessions[sessionId] = session;
            this.updateIgbSessionControl(character);
         }
      }
   };

   /**
    * Updates the currently active IGB session if one is missing.
    */
   this.updateIgbSessionControl = function(character)
   {
      var serviceData = character.serviceData['character-service'];
      var selectedSessionId = null;
      var activeSessionId = null;

      for ( var sessionId in serviceData.igbSessions)
      {
         var session = serviceData.igbSessions[sessionId];

         if (session.activeControl)
         {
            activeSessionId = sessionId;
         }
         else
         {
            selectedSessionId = sessionId;
         }
      }
      if (!activeSessionId && selectedSessionId)
      {
         var responseQueue = character.getResponseQueue(sessionId);
         var interest = [
         {
            scope: 'Session',
            id: selectedSessionId
         } ];

         logger.info('Selecting IGB control session: [' + selectedSessionId + '] for character ['
               + character.characterName + ']');
         serviceData.igbSessions[selectedSessionId].activeControl = true;
         this.broadcastCharacterClientControlSelection(character, this.getInterest(character), false);
         this.broadcastCharacterClientControlSelection(character, interest, true, responseQueue);
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterOnline = function(character)
   {
      var state = new PendingCharacterServiceDataState(character, this);

      logger.info('Character [' + character.characterName + '] is online');
      character.serviceData['character-service'] =
      {
         igbSessions: {},
         dataState: null
      };
      state.activate();
   };

   /**
    * Character state handler
    */
   this.onCharacterSessionAdded = function(character, sessionId)
   {
      character.serviceData['character-service'].dataState.onCharacterSessionAdded(sessionId);
   };

   /**
    * Character state handler
    */
   this.onCharacterSessionRemoved = function(character, sessionId)
   {
      var serviceData = character.serviceData['character-service'];
      var session = serviceData.igbSessions[sessionId];

      if (session)
      {
         delete serviceData.igbSessions[sessionId];
         if (session.activeControl)
         {
            this.updateIgbSessionControl(character);
         }
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterOffline = function(character)
   {
      logger.info('Character [' + character.characterName + '] is offline');
   };

   /**
    * @param character the character for which the interest is to create
    * @returns the generic interest for given character (typically only the character itself)
    */
   this.getInterest = function(character)
   {
      var interest = [
      {
         scope: 'Character',
         id: character.getCharacterId()
      } ];

      return interest;
   };

   /**
    * Saves the character data of given character object
    * 
    * @param character the Character object
    */
   this.saveCharacterData = function(character)
   {
      var serviceData = character.serviceData['character-service'];

      this.mongodb.setData('CharacterData', character.getCharacterId(), serviceData.dataState.rawData, function()
      {
      });
   };

   /**
    * Broadcast the active galaxy of given character
    * 
    * @param character the Character object
    * @param interest the interest for the broadcast message
    * @param queueName optional explicit queue information
    */
   this.broadcastActiveGalaxy = function(character, interest, queueName)
   {
      var serviceData = character.serviceData['character-service'];

      var header =
      {
         type: busMessages.Broadcasts.CharacterActiveGalaxy,
         interest: interest
      };
      var body =
      {
         galaxyId: serviceData.dataState.rawData.activeGalaxyId
      };

      this.amqp.broadcast(header, body, queueName);
   };

   /**
    * Broadcast the client control selection
    * 
    * @param character the Character object
    * @param interest the interest for the broadcast message
    * @param queueName optional explicit queue information
    */
   this.broadcastCharacterClientControlSelection = function(character, interest, active, queueName)
   {
      var header =
      {
         type: busMessages.Broadcasts.CharacterClientControlSelection,
         interest: interest
      };
      var body =
      {
         active: active
      };

      this.amqp.broadcast(header, body, queueName);
   };
}
util.inherits(CharacterServiceComponent, Component);

module.exports = CharacterServiceComponent;
