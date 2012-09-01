/**
 * The body register proxy stores a list of bodies (such as characters and corporations) to provide their names. It
 * provides functions to search for bodies by (parts of) their name and name lookups by ID.
 */
upro.model.proxies.BodyRegisterProxy = Class.create(upro.model.proxies.AbstractProxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.BodyRegisterProxy.NAME, null);

      var that = this;

      this.bodyNamesByType = {};
      this.pendingLookupRequest = {};

      [ "Character", "Corporation" ].forEach(function(type)
      {
         that.bodyNamesByType[type] = {};
         that.pendingLookupRequest[type] = [];
      });
      this.lookupRequestTimer = upro.sys.Timer.getSingleTimer(this.onLookupRequestTimeout.bind(this));
   },

   onRegister: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);
      var characterInfo = sessionProxy.getCharacterInfo();

      this.registerBroadcast(upro.data.clientBroadcastEvents.FindBodyResult.name);
      this.registerBroadcast(upro.data.clientBroadcastEvents.GetNameOfBodyReply.name);

      // register the already known data
      this.bodyNamesByType["Character"][characterInfo.characterId] = new upro.model.ResolvedBodyName(
            characterInfo.characterId, characterInfo.characterName);
      this.bodyNamesByType["Corporation"][characterInfo.corporationId] = new upro.model.ResolvedBodyName(
            characterInfo.corporationId, characterInfo.corporationName);
   },

   /**
    * Returns an instance of upro.model.AbstractBodyName based on given type and ID
    * 
    * @param type type of the body
    * @param id ID of the body
    * @returns an abstract body name from which to query the name
    */
   getBodyName: function(type, id)
   {
      var body = this.bodyNamesByType[type][id];

      if (!body)
      {
         body = new upro.model.UnknownBodyName(id, type, this);
      }

      return body;
   },

   /**
    * Requests to find bodies by name
    * 
    * @param searchText search text to match
    */
   findBodiesByName: function(searchText)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      upro.sys.log("Requesting to find bodies [" + searchText + "]");
      sessionProxy.sendRequest(upro.data.clientRequests.FindBodiesByName.name,
      {
         searchText: searchText
      });
   },

   /**
    * Requests to lookup a body name. The request is delayed to collect any bulk requests, so that the server is not
    * hammered for each single body.
    * 
    * @param type type of the body
    * @param id ID of the body
    */
   requestBodyName: function(type, id)
   {
      this.pendingLookupRequest[type].push(id);
      this.lookupRequestTimer.start(50);
   },

   onLookupRequestTimeout: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      upro.sys.log("Sending request to lookup bodies");
      sessionProxy.sendRequest(upro.data.clientRequests.GetNameOfBody.name,
      {
         characters: this.pendingLookupRequest["Character"],
         corporations: this.pendingLookupRequest["Corporation"]
      });
      for ( var type in this.pendingLookupRequest)
      {
         this.pendingLookupRequest[type] = [];
      }
   },

   onFindBodyResult: function(broadcastBody)
   {
      var that = this;

      if (this.updateBodies("Character", broadcastBody.characters))
      {
         this.facade().sendNotification(upro.app.Notifications.KnownCharactersChanged);
      }
      if (this.updateBodies("Corporation", broadcastBody.corporations))
      {
         this.facade().sendNotification(upro.app.Notifications.KnownCorporationsChanged);
      }

      var result =
      {
         query: broadcastBody.query,
         characters: [],
         corporations: []
      };
      broadcastBody.characters.forEach(function(data)
      {
         result.characters.push(that.getBodyName("Character", data.id));
      });
      broadcastBody.corporations.forEach(function(data)
      {
         result.corporations.push(that.getBodyName("Corporation", data.id));
      });

      this.facade().sendNotification(upro.app.Notifications.FindBodyResult, result);
   },

   onGetNameOfBodyReply: function(broadcastBody)
   {
      if (this.updateBodies("Character", broadcastBody.characters))
      {
         this.facade().sendNotification(upro.app.Notifications.KnownCharactersChanged);
      }
      if (this.updateBodies("Corporation", broadcastBody.corporations))
      {
         this.facade().sendNotification(upro.app.Notifications.KnownCorporationsChanged);
      }
   },

   /**
    * Updates the known body names and returns if new ones where given in the data list
    * 
    * @param bodyType type of the bodies
    * @param dataList list returned from the server
    * @returns {Boolean} true if new bodies were resolved
    */
   updateBodies: function(bodyType, dataList)
   {
      var bodiesChanged = false;
      var bodies = this.bodyNamesByType[bodyType];

      dataList.forEach(function(data)
      {
         var body = bodies[data.id];

         if (!body)
         {
            body = new upro.model.ResolvedBodyName(data.id, data.name);
            bodies[data.id] = body;
            bodiesChanged = true;
         }
      });

      return bodiesChanged;
   }

});

upro.model.proxies.BodyRegisterProxy.NAME = "BodyRegister";

/**
 * @returns true if the given search text is valid to be used
 */
upro.model.proxies.BodyRegisterProxy.isValidNameSearchText = function(searchText)
{
   var hasValidLength = searchText.length >= 4;
   var hasValidPattern = upro.eve.Util.isValidNameInput(searchText);

   return hasValidLength && hasValidPattern;
};
