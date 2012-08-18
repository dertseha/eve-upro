/**
 * The communication uplink is the data bridge to the server
 */
upro.data.CommunicationUplink = Class.create(
{
   /**
    * Initializer.
    * 
    * @param listener listener interface
    */
   initialize: function(listener, igbPingUrl)
   {
      var self = this;

      /*
       * The following is a minor hack to stop Chrome nagging about denying access to the unsafe X-JSON header. Note
       * that this is not about circumventing the problem, but hardcoded disabling this function. This way no X-JSON
       * access will and can be done at all.
       */
      Ajax.Response.prototype._getHeaderJSON = function(headerName)
      {
         return null;
      };

      this.listener = listener;
      this.igbPingUrl = igbPingUrl;
      this.useIgbPing = upro.sys.isRunningInInGameBrowser();

      this.requestQueue = [];
      this.sessionId = null;
      this.eventSource = null;
      this.idCounter = 1;
      this.statusTimer = new upro.sys.Timer.getSingleTimer(function()
      {
         self.sendStatus();
      });
   },

   /**
    * Starts the communication uplink.
    */
   start: function()
   {
      this.setupEventSource();
   },

   /**
    * Sends a request of given type with given body. Calls callback on successful completion.
    * 
    * @param type the type of the request
    * @param body request body
    * @param callback completion callback
    */
   sendRequest: function(type, body, callback)
   {
      var request =
      {
         type: type,
         body: body,
         callback: callback
      };

      this.requestQueue.push(request);
      if (this.requestQueue.length == 1)
      {
         this.processQueue();
      }
   },

   /**
    * Sends the next pending request (head of queue)
    */
   processQueue: function()
   {
      var self = this;
      var requestSinkUrl = "requestSink";
      var request = this.requestQueue[0];
      var postBody =
      {
         jsonrpc: "2.0",
         method: "clientRequest",
         params:
         {
            header:
            {
               type: request.type,
               sessionId: this.sessionId
            },
            body: request.body
         },
         id: this.idCounter++
      };

      request.ajax = new Ajax.Request(requestSinkUrl,
      {
         method: "post",
         overrideMimeType: true,
         postBody: Object.toJSON(postBody),
         contentType: 'application/json',
         onSuccess: function(response)
         {
            var resultObj = response.responseText.evalJSON();

            if (resultObj && resultObj.result && resultObj.result.eveHeadersPresence && self.useIgbPing)
            {
               upro.sys.log("Server notifies EVE headers presence, switching to direct communication");
               self.useIgbPing = false;
            }

            self.requestQueue = self.requestQueue.slice(1);
            if (self.requestQueue.length > 0)
            {
               self.processQueue();
            }

            request.callback();
         },
         onFailure: function(response)
         {
            request.ajax = null;
         }
      });

   },

   /**
    * Prepares to send a status request
    */
   sendStatus: function()
   {
      if (this.useIgbPing && this.igbPingUrl)
      {
         var self = this;

         new Ajax.Request(this.igbPingUrl,
         {
            method: "get",
            onSuccess: function(response)
            {
               // upro.sys.log('!!!!! success response: ' + response.responseText);
               self.sendStatusRequest(response.responseText);
            },
            onFailure: function(response)
            {
               upro.sys.log('Failed to request IGB ping');
               self.sendStatusRequest(null);
            }
         });
      }
      else
      {
         this.sendStatusRequest(null);
      }
   },

   /**
    * Sends the actual status request
    */
   sendStatusRequest: function(igbPingResponse)
   {
      var body =
      {
         igbPingResponse: igbPingResponse
      };
      var self = this;

      this.sendRequest("Status", body, function()
      {
         self.onStatusSent();
      });
   },

   /**
    * Callback for a successfully sent status request
    */
   onStatusSent: function()
   {
      this.statusTimer.start(5000);
   },

   /**
    * Sets up the event source (data from the server to the client)
    */
   setupEventSource: function()
   {
      var eventSourceUrl = "eventSource";
      var self = this;

      this.eventSource = new EventSource(eventSourceUrl);
      this.eventSource.addEventListener("Timer", function(event)
      {
         // could be used for keep-alive checks
      }, false);
      this.eventSource.addEventListener("Session", function(event)
      {
         self.onEventSession(JSON.parse(event.data));
      }, false);
      this.eventSource.addEventListener("Broadcast", function(event)
      {
         self.onEventBroadcast(JSON.parse(event.data));
      }, false);
   },

   /**
    * Event Handler
    * 
    * @param data event body
    */
   onEventSession: function(data)
   {
      this.sessionId = data.sessionId;
      upro.sys.log("Session Established: " + this.sessionId);
      this.sendStatus();
      this.listener.onSessionEstablished(data.user);
   },

   /**
    * Event Handler
    * 
    * @param data event body
    */
   onEventBroadcast: function(data)
   {
      this.listener.onBroadcast(data.header, data.body);
   }
});
