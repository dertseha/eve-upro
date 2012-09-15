(function(context)
{
   var standardHeaderDefinition =
   {
      schema:
      {
         type: String
      },
      isValid: null
   };

   /**
    * @returns a standard header definition
    */
   function getStandardHeaderDefinition()
   {
      return standardHeaderDefinition;
   }

   var characterInfoSchema =
   {
      characterId: Number,
      characterName: String,
      corporationId: Number,
      corporationName: String
   };
   var routingRuleSchema =
   {
      index: Number,
      inUse: Boolean,
      parameter: Number
   };
   var groupDataSchema =
   {
      name: String,
      owner: context.commonSchemata.groupOwnerSchema
   };
   var groupMemberSchema = Number;
   var bodySchema =
   {
      id: Number,
      name: String
   };

   var clientBroadcastEvents =
   {
      /**
       * Selects amongst all connected (and trusted) IGB connections one to control the client
       */
      CharacterClientControlSelection:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               active: Boolean
            },
            isValid: null
         }
      },

      /**
       * The result of a previous find body request
       */
      FindBodyResult:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               query:
               {
                  searchText: String
               },
               characters: Array.of(bodySchema),
               corporations: Array.of(bodySchema)
            },
            isValid: null
         }
      },

      /**
       * The reply to a previous GetNameOfBody request
       */
      GetNameOfBodyReply:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               characters: Array.of(bodySchema),
               corporations: Array.of(bodySchema)
            },
            isValid: null
         }
      },

      /**
       * Sent by the location service when the currently known location of a character changed (becomes known)
       */
      CharacterLocationStatus:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               characterInfo: characterInfoSchema,
               '?solarSystemId': Number
            },
            isValid: null
         }
      },

      /**
       * Notifies the location status group settings for a specific group the character is in. When the character leaves
       * a group, its settings are automatically reset (removed and set to default).
       */
      CharacterLocationStatusGroupSettings:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               groupId: context.commonSchemata.groupIdType,
               sendLocation: Boolean,
               displayLocation: Boolean
            },
            isValid: null
         }
      },

      /**
       * Sent when the currently active galaxy has been changed.
       */
      CharacterActiveGalaxy:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               galaxyId: Number
            },
            isValid: null
         }
      },

      /**
       * Notifies the current autopilot route of the character
       */
      CharacterAutopilotRoute:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               route: Array.of(context.commonSchemata.routeSchema)
            },
            isValid: null
         }
      },

      /**
       * Which route index the character is next
       */
      CharacterAutopilotRouteIndex:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               nextRouteIndex: Number.min(-1)
            },
            isValid: null
         }
      },

      /**
       * The list of currently ignored solar systems for a character
       */
      CharacterIgnoredSolarSystems:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               ignoredSolarSystems: Array.of(Number)
            },
            isValid: null
         }
      },

      /**
       * The current routing capabilities of a character
       */
      CharacterRoutingCapabilities:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               jumpBridges:
               {
                  inUse: Boolean
               },
               jumpGates:
               {
                  inUse: Boolean
               },
               jumpDrive:
               {
                  inUse: Boolean,
                  range: Number
               },
               wormholes:
               {
                  inUse: Boolean
               }
            },
            isValid: null
         }
      },

      /**
       * The current routing rules of a character
       */
      CharacterRoutingRules:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               minSecurity: routingRuleSchema,
               maxSecurity: routingRuleSchema,
               jumps: routingRuleSchema,
               jumpFuel: routingRuleSchema
            },
            isValid: null
         }
      },

      /**
       * Notifies the list of added or removed members of a group. When members are added, the group data is also
       * transmitted to allow new members to know about the group.
       */
      GroupMembership:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               groupId: context.commonSchemata.groupIdType,
               '?added':
               {
                  groupData: groupDataSchema,
                  members: Array.of(groupMemberSchema)
               },
               '?removed':
               {
                  members: Array.of(groupMemberSchema)
               }
            },
            isValid: null
         }
      },

      /**
       * Notifies the current list of advertisements
       */
      GroupAdvertisementList:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               groupId: context.commonSchemata.groupIdType,
               interest: Array.of(context.commonSchemata.groupAdvertisementInterestSchema)
            },
            isValid: null
         }
      },

      /**
       * Notifies the advertisement of a group. If the optional group data is absent, the advertisement is revoked for
       * the receiver.
       */
      GroupAdvertisement:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               groupId: context.commonSchemata.groupIdType,
               '?groupData': groupDataSchema
            },
            isValid: null
         }
      },

      /**
       * Info message about the current jump corridor entry
       */
      JumpCorridorEntry:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               solarSystemId: Number,
               jumpType: String
            },
            isValid: null
         }
      },

      /**
       * Informs about the current state of a jump corridor. If the 'data' field is missing, the corridor is destroyed
       */
      JumpCorridorInfo:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               id: context.commonSchemata.uuidSchema,
               '?data': context.commonSchemata.jumpCorridorSchema
            },
            isValid: null
         }
      },

      JumpCorridorOwner:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body: context.commonSchemata.getStandardSharingBodyDefinition()
      },

      JumpCorridorShares:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body: context.commonSchemata.getStandardSharingBodyDefinition()
      }
   };

   for ( var name in clientBroadcastEvents)
   {
      var event = clientBroadcastEvents[name];

      event.name = name;
   }
   context.namespace.clientBroadcastEvents = clientBroadcastEvents;

})((typeof module !== 'undefined') ?
{
   namespace: module.exports,
   commonSchemata: require('./CommonSchemata.js')
} :
{
   namespace: upro.data,
   commonSchemata: upro.data
});
