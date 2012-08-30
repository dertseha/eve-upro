upro.model.proxies.SessionControlProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.SessionControlProxy.NAME, null);

      this.uplink = new upro.data.CommunicationUplink(this);
      this.broadcastHandler = {};
      this.characterInfo = null;

      this.activeInGameBrowserControl = false;

      this.firstSessionEstablished = false;
   },

   addBroadcastHandler: function(type, callback)
   {
      var handlerList = this.broadcastHandler[type];

      if (!handlerList)
      {
         this.broadcastHandler[type] = handlerList = [];
      }
      handlerList.push(callback);
   },

   onRegister: function()
   {
      var self = this;

      this.addBroadcastHandler('CharacterClientControlSelection', function(broadcastBody)
      {
         self.onBroadcastCharacterClientControlSelection(broadcastBody);
      });
   },

   shutdown: function()
   {

   },

   establishUplink: function()
   {
      this.shutdown();

      this.uplink.start();
   },

   /**
    * Sends a request of given type with given body. Calls callback on successful completion.
    * 
    * @param type the type of the request
    * @param body request body
    */
   sendRequest: function(type, body)
   {
      this.uplink.sendRequest(type, body, function()
      {
      });
   },

   /**
    * @returns the character information this session runs for
    */
   getCharacterInfo: function()
   {
      return this.characterInfo;
   },

   /**
    * @param charId The character id to check
    * @returns {Boolean} true if the given character is the one this session is for
    */
   isForCharacter: function(charId)
   {
      return this.characterInfo && (this.characterInfo.characterId == charId);
   },

   /**
    * Called when a connection has been established
    * 
    * @param characterInfo for which character this session is
    */
   onSessionEstablished: function(characterInfo)
   {
      upro.sys.log("Session Established for: " + characterInfo.characterName + " (" + characterInfo.corporationName
            + ")");
      this.characterInfo = characterInfo;
      if (!this.firstSessionEstablished)
      {
         this.facade().sendNotification(upro.app.Notifications.SessionLoggedIn, null);
         this.firstSessionEstablished = true;
      }
   },

   /**
    * Basic broadcast handler dispatching to the specifically registered handler
    * 
    * @param header the broadcast header
    * @param body the broadcast body
    */
   onBroadcast: function(header, body)
   {
      if (this.isBroadcastValid(header, body))
      {
         this.callBroadcastHandler(header, body);
      }
   },

   /**
    * Checks whether a broadcast is valid
    * 
    * @param header the header of the broadcast
    * @param body the body of the broadcast
    * @returns {Boolean} true if the broadcast matches the definition
    */
   isBroadcastValid: function(header, body)
   {
      var event = upro.data.clientBroadcastEvents[header.type];
      var rCode = false;

      if (event)
      {
         rCode = true;
         if (!event.header.isValid)
         {
            event.header.isValid = schema(event.header.schema);
         }
         if (!event.header.isValid(header))
         {
            upro.sys.log('Broadcast header is invalid [' + header.type + ']: ' + Object.toJSON(header));
            rCode = false;
         }
         if (!event.body.isValid)
         {
            event.body.isValid = schema(event.body.schema);
         }
         if (!event.body.isValid(body))
         {
            upro.sys.log('Broadcast body is invalid [' + header.type + ']: ' + Object.toJSON(body));
            rCode = false;
         }
      }

      return rCode;
   },

   /**
    * Calls the broadcast handler
    * 
    * @param header broadcast header
    * @param body broadcast body
    */
   callBroadcastHandler: function(header, body)
   {
      var handlerList = this.broadcastHandler[header.type];
      var self = this;

      if (handlerList)
      {
         handlerList.forEach(function(callback)
         {
            try
            {
               callback(body);
            }
            catch (ex)
            {
               upro.sys.log("Error handling broadcast [" + header.type + "]: " + ex);
               self.facade().sendNotification(upro.app.Notifications.DebugMessage, "Error: " + ex);
            }
         });
      }
   },

   /**
    * Broadcast Handler
    */
   onBroadcastCharacterClientControlSelection: function(broadcastBody)
   {
      if (this.activeInGameBrowserControl != broadcastBody.active)
      {
         this.activeInGameBrowserControl = broadcastBody.active;

         this.facade().sendNotification(upro.app.Notifications.ActiveInGameBrowserControlChanged,
               this.activeInGameBrowserControl);
      }
   }

});

upro.model.proxies.SessionControlProxy.NAME = "SessionControl";
