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
      var handlerList = this.broadcastHandler[header.type];

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
               upro.sys.log('Error handling broadcast: ' + ex);
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
