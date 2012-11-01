var util = require('util');

var winston = require('winston');
var logger = winston.loggers.get('root');

var busMessages = require('../model/BusMessages.js');

var Component = require('../components/Component.js');

function AutopilotServiceComponent(services)
{
   AutopilotServiceComponent.super_.call(this);

   this.msgBus = services['msgBus'];
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

      this.registerBroadcastHandler(busMessages.Broadcasts.ClientRequestSetAutopilotRoute.name);
      this.registerBroadcastHandler(busMessages.Broadcasts.CharacterLocationStatus.name);

      this.mongodb.defineCollection('AutopilotData', [], function()
      {
         self.onStarted();
      });
   };

   /**
    * Creates a standard route entry with given parameters
    */
   this.createRouteEntry = function(entryType, solarSystemId, nextJumpType)
   {
      var entry =
      {
         entryType: entryType,
         solarSystemId: solarSystemId,
         nextJumpType: nextJumpType
      };

      return entry;
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
    * Broadcast handler
    */
   this.onBroadcastClientRequestSetAutopilotRoute = function(header, body)
   {
      var character = this.characterAgent.getCharacterBySession(header.sessionId);

      if (character)
      {
         var serviceData = character.serviceData['autopilot-service'];
         var interest = this.getInterest(character);
         var self = this;

         serviceData.rawData =
         {
            route: [],
            nextRouteIndex: -1
         };
         body.route.forEach(function(userEntry)
         {
            var entry = self.createRouteEntry(userEntry.entryType, userEntry.solarSystemId, userEntry.nextJumpType);

            serviceData.rawData.route.push(entry);
         });
         if (serviceData.rawData.route.length > 0)
         {
            serviceData.rawData.nextRouteIndex = 0;
         }

         logger.info('Character [' + character.characterName + '] set new autopilot route; Length: '
               + serviceData.rawData.route.length);

         this.checkCurrentLocationForRoute(character);
         this.saveRawData(character);

         this.broadcastAutopilotRoute(character, interest);
         this.broadcastAutopilotRouteIndex(character, interest);
      }
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastCharacterLocationStatus = function(header, body)
   {
      var character = this.characterAgent.getCharacterById(header.characterId);

      if (character)
      {
         var serviceData = character.serviceData['autopilot-service'];

         serviceData.currentLocation = body.solarSystemId;
         if (this.checkCurrentLocationForRoute(character))
         {
            var interest = this.getInterest(character);

            this.saveRawData(character);

            this.broadcastAutopilotRouteIndex(character, interest);
            if (serviceData.rawData.route.length == 0)
            {
               this.broadcastAutopilotRoute(character, interest);
            }
         }
      }
   };

   /**
    * This method compares the current location against the list of next expected systems in the route. If the current
    * route index has changed, it returns true.
    * 
    * @param character the character to check
    * @returns true if the raw data has changed.
    */
   this.checkCurrentLocationForRoute = function(character)
   {
      var serviceData = character.serviceData['autopilot-service'];
      var rCode = false;

      if (serviceData.rawData && (serviceData.rawData.nextRouteIndex >= 0))
      {
         var nextIndex = serviceData.rawData.nextRouteIndex;
         var nextEntry = serviceData.rawData.route[nextIndex];

         while (nextEntry && (nextEntry.solarSystemId != serviceData.currentLocation))
         {
            if ((nextEntry.entryType == 'Transit') && (nextIndex < (serviceData.rawData.route.length - 1)))
            {
               nextIndex++;
               nextEntry = serviceData.rawData.route[nextIndex];
            }
            else
            {
               nextEntry = null;
            }
         }

         if (nextEntry)
         {
            serviceData.rawData.nextRouteIndex = nextIndex + 1;
            if (serviceData.rawData.nextRouteIndex >= serviceData.rawData.route.length)
            {
               logger.info('Character [' + character.characterName + '] has reached end of autopilot route');
               serviceData.rawData.route = [];
               serviceData.rawData.nextRouteIndex = -1;
            }
            rCode = true;
         }
      }

      return rCode;
   };

   /**
    * Character state handler
    */
   this.onCharacterOnline = function(character)
   {
      var self = this;
      var filter =
      {
         _id: character.getCharacterId()
      };
      var activated = false;

      character.serviceData['autopilot-service'] =
      {
         currentLocation: null,
         rawData: null
      };

      this.mongodb.getData('AutopilotData', filter, function(err, id, data)
      {
         if (!activated)
         {
            if (data)
            {
               self.onDataLoaded(character, data);
               activated = true;
            }
            else
            {
               var initData =
               {
                  nextRouteIndex: -1,
                  route: []
               };

               self.onDataLoaded(character, initData);
            }
         }
      });
   };

   /**
    * Character state handler
    */
   this.onCharacterSessionAdded = function(character, sessionId)
   {
      var serviceData = character.serviceData['autopilot-service'];

      if (serviceData.rawData)
      {
         var responseQueue = character.getResponseQueue(sessionId);
         var interest = [
         {
            scope: 'Session',
            id: sessionId
         } ];

         this.broadcastStateData(character, interest, responseQueue);
      }
   };

   this.onDataLoaded = function(character, data)
   {
      var serviceData = character.serviceData['autopilot-service'];

      if (!serviceData.rawData)
      {
         var interest = this.getInterest(character);

         serviceData.rawData = data;

         if (this.checkCurrentLocationForRoute(character))
         {
            this.saveRawData(character);
         }

         this.broadcastAutopilotRoute(character, interest);
         this.broadcastAutopilotRouteIndex(character, interest);
      }
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
    * Saves the route data of given character object
    * 
    * @param character the Character object
    */
   this.saveRawData = function(character)
   {
      var serviceData = character.serviceData['autopilot-service'];

      this.mongodb.setData('AutopilotData', character.getCharacterId(), serviceData.rawData, function()
      {
      });
   };

   /**
    * Broadcasts the complete state data of the character with given broadcast parameters
    * 
    * @param character the Character object
    * @param interest the interest for which the broadcast is
    * @param queue the queue to use
    */
   this.broadcastStateData = function(character, interest, queue)
   {
      this.broadcastAutopilotRoute(character, interest, queue);
      this.broadcastAutopilotRouteIndex(character, interest, queue);
   };

   /**
    * Broadcast the autopilot route of given character
    * 
    * @param character the Character object
    * @param interest the interest for the broadcast message
    * @param queueName optional explicit queue information
    */
   this.broadcastAutopilotRoute = function(character, interest, queueName)
   {
      var serviceData = character.serviceData['autopilot-service'];

      var header =
      {
         type: busMessages.Broadcasts.CharacterAutopilotRoute.name,
         interest: interest
      };
      var body =
      {
         route: serviceData.rawData.route
      };

      this.msgBus.broadcast(header, body, queueName);
   };

   /**
    * Broadcast the autopilot route index of given character
    * 
    * @param character the Character object
    * @param interest the interest for the broadcast message
    * @param queueName optional explicit queue information
    */
   this.broadcastAutopilotRouteIndex = function(character, interest, queueName)
   {
      var serviceData = character.serviceData['autopilot-service'];

      var header =
      {
         type: busMessages.Broadcasts.CharacterAutopilotRouteIndex.name,
         interest: interest
      };
      var body =
      {
         nextRouteIndex: serviceData.rawData.nextRouteIndex
      };

      this.msgBus.broadcast(header, body, queueName);
   };

}
util.inherits(AutopilotServiceComponent, Component);

module.exports = AutopilotServiceComponent;
