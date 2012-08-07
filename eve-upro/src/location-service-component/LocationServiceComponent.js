var util = require('util');

var Component = require('../components/Component.js');
var busMessages = require('../model/BusMessages.js');

function LocationServiceComponent(services)
{
   LocationServiceComponent.super_.call(this);

   this.amqp = services['amqp'];
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

      this.registerBroadcastHandler(busMessages.Broadcasts.EveStatusUpdateRequest);

      this.onStarted();
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
   this.onBroadcastEveStatusUpdateRequest = function(header, body)
   {
      var character = this.characterAgent.getCharacterBySession(body.sessionId);
      var newLocation = body.eveInfo.solarsystemId;

      if (character && (character.lastKnownLocation != newLocation))
      {
         character.lastKnownLocation = newLocation;
         character.locationsBySessionId[body.sessionId] = newLocation;
         this.broadcastLocationStatus(character, this.getLocationInterest(character));
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterOnline = function(character)
   {
      character.lastKnownLocation = null;
      character.locationsBySessionId = {};
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
      var self = this;

      this.characterAgent.forEachCharacter(function(existingCharacter)
      {
         var existingInterest = self.getLocationInterest(existingCharacter);

         if (existingCharacter.lastKnownLocation && character.hasInterestIn(existingInterest))
         {
            self.broadcastLocationStatus(existingCharacter, interest, responseQueue);
         }
      });
   };

   /**
    * Character state handler
    */
   this.onCharacterSessionRemoved = function(character, sessionId)
   {
      if (character.lastKnownLocation)
      {
         if (character.locationsBySessionId[sessionId])
         {
            var amount = 0;

            delete character.locationsBySessionId[sessionId];
            for (existingId in character.locationsBySessionId)
            {
               amount++;
            }
            if (amount == 0)
            {
               delete character.lastKnownLocation;
               this.broadcastLocationStatus(character, this.getLocationInterest(character));
            }
         }
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterOffline = function(character)
   {
      if (character.lastKnownLocation)
      {
         delete character.lastKnownLocation;
         this.broadcastLocationStatus(character, this.getLocationInterest(character));
      }
   };

   /**
    * @param character the character for which the interest is to create
    * @returns the location interest for given character
    */
   this.getLocationInterest = function(character)
   {
      var interest = [
      {
         scope: 'Character',
         id: character.getCharacterId()
      } ];

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
      var header =
      {
         type: busMessages.Broadcasts.CharacterLocationStatus,
         interest: interest
      };
      var body =
      {
         characterInfo: character.getCharacterInfo(),
         solarSystemId: character.lastKnownLocation
      };

      this.amqp.broadcast(header, body, queueName);
   };

}
util.inherits(LocationServiceComponent, Component);

module.exports = LocationServiceComponent;
