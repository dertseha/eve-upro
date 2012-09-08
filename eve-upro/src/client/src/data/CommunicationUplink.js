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
   initialize: function(listener)
   {
      var self = this;

      this.listener = listener;

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
      var postBodyText = Object.toJSON(postBody);

      request.ajax = new Ajax.Request(requestSinkUrl,
      {
         method: "post",
         overrideMimeType: true,
         postBody: postBodyText,
         contentType: 'application/json',
         onSuccess: function(response)
         {
            self.handleResponseCode(response);
            self.handleGenericResponse(response, postBodyText);

            self.requestQueue = self.requestQueue.slice(1);
            if (self.requestQueue.length > 0)
            {
               self.processQueue();
            }
            request.callback();
         },
         onFailure: function(response)
         {
            self.handleResponseCode(response);
            request.ajax = null;
         }
      });

   },

   handleResponseCode: function(response)
   {
      if (response.status)
      {
         if (response.status == 401)
         {
            upro.sys.log("401 on request sink, assuming logged out");
            window.location.href = "/logout";
         }
      }
   },

   handleGenericResponse: function(response, postBody)
   {
      if (response.responseText.indexOf("Invalid Request") >= 0)
      {
         upro.sys.log("Issued invalid request: " + postBody);
      }
   },

   /**
    * Issues a status request
    */
   sendStatus: function()
   {
      var body = {};
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
      var eventSourceUrl = "/eventSource";
      var eventNames = [ upro.data.clientEvents.Timer.name, upro.data.clientEvents.Session.name,
            upro.data.clientEvents.Broadcast.name ];
      var that = this;

      if (upro.sys.isRunningInInGameBrowser() || (typeof Worker === "undefined"))
      { // although Worker to be reported available in IGB, starting one crashes the browser.
         this.eventSource = new EventSource(eventSourceUrl);
         eventNames.forEach(function(eventName)
         {
            that.registerEventHandler(eventName);
         });
      }
      else
      {
         var startCmd =
         {
            type: "start",
            eventSourceUrl: eventSourceUrl,
            eventNames: eventNames
         };

         this.eventSource = new Worker("/javascripts/ThreadedEventSource.js");
         this.registerThreadedEventHandler();
         this.eventSource.postMessage(startCmd);
      }
   },

   /**
    * Registers an event handler at the event source
    * 
    * @param name name of the event
    */
   registerEventHandler: function(name)
   {
      var self = this;

      this.eventSource.addEventListener(name, function(event)
      {
         self.onEvent(name, JSON.parse(event.data));
      }, false);
   },

   /**
    * Registers an event handler at the threaded event source
    */
   registerThreadedEventHandler: function()
   {
      var self = this;

      this.eventSource.addEventListener("message", function(event)
      {
         var message = event.data;

         self.onEvent(message.name, JSON.parse(message.data));
      }, false);
   },

   /**
    * Generic event handler; Validates event data and dispatches to handler
    * 
    * @param name name of the event
    * @param data received data object
    */
   onEvent: function(name, data)
   {
      var event = upro.data.clientEvents[name];

      if (event.isValid(data))
      {
         var handler = this['onEvent' + name];

         handler.call(this, data);
      }
      else
      {
         upro.sys.log('Received invalid event [' + name + '] - Data: ' + Object.toJSON(data));
      }
   },

   /**
    * Event Handler
    */
   onEventTimer: function(data)
   {

   },

   /**
    * Event Handler
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
    */
   onEventBroadcast: function(data)
   {
      this.listener.onBroadcast(data.header, data.body);
   }
});
