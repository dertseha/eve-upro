var util = require('util');

var log4js = require('log4js');
var logger = log4js.getLogger();

var busMessages = require('../model/BusMessages.js');

var PendingCharacterServiceDataProcessingState = require('./PendingCharacterServiceDataProcessingState.js');

/**
 * The character service data is a character specific handler for the character service component. It handles all client
 * requests specific for this component.
 * 
 * Data modifying requests are handled via a CharacterServiceDataProcessingState. Such a state either queues them up
 * until the last raw data has been loaded from the storage, or the state is an active one.
 * 
 * Notifications that need to be sent out based on changes are returned as string arrays which resolve to corresponding
 * broadcast methods. These are called by the active processing state after becoming 'live'.
 * 
 * The IGB session control selection is handled outside of this processing state as it is not dependent on the raw data.
 * 
 * @param service the service this data is for
 * @param character the specific character this data is for
 */
function CharacterServiceData(service, character)
{
   this.service = service;
   this.character = character;

   this.rawData =
   {
      activeGalaxyId: 9,
      ignoredSolarSystems: [ 30000142 ],
      routingCapabilities:
      {
         jumpGates:
         {
            inUse: true
         },
         jumpDrive:
         {
            inUse: false,
            range: 5.0
         }
      }
   };
   this.igbSessions = {};

   this.processingState = new PendingCharacterServiceDataProcessingState(this);

   /**
    * Applies given raw data (from loading)
    */
   this.applyCharacterData = function(data)
   {
      this.rawData = this.mergeData(this.rawData, data);
   };

   /**
    * Merges two objects into each other, returning the result. The destination is considered to be the master to
    * describe the schema, source may skip fields.
    * 
    * @param dest the template object
    * @param source the source object
    * @return a new object containing the merge result
    */
   this.mergeData = function(dest, source)
   {
      var result = {};

      for ( var name in dest)
      {
         var resultValue = dest[name];

         if ((source !== null) && (source !== undefined))
         {
            var sourceValue = source[name];

            if (!Array.isArray(resultValue) && (typeof resultValue === 'object'))
            {
               resultValue = this.mergeData(resultValue, sourceValue);
            }
            else if ((sourceValue !== null) && (sourceValue !== undefined))
            {
               resultValue = source[name];
            }
         }
         result[name] = resultValue;
      }

      return result;
   };

   /**
    * Saves the character data
    */
   this.saveCharacterData = function()
   {
      this.service.mongodb.setData('CharacterData', this.character.getCharacterId(), this.rawData, function()
      {
      });
   };

   /**
    * Broadcasts a message
    * 
    * @param type the message type
    * @param body the body of the message
    * @param interest optional interest to use, otherwise it is global for the character
    * @param queueName optional specific queue to use
    */
   this.broadcast = function(type, body, interest, queueName)
   {
      var header =
      {
         type: type,
         interest: interest || [
         {
            scope: 'Character',
            id: this.character.getCharacterId()
         } ]
      };

      this.service.amqp.broadcast(header, body, queueName);
   };

   /**
    * Broadcasts the complete state data of the character with given broadcast parameters
    * 
    * @param interest the interest for which the broadcast is
    * @param queue the queue to use
    */
   this.broadcastStateData = function(interest, queue)
   {
      this.broadcastCharacterActiveGalaxy(interest, queue);
      this.broadcastCharacterIgnoredSolarSystems(interest, queue);
      this.broadcastCharacterRoutingCapabilities(interest, queue);
   };

   /**
    * Character state handler
    */
   this.onCharacterSessionAdded = function(sessionId)
   {
      this.processingState.onCharacterSessionAdded(sessionId);
   };

   /**
    * Character state handler
    */
   this.onCharacterSessionRemoved = function(sessionId)
   {
      var session = this.igbSessions[sessionId];

      if (session)
      {
         delete this.igbSessions[sessionId];
         if (session.activeControl)
         {
            this.updateIgbSessionControl(character);
         }
      }
   };

   /**
    * Updates the currently active IGB session if one is missing.
    */
   this.updateIgbSessionControl = function()
   {
      var selectedSessionId = null;
      var activeSessionId = null;

      for ( var sessionId in this.igbSessions)
      {
         var session = this.igbSessions[sessionId];

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
         var responseQueue = this.character.getResponseQueue(sessionId);
         var interest = [
         {
            scope: 'Session',
            id: selectedSessionId
         } ];

         logger.info('Selecting IGB control session: [' + selectedSessionId + '] for character ['
               + this.character.characterName + ']');
         this.igbSessions[selectedSessionId].activeControl = true;
         this.broadcastCharacterClientControlSelection(false);
         this.broadcastCharacterClientControlSelection(true, interest, responseQueue);
      }
   };

   /**
    * Broadcast the client control selection
    * 
    * @param active whether the session is to become active (must be session scoped)
    * @param interest the interest for the broadcast message
    * @param queueName optional explicit queue information
    */
   this.broadcastCharacterClientControlSelection = function(active, interest, queueName)
   {
      var body =
      {
         active: active
      };

      this.broadcast(busMessages.Broadcasts.CharacterClientControlSelection, body, interest, queueName);
   };

   /**
    * Broadcast handler
    */
   this.onBroadcastEveStatusUpdateRequest = function(header, body)
   {
      var sessionId = header.sessionId;

      if (!this.igbSessions[sessionId])
      {
         var session =
         {
            activeControl: false
         };

         logger.info('Detected IGB session: [' + sessionId + '] for character [' + this.character.characterName + ']');
         this.igbSessions[sessionId] = session;
         this.updateIgbSessionControl();
      }
   };

   /**
    * Broadcast handler
    */
   this.onBroadcast = function(header, body)
   {
      this.processingState.processBroadcast(header, body);
   };

   /**
    * Processes the broadcast message
    */
   this.processClientRequestSetActiveGalaxy = function(header, body)
   {
      var notifier = [];
      var galaxyId = body.galaxyId;

      if (galaxyId && (this.rawData.activeGalaxyId != galaxyId))
      {
         this.rawData.activeGalaxyId = galaxyId;
         notifier.push(busMessages.Broadcasts.CharacterActiveGalaxy);
      }

      return notifier;
   };

   /**
    * Broadcast the active galaxy
    * 
    * @param interest the interest for the broadcast message
    * @param queueName optional explicit queue information
    */
   this.broadcastCharacterActiveGalaxy = function(interest, queueName)
   {
      var body =
      {
         galaxyId: this.rawData.activeGalaxyId
      };

      this.broadcast(busMessages.Broadcasts.CharacterActiveGalaxy, body, interest, queueName);
   };

   /**
    * Processes the broadcast message
    */
   this.processClientRequestSetIgnoredSolarSystem = function(header, body)
   {
      var changed = false;
      var index = this.rawData.ignoredSolarSystems.indexOf(body.solarSystemId);

      if (body.ignore && (index < 0))
      {
         this.rawData.ignoredSolarSystems.push(body.solarSystemId);
         changed = true;
      }
      else if (!body.ignore && (index >= 0))
      {
         var part1 = this.rawData.ignoredSolarSystems.slice(0, index);
         var part2 = this.rawData.ignoredSolarSystems.slice(index + 1);

         this.rawData.ignoredSolarSystems = part1.concat(part2);
         changed = true;
      }

      return changed ? [ busMessages.Broadcasts.CharacterIgnoredSolarSystems ] : [];
   };

   /**
    * Broadcast the ignored solar systems
    * 
    * @param interest the interest for the broadcast message
    * @param queueName optional explicit queue information
    */
   this.broadcastCharacterIgnoredSolarSystems = function(interest, queueName)
   {
      var body =
      {
         ignoredSolarSystems: this.rawData.ignoredSolarSystems
      };

      this.broadcast(busMessages.Broadcasts.CharacterIgnoredSolarSystems, body, interest, queueName);
   };

   /**
    * Broadcast the current routing capabilities
    * 
    * @param interest the interest for the broadcast message
    * @param queueName optional explicit queue information
    */
   this.broadcastCharacterRoutingCapabilities = function(interest, queueName)
   {
      var body = this.rawData.routingCapabilities;

      this.broadcast(busMessages.Broadcasts.CharacterRoutingCapabilities, body, interest, queueName);
   };

   /**
    * Processes the broadcast message
    */
   this.processClientRequestSetRoutingCapabilityJumpGates = function(header, body)
   {
      var notifier = [];

      if (this.rawData.routingCapabilities.jumpGates.inUse != body.inUse)
      {
         this.rawData.routingCapabilities.jumpGates.inUse = body.inUse;
         notifier.push(busMessages.Broadcasts.CharacterRoutingCapabilities);
      }

      return notifier;
   };

   /**
    * Processes the broadcast message
    */
   this.processClientRequestSetRoutingCapabilityJumpDrive = function(header, body)
   {
      var notifier = [];
      var newData = this.mergeData(this.rawData.routingCapabilities.jumpDrive, body);

      if ((this.rawData.routingCapabilities.jumpDrive.inUse != newData.inUse)
            || (this.rawData.routingCapabilities.jumpDrive.range != newData.range))
      {
         this.rawData.routingCapabilities.jumpDrive.inUse = newData.inUse;
         this.rawData.routingCapabilities.jumpDrive.range = newData.range;
         notifier.push(busMessages.Broadcasts.CharacterRoutingCapabilities);
      }

      return notifier;
   };

}

module.exports = CharacterServiceData;
