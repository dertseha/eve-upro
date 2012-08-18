var schema = require('js-schema');

var clientRequests = require('./clientRequests.js').clientRequests;
var clientBroadcastEvents = require('./clientBroadcastEvents.js').clientBroadcastEvents;

var userSchema =
{
   characterId: Number,
   characterName: String,
   corporationId: Number,
   corporationName: String
};
var interestSchema =
{
   scope: [ 'Session', 'Character' ],
   id: [ Number, String ]
};

var broadcasts =
{
   /**
    * Sent for each new client connection
    */
   ClientConnected:
   {
      name: 0,
      header:
      {
         schema:
         {
            type: 0
         },
         isValid: null
      },
      body:
      {
         schema:
         {
            sessionId: String,
            responseQueue: String,
            user: userSchema
         },
         isValid: null
      }
   },

   /**
    * Sent for each lost client connection
    */
   ClientDisconnected:
   {
      name: 0,
      header:
      {
         schema:
         {
            type: 0
         },
         isValid: null
      },
      body:
      {
         schema:
         {
            sessionId: String,
            user: userSchema
         },
         isValid: null
      }
   },

   /**
    * Caused periodically by EVE data related clients, based on IGB header data. Can come more than once with the same
    * data when there are several IGB tabs open.
    */
   EveStatusUpdateRequest:
   {
      name: 0,
      header:
      {
         schema:
         {
            type: 0,
            sessionId: String
         },
         isValid: null
      },
      body:
      {
         schema:
         {
            eveInfo:
            {
               trusted: Boolean,
               characterId: Number,
               characterName: String,
               corporationId: Number,
               corporationName: String,
               solarSystemId: Number
            }
         },
         isValid: null
      }
   }
};

// Register all client requests.
for ( var name in clientRequests)
{
   var request = clientRequests[name];
   var requestBroadcastName = 'ClientRequest' + name;

   broadcasts[requestBroadcastName] =
   {
      name: 0,
      header:
      {
         schema:
         {
            type: requestBroadcastName,
            sessionId: String
         },
         isValid: null
      },
      body: request.body
   };
}

// Register all broadcast events.
for ( var name in clientBroadcastEvents)
{
   var event = clientBroadcastEvents[name];

   broadcasts[name] =
   {
      name: 0,
      header:
      {
         schema:
         {
            type: name,
            interest: Array.of(interestSchema)
         },
         isValid: null
      },
      body: event.body
   };
}

// now iterate through all broadcasts and fill any missing data
for ( var name in broadcasts)
{
   var broadcast = broadcasts[name];

   if (broadcast.name == 0)
   {
      broadcast.name = name;
   }
   if (broadcast.header.schema.type == 0)
   {
      broadcast.header.schema.type = name;
   }
   broadcast.header.isValid = schema(broadcast.header.schema);
   broadcast.body.isValid = schema(broadcast.body.schema);
}

module.exports.Broadcasts = broadcasts;
