function Character(charId, charName, corpId, corpName, allyId, allyName)
{
   this.characterId = charId;
   this.characterName = charName;
   this.corporationId = corpId;
   this.corporationName = corpName;
   this.allianceId = allyId;
   this.allianceName = allyName;

   this.clients = {};
   this.groupMemberships = [];
   this.groupSyncId = null;
   this.groupSyncFinished = false;

   this.serviceData = {};

   /**
    * @returns the primary key of the character
    */
   this.getCharacterId = function()
   {
      return this.characterId;
   };

   /**
    * @returns the corporation ID of the character
    */
   this.getCorporationId = function()
   {
      return this.corporationId;
   };

   /**
    * @returns true if the character is in an alliance
    */
   this.isInAlliance = function()
   {
      return !!this.allianceId;
   };

   /**
    * @returns the alliance ID of the character
    */
   this.getAllianceId = function()
   {
      return this.allianceId;
   };

   /**
    * @returns string presentation for logs
    */
   this.toString = function()
   {
      return this.characterId + ' [' + this.characterName + ']';
   };

   /**
    * @returns an information structure with most relevant character information
    */
   this.getCharacterInfo = function()
   {
      var info =
      {
         characterId: this.characterId,
         characterName: this.characterName,
         corporationId: this.corporationId,
         corporationName: this.corporationName
      };

      return info;
   };

   /**
    * Iterates through the currently present client sessions and calls given callback with the sessionId.
    * 
    * @param callback of signature function(sessionId)
    */
   this.forEachClientSession = function(callback)
   {
      for ( var sessionId in this.clients)
      {
         callback(sessionId);
      }
   };

   /**
    * @returns the amount of currently registered sessions
    */
   this.getSessionCount = function()
   {
      var count = 0;

      this.forEachClientSession(function(sessionId)
      {
         count++;
      });

      return count;
   };

   /**
    * @returns true if at least one client session is active
    */
   this.isOnline = function()
   {
      return this.getSessionCount() > 0;
   };

   /**
    * @param sessionId the session ID
    * @returns true if the character has given client session active
    */
   this.hasClientSession = function(sessionId)
   {
      return !!this.clients[sessionId];
   };

   /**
    * Adds a client session identified by given ID
    * 
    * @param sessionId the session ID
    * @param responseQueue the queue name for direct messages
    */
   this.addClientSession = function(sessionId, responseQueue)
   {
      this.clients[sessionId] =
      {
         responseQueue: responseQueue
      };
   };

   /**
    * Removes the client session identified by given ID
    */
   this.removeClientSession = function(sessionId)
   {
      delete this.clients[sessionId];
   };

   this.getResponseQueue = function(sessionId)
   {
      var responseQueue = null;
      var client = this.clients[sessionId];

      if (client)
      {
         responseQueue = client.responseQueue;
      }

      return responseQueue;
   };

   /**
    * @returns true whether the group sync is already finished
    */
   this.isGroupSyncFinished = function()
   {
      return this.groupSyncFinished;
   },

   /**
    * Handles the group sync state by given parameters.
    * 
    * @param syncId the group sync ID to consider
    * @param finished boolean to indicate whether syncing has started or is finished
    */
   this.handleGroupDataSyncState = function(syncId, finished)
   {
      var rCode = false;

      if (!finished)
      {
         this.groupSyncId = syncId;
      }
      else if (this.groupSyncId == syncId)
      {
         this.groupSyncId = null;
         this.groupSyncFinished = true;
         rCode = true;
      }

      return rCode;
   };

   this.addInterestForGroup = function(groupId)
   {
      var rCode = false;

      if (!this.hasInterestForGroup(groupId))
      {
         this.groupMemberships.push(groupId);
         rCode = true;
      }

      return rCode;
   };

   this.removeInterestForGroup = function(groupId)
   {
      var index = this.groupMemberships.indexOf(groupId);
      var rCode = false;

      if (index >= 0)
      {
         this.groupMemberships.splice(index, 1);
         rCode = true;
      }

      return rCode;
   };

   this.hasInterestIn = function(interestList)
   {
      var rCode = false;

      if (interestList)
      {
         var self = this;

         interestList.forEach(function(interest)
         {
            var interestFunc = self['hasInterestFor' + interest.scope];

            if (interestFunc && interestFunc.call(self, interest.id))
            {
               rCode = true;
            }
         });
      }

      return rCode;
   };

   this.forEachGroupInterest = function(callback)
   {
      this.groupMemberships.forEach(function(groupId)
      {
         callback(groupId);
      });
   };

   this.hasInterestForCharacter = function(id)
   {
      return id == this.characterId;
   };

   this.hasInterestForCorporation = function(id)
   {
      return id == this.corporationId;
   };

   this.hasInterestForAlliance = function(id)
   {
      return this.allianceId && (id == this.allianceId);
   };

   this.hasInterestForSession = function(id)
   {
      return this.hasClientSession(id);
   };

   this.hasInterestForGroup = function(id)
   {
      return this.groupMemberships.indexOf(id) >= 0;
   };

}

module.exports = Character;
