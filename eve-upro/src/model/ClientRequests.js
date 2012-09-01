(function(context)
{
   var standardHeaderDefinition =
   {
      schema:
      {
         type: String,
         sessionId: String
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

   var clientRequests =
   {
      /**
       * Sent periodically by a connected client, this request serves as a keep-alive message and also lets the system
       * know of the current IGB headers (such as location, ...). This request is not forwarded to the bus; Instead,
       * EveStatusUpdateRequest is broadcasted.
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
       * Finds bodies by (parts of) their name
       */
      FindBodiesByName:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               searchText: String
            },
            isValid: null
         }
      },

      /**
       * Requests the name of a certain body
       */
      GetNameOfBody:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               characters: Array.of(Number),
               corporations: Array.of(Number)
            },
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
      },

      /**
       * Leave a group of which the sender is a member
       */
      LeaveGroup:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               groupId: context.commonSchemata.groupIdType
            },
            isValid: null
         }
      },

      /**
       * Join a group for which the sender has an advertisement
       */
      JoinGroup:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               groupId: context.commonSchemata.groupIdType
            },
            isValid: null
         }
      },

      /**
       * Create a new group
       */
      CreateGroup:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               name: String
            },
            isValid: null
         }
      },

      /**
       * Destroy a group
       */
      DestroyGroup:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               groupId: context.commonSchemata.groupIdType
            },
            isValid: null
         }
      },

      AdvertiseGroup:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               groupId: context.commonSchemata.groupIdType,
               interest: Array.of([
               {
                  scope: 'Character',
                  id: Number
               },
               {
                  scope: 'Corporation',
                  id: Number
               } ])
            },
            isValid: null
         }
      }
   };

   for ( var name in clientRequests)
   {
      var request = clientRequests[name];

      request.name = name;
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
