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
      this.registerCharacterHandler('CharacterOnline', '');
      this.registerCharacterHandler('CharacterOffline', '');
      this.registerCharacterHandler('SessionAdded', 'Character');
      this.registerCharacterHandler('SessionRemoved', 'Character');

      this.registerBroadcastHandler(busMessages.Broadcasts.EveStatusUpdateRequest.name);

      this.onStarted();
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
            this.broadcastLocationStatus(character, this.getLocationInterest(character));
         }
      }
   };

   /**
    * Character state handler
    */
   this.onCharacterOnline = function(character)
   {
      character.serviceData['location-service'] =
      {
         lastKnownLocation: null,
         locationsBySessionId: {}
      };
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
         var existingServiceData = existingCharacter.serviceData['location-service'];
         var existingInterest = self.getLocationInterest(existingCharacter);

         if (existingServiceData.lastKnownLocation && character.hasInterestIn(existingInterest))
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
      this.broadcastLocationStatus(character, this.getLocationInterest(character));
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
      var serviceData = character.serviceData['location-service'];
      var header =
      {
         type: busMessages.Broadcasts.CharacterLocationStatus.name,
         interest: interest,
         characterId: character.getCharacterId()
      };
      var body =
      {
         characterInfo: character.getCharacterInfo(),
         solarSystemId: serviceData.lastKnownLocation
      };

      this.amqp.broadcast(header, body, queueName);
   };

}
util.inherits(LocationServiceComponent, Component);

module.exports = LocationServiceComponent;
