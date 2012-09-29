var events = require('events');
var util = require('util');
var https = require('https');

/**
 * Creates the request path from given parameters
 */
var getRequestPath = function(userKey, host, log)
{
   return [ '', userKey, 'hosts', host, log, '?realtime=1' ].join('/');
};

/**
 * Calls JSON.stringify() on given message object
 */
var toStringJson = function(message)
{
   var line;

   try
   {
      line = JSON.stringify(message);
   }
   catch (ex)
   {
      line = "Exception creating log message: " + ex;
   }

   return line;
};

/**
 * Creates a shallow string presentation of given message
 */
var toStringObject = function(message)
{
   var line = [];

   for ( var key in message)
   {
      line.push(key + '=' + message[key]);
   }

   return line.join(',');
};

/**
 * The disconnected state
 */
var disconnectedState = Object.create({});
var connectedState = Object.create({});

disconnectedState.activate = function(client)
{
   var that = this;

   this.client = client;
   this.queue = [];

   setTimeout(function()
   {
      that.onTimeout();
   }, 10000);

   // console.log('Activating Disconnected State');
   client.setState(this);
};

disconnectedState.send = function(logRequest)
{
   this.queue.push(logRequest);
};

disconnectedState.onTimeout = function()
{
   var newState = Object.create(connectedState);

   newState.activate(this.client);
   this.queue.forEach(function(logRequest)
   {
      newState.send(logRequest);
   });
};

connectedState.activate = function(client)
{
   var that = this;

   this.client = client;
   this.stream = client.getStream();
   this.stream.on('end', function()
   {
      that.onEnd();
   });
   this.stream.on('error', function()
   {
      that.onEnd();
   });

   // console.log('Activating Connected State');
   client.setState(this);
};

connectedState.onEnd = function()
{
   var newState = Object.create(disconnectedState);

   newState.activate(this.client);
};

connectedState.send = function(logRequest)
{
   this.stream.write(logRequest.messageText + '\n');
   logRequest.callback(null, true);
};

/**
 * Constructor for a LogentriesClient object.
 * 
 * options can have the following members:
 * <ul>
 * <li>json: boolean; if true, a log message is sent through JSON.stringify(). if false, only shallow toString done.</li>
 * <li>requestFactory: object with a method request(options, callback) returning a stream. Defaults to https.</li>
 * <li>userKey: user key as per logentries. Mandatory.</li>
 * <li>host: host as per logentries. Mandatory.</li>
 * <li>log: log name as per logentries. Mandatory.</li>
 * </ul>
 */
var LogentriesClient = exports.LogentriesClient = function(options)
{
   options = options || {};

   var that = Object.create(new events.EventEmitter());
   var messageToString = options.json ? toStringJson : toStringObject;
   var requestFactory = options.requestFactory || https;
   var requestPath = getRequestPath(options.userKey, options.host, options.log);
   var state = null;

   // console.log('working with path ' + requestPath);
   that.setState = function(newState)
   {
      state = newState;
   };

   that.getStream = function()
   {
      var req = null;
      var reqOptions =
      {
         host: 'api.logentries.com',
         path: requestPath,
         method: 'PUT'
      };

      req = requestFactory.request(reqOptions, function(res)
      {

         // console.log('result received: ' + res.statusCode);
         if (res.statusCode !== 200)
         {
            req.emit('end');
            res.destroy();
            that.emit('error', 'Unexpected response received: ' + res.statusCode);
         }
      });

      return req;
   };

   that.log = function(message, callback)
   {
      var logRequest =
      {
         messageText: messageToString(message),
         callback: callback
      };

      state.send(logRequest);
   };

   Object.create(connectedState).activate(that);

   return that;
};
