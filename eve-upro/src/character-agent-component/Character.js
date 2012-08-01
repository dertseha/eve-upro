function Character(charId, charName, corpId, corpName)
{
   this.characterId = charId;
   this.characterName = charName;
   this.corporationId = corpId;
   this.corporationName = corpName;

   this.clients = {};

   /**
    * @returns the primary key of the character
    */
   this.getCharacterId = function()
   {
      return this.characterId;
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
    * @returns true if at least one client session is active
    */
   this.isOnline = function()
   {
      var count = 0;

      this.forEachClientSession(function(sessionId)
      {
         count++;
      });

      return count > 0;
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

   this.hasInterestForCharacter = function(id)
   {
      return id == this.characterId;
   };

   this.hasInterestForCorporation = function(id)
   {
      return id == this.corporationId;
   };

   this.hasInterestForSession = function(id)
   {
      return this.hasClientSession(id);
   };

}

module.exports = Character;
