var util = require('util');

var UuidFactory = require('../util/UuidFactory.js');
var busMessages = require('../model/BusMessages.js');
var Component = require('../components/Component.js');

var Character = require('./Character.js');

function CharacterAgentComponent(services)
{
   CharacterAgentComponent.super_.call(this);

   this.amqp = services['amqp'];

   this.characters = {};
   this.charactersBySession = {};

   /** {@inheritDoc} */
   this.start = function()
   {
      this.registerBroadcastHandler(busMessages.Broadcasts.ClientConnected.name);
      this.registerBroadcastHandler(busMessages.Broadcasts.ClientDisconnected.name);

      this.onStartProgress();
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

   /** Start progress */
   this.onStartProgress = function()
   {
      {
         this.onStarted();
      }
   };

   /**
    * Iterates through all online characters and calls given callback with it
    * 
    * @param callback of signature function(character)
    */
   this.forEachCharacter = function(callback)
   {
      for ( var charId in this.characters)
      {
         callback(this.characters[charId]);
      }
   };

   /**
    * @param characterId the ID to look for
    * @returns the character by given character ID (if online)
    */
   this.getCharacterById = function(characterId)
   {
      return this.characters[characterId];
   };

   this.getCharacterBySession = function(sessionId)
   {
      return this.charactersBySession[sessionId];
   };

   /**
    * Broadcast handler.
    */
   this.onBroadcastClientConnected = function(header, body)
   {
      var charId = body.user.characterId;
      var character = this.characters[charId];

      if (!character)
      {
         character = new Character(charId, body.user.characterName, body.user.corporationId, body.user.corporationName);
         this.characters[charId] = character;
         this.emit('CharacterOnline', character);
      }
      if (!character.hasClientSession(body.sessionId))
      {
         character.addClientSession(body.sessionId, body.responseQueue);
         this.charactersBySession[body.sessionId] = character;
         this.emit('SessionAdded', character, body.sessionId);
      }
   };

   /**
    * Broadcast handler.
    */
   this.onBroadcastClientDisconnected = function(header, body)
   {
      var charId = body.user.characterId;
      var character = this.characters[charId];

      if (character)
      {
         if (character.hasClientSession(body.sessionId))
         {
            character.removeClientSession(body.sessionId);
            delete this.charactersBySession[body.sessionId];
            this.emit('SessionRemoved', character, body.sessionId);
         }
         if (!character.isOnline())
         {
            delete this.characters[charId];
            this.emit('CharacterOffline', character);
         }
      }
   };
}
util.inherits(CharacterAgentComponent, Component);

module.exports = CharacterAgentComponent;
