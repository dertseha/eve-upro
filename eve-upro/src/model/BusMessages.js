var schema = require('js-schema');

var commonSchemata = require('./CommonSchemata.js');
var clientRequests = require('./ClientRequests.js').clientRequests;
var clientBroadcastEvents = require('./ClientBroadcastEvents.js').clientBroadcastEvents;

var interestSchema = [
{
   scope: 'Session',
   id: String
},
{
   scope: 'Character',
   id: Number
},
{
   scope: 'Corporation',
   id: Number
},
{
   scope: 'Alliance',
   id: Number
},
{
   scope: 'Group',
   id: commonSchemata.groupIdType
} ];

var broadcasts =
{
   /**
    * Describes an EVE API request
    */
   EveApiRequest:
   {
      name: 0,
      header:
      {
         schema:
         {
            type: String,
            correlationId: Number
         },
         isValid: null
      },
      body:
      {
         schema:
         {
            apiFunctionName: String,
            parameters: undefined
         },
         isValid: null
      }
   },

   /**
    * Sent in response to a request
    */
   EveApiResponse:
   {
      name: 0,
      header:
      {
         schema:
         {
            type: String,
            correlationId: Number
         },
         isValid: null
      },
      body:
      {
         schema:
         {
            response: undefined
         },
         isValid: null
      }
   },

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
            type: String
         },
         isValid: null
      },
      body:
      {
         schema:
         {
            sessionId: String,
            responseQueue: String,
            user: commonSchemata.userSchema
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
            type: String
         },
         isValid: null
      },
      body:
      {
         schema:
         {
            sessionId: String,
            user: commonSchemata.userSchema
         },
         isValid: null
      }
   },

   /**
    * Caused periodically by clients to mark alive status of session.
    */
   SessionKeepAlive:
   {
      name: 0,
      header:
      {
         schema:
         {
            type: String,
            sessionId: String
         },
         isValid: null
      },
      body:
      {
         schema: {},
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
            type: String,
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
   },

   /**
    * This broadcast is sent by the group service component at least once for an online character.
    * 
    * When a character comes online, a message with a new syncId and finished = false will be sent. A group enabled
    * receiver must keep this syncId for this character. When GroupServiceComponent has loaded all groups the given
    * character is a member of (and has distributed corresponding membership messages), a second message is sent. This
    * second message has the same syncId and finished will be set to true.
    * 
    * The group enabled receiver can then query the character object which groups it is a member of - and any excess
    * groups the receiver believed the character to be in can safely be removed. This is done to ensure consistency for
    * the related data if the character was removed from the group while being offline.
    * 
    * Should a character immediately go offline again, before the sync state was finished, this sync is to be considered
    * discarded. A sync finished message may not be sent in this case.
    */
   CharacterGroupDataSyncState:
   {
      name: 0,
      header:
      {
         schema:
         {
            type: String
         },
         isValid: null
      },
      body:
      {
         schema:
         {
            characterId: Number,
            syncId: commonSchemata.uuidSchema,
            finished: Boolean
         },
         isValid: null
      }
   },

   /**
    * Notification by the group service component if a group was destroyed
    */
   GroupDestroyed:
   {
      name: 0,
      header:
      {
         schema:
         {
            type: String
         },
         isValid: null
      },
      body:
      {
         schema:
         {
            groupId: commonSchemata.groupIdType,
         },
         isValid: null
      }
   },

   /**
    * Notification by the group service component based on a ClientRequestRejectSharedDataObject. This message contains
    * the original request information, augmented by the verified ownership information of groups.
    */
   GroupOwnerRejectsSharedDataObject:
   {
      name: 0,
      header:
      {
         schema:
         {
            type: String,
            characterId: Number
         },
         isValid: null
      },
      body:
      {
         schema:
         {
            objectType: String,
            id: commonSchemata.uuidSchema,
            groups: Array.of(commonSchemata.groupIdType)
         },
         isValid: null
      }
   }
};

var standardClientRequestHeader =
{
   schema:
   {
      type: String,
      sessionId: String
   },
   isValid: null
};

// Register all client requests.
for ( var name in clientRequests)
{
   var request = clientRequests[name];
   var requestBroadcastName = 'ClientRequest' + name;

   broadcasts[requestBroadcastName] =
   {
      name: 0,
      header: standardClientRequestHeader,
      body: request.body
   };
}

/**
 * If the optional 'disinterest' header field is set, only those with interest but not disinterest shall receive. This
 * case is meant for data that changes its distribution groups, so 'clearance' data can be sent to removed receivers
 * while not bothering still legitimate receivers that are in several groups.
 */
var standardBroadcastEventHeader =
{
   schema:
   {
      type: String,
      interest: Array.of(interestSchema),
      '?disinterest': Array.of(interestSchema)
   },
   isValid: null
};

// Register all broadcast events.
for ( var name in clientBroadcastEvents)
{
   var event = clientBroadcastEvents[name];

   broadcasts[name] =
   {
      name: 0,
      header: standardBroadcastEventHeader,
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
   if (!broadcast.header.isValid)
   {
      broadcast.header.isValid = schema(broadcast.header.schema);
   }
   if (!broadcast.body.isValid)
   {
      broadcast.body.isValid = schema(broadcast.body.schema);
   }
}

module.exports.Broadcasts = broadcasts;
