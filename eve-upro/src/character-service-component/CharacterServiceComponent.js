var util = require('util');

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

      this.registerBroadcastHandler(busMessages.Broadcasts.ClientRequestSetActiveGalaxy);

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
         character.serviceData['character-service'].onBroadcastClientRequestSetActiveGalaxy(header, body);
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterOnline = function(character)
   {
      var state = new PendingCharacterServiceDataState(character, this);

      state.activate();
   };

   /**
    * Character state handler
    */
   this.onCharacterSessionAdded = function(character, sessionId)
   {
      character.serviceData['character-service'].onCharacterSessionAdded(sessionId);
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

      this.mongodb.setData('CharacterData', character.getCharacterId(), serviceData.rawData, function()
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
         galaxyId: serviceData.rawData.activeGalaxyId
      };

      this.amqp.broadcast(header, body, queueName);
   };

}
util.inherits(CharacterServiceComponent, Component);

module.exports = CharacterServiceComponent;
