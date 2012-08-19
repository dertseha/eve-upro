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
               jumpGates:
               {
                  inUse: Boolean
               },
               jumpDrive:
               {
                  inUse: Boolean,
                  range: Number
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
