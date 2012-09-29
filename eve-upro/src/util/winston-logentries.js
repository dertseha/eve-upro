var winston = require('winston');
var logentries = require('./logentries-client.js');

/**
 * @returns the current timestamp as ISO string
 */
var getDefaultTimestamp = function()
{
   return (new Date()).toISOString();
};

/**
 * options is an object with the following options:
 * <ul>
 * <li>client: referencing a client object handling the log() requests.</li>
 * <li>getTimestamp: a function returning the timestamp string. Default: function returning an ISO string of now.</li>
 * <li>(options as per Transport: 'level', 'silent')</li>
 * </ul>
 */
var WinstonLogentries = exports.WinstonLogentries = function(options)
{
   options = options || {};

   var that = Object.create(new winston.Transport(options));
   var client = options.client || new logentries.LogentriesClient(options);
   var timestampGetter = options.getTimestamp || getDefaultTimestamp;

   client.on('error', function(err)
   {
      that.emit('error', err);
   });

   that.name = 'logentries';

   that.log = function(level, msg, meta, callback)
   {
      if (that.silent)
      {
         return callback(null, true);
      }

      var message = winston.clone(meta || {});

      if (options.timestamp)
      {
         message.timestamp = timestampGetter();
      }
      message.level = level;
      message.message = msg;

      client.log(message, function(err, result)
      {
         that.emit('logged');
         callback(err, result);
      });
   };

   return that;
};

winston.transports.Logentries = WinstonLogentries;
