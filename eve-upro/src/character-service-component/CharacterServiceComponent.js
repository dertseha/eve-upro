var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var Component = require('../components/Component.js');
var busMessages = require('../model/BusMessages.js');

var CharacterServiceData = require('./CharacterServiceData.js');

/**
 * The character service component handles all single character related information, such as session selection for IGB
 * control or character specific settings.
 * 
 * It is responsible for registering the broadcast and state handler, create an online specific object per character and
 * forward all requests to this object (CharacterServiceData)
 * 
 * @param services the required services
 */
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

      this.registerSessionBroadcastHandler(busMessages.Broadcasts.EveStatusUpdateRequest.name);
      this.registerSessionBroadcastHandler(busMessages.Broadcasts.ClientRequestSetActiveGalaxy.name);
      this.registerSessionBroadcastHandler(busMessages.Broadcasts.ClientRequestSetIgnoredSolarSystem.name);
      this.registerSessionBroadcastHandler(busMessages.Broadcasts.ClientRequestSetRoutingCapabilityJumpGates.name);
      this.registerSessionBroadcastHandler(busMessages.Broadcasts.ClientRequestSetRoutingCapabilityJumpDrive.name);
      this.registerSessionBroadcastHandler(busMessages.Broadcasts.ClientRequestSetRoutingRuleData.name);
      this.registerSessionBroadcastHandler(busMessages.Broadcasts.ClientRequestSetRoutingRuleIndex.name);

      this.mongodb.defineCollection('CharacterData', {}, function()
      {
         self.onStarted();
      });
   };

   /**
    * Registers a session specific broadcast handler for given broadcast name
    */
   this.registerSessionBroadcastHandler = function(broadcastName)
   {
      var self = this;

      this.amqp.on('broadcast:' + broadcastName, function(header, body)
      {
         self.onSessionBroadcast(header, body);
      });
   };

   /**
    * Handles a session specific broadcast and forwards it to the corresponding character service data
    */
   this.onSessionBroadcast = function(header, body)
   {
      var sessionId = header.sessionId;
      var character = this.characterAgent.getCharacterBySession(sessionId);

      if (character)
      {
         var serviceData = character.serviceData['character-service'];
         var handler = serviceData['onBroadcast' + header.type];

         if (!handler)
         {
            handler = serviceData['onBroadcast'];
         }
         handler.call(serviceData, header, body);
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterOnline = function(character)
   {
      var serviceData = new CharacterServiceData(this, character);

      character.serviceData['character-service'] = serviceData;
      logger.info('Character [' + character.characterName + '] is online');

      serviceData.processingState.activate();
   };

   /**
    * Character state handler
    */
   this.onCharacterSessionAdded = function(character, sessionId)
   {
      character.serviceData['character-service'].onCharacterSessionAdded(sessionId);
   };

   /**
    * Character state handler
    */
   this.onCharacterSessionRemoved = function(character, sessionId)
   {
      character.serviceData['character-service'].onCharacterSessionRemoved(sessionId);
   };

   /**
    * Character state handler
    */
   this.onCharacterOffline = function(character)
   {
      logger.info('Character [' + character.characterName + '] is offline');
   };
}
util.inherits(CharacterServiceComponent, Component);

module.exports = CharacterServiceComponent;
