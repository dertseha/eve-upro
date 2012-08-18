(function(context)
{
   /**
    * @returns a standard header definition
    */
   function getStandardHeaderDefinition()
   {
      var definition =
      {
         schema:
         {
            type: null,
            sessionId: String
         },
         isValid: null
      };

      return definition;
   }

   var clientRequests =
   {
      /**
       * Sent periodically by a connected client, this request serves as a keep-alive message and also lets the system
       * know of the current IGB headers (such as location, ...)
       */
      Status:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema: {},
            isValid: null
         }
      },

      /**
       * Set the currently active galaxy (for the view).
       */
      SetActiveGalaxy:
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
       * Sets the route of the autopilot.
       */
      SetAutopilotRoute:
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
       * Changes an ignored solar system
       */
      SetIgnoredSolarSystem:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               solarSystemId: Number,
               ignore: Boolean
            },
            isValid: null
         }
      },

      /**
       * Set the jump gates routing capability
       */
      SetRoutingCapabilityJumpGates:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               inUse: Boolean
            },
            isValid: null
         }
      },

      /**
       * Set the jump drive routing capability
       */
      SetRoutingCapabilityJumpDrive:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               '?inUse': Boolean,
               '?range': Number
            },
            isValid: null
         }
      },

      /**
       * Sets data of a routing rule
       */
      SetRoutingRuleData:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               name: String,
               '?inUse': Boolean,
               '?parameter': Number
            },
            isValid: null
         }
      },

      /**
       * Sets the index of a routing rule (priority)
       */
      SetRoutingRuleIndex:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               name: String,
               index: Number
            },
            isValid: null
         }
      }
   };

   for ( var name in clientRequests)
   {
      var request = clientRequests[name];

      request.name = name;
      request.header.schema.type = name;
   }
   context.namespace.clientRequests = clientRequests;

})((typeof module !== 'undefined') ?
{
   namespace: module.exports,
   commonSchemata: require('./CommonSchemata.js')
} :
{
   namespace: upro.data,
   commonSchemata: upro.data
});
