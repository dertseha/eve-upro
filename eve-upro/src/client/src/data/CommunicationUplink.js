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
            request.ajax = null;
         }
      });

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
