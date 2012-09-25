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
               corporations: Array.of(Number),
               alliances: Array.of(Number)
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
               route: Array.of(context.commonSchemata.routeEntrySchema)
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
               solarSystemIds: Array.of(Number),
               ignore: Boolean
            },
            isValid: null
         }
      },

      /**
       * Set the jump bridges routing capability
       */
      SetRoutingCapabilityJumpBridges:
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
       * Set the wormholes routing capability
       */
      SetRoutingCapabilityWormholes:
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
       * Creates a new group
       */
      CreateGroup:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               data: context.commonSchemata.groupSchema
            },
            isValid: null
         }
      },

      DestroyGroup:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               id: context.commonSchemata.uuidSchema
            },
            isValid: null
         }
      },

      /**
       * Updates a group
       */
      UpdateGroup:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               id: context.commonSchemata.uuidSchema,
               data:
               {
                  '?name': String
               }
            },
            isValid: null
         }
      },

      AddGroupOwner:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body: context.commonSchemata.getStandardSharingBodyDefinition()
      },

      RemoveGroupOwner:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body: context.commonSchemata.getStandardSharingBodyDefinition()
      },

      AddGroupShares:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body: context.commonSchemata.getStandardSharingBodyDefinition()
      },

      RemoveGroupShares:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body: context.commonSchemata.getStandardSharingBodyDefinition()
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
               id: context.commonSchemata.groupIdType
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
               id: context.commonSchemata.groupIdType
            },
            isValid: null
         }
      },

      BanGroupMembers:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               id: context.commonSchemata.groupIdType,
               characters: Array.of(Number)
            },
            isValid: null
         }
      },

      UnbanGroupMembers:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               id: context.commonSchemata.groupIdType,
               characters: Array.of(Number)
            },
            isValid: null
         }
      },

      /**
       * Modify properties about a location status group
       */
      ModifyCharacterLocationStatusGroup:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               groupId: context.commonSchemata.groupIdType,
               '?sendLocation': Boolean,
               '?displayLocation': Boolean
            },
            isValid: null
         }
      },

      /**
       * Creates a new jump corridor
       */
      CreateJumpCorridor:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               data: context.commonSchemata.jumpCorridorSchema
            },
            isValid: null
         }
      },

      DestroyJumpCorridor:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               id: context.commonSchemata.uuidSchema
            },
            isValid: null
         }
      },

      /**
       * Updates a jump corridor
       */
      UpdateJumpCorridor:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               id: context.commonSchemata.uuidSchema,
               data:
               {
                  '?name': String
               }
            },
            isValid: null
         }
      },

      AddJumpCorridorOwner:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body: context.commonSchemata.getStandardSharingBodyDefinition()
      },

      RemoveJumpCorridorOwner:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body: context.commonSchemata.getStandardSharingBodyDefinition()
      },

      AddJumpCorridorShares:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body: context.commonSchemata.getStandardSharingBodyDefinition()
      },

      RemoveJumpCorridorShares:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body: context.commonSchemata.getStandardSharingBodyDefinition()
      },

      /**
       * Sets the active route.
       */
      SetActiveRoute:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               route: Array.of(context.commonSchemata.routeEntrySchema)
            },
            isValid: null
         }
      },

      /**
       * Creates a new route
       */
      CreateRoute:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               data: context.commonSchemata.routeSchema
            },
            isValid: null
         }
      },

      DestroyRoute:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               id: context.commonSchemata.uuidSchema
            },
            isValid: null
         }
      },

      /**
       * Updates a route
       */
      UpdateRoute:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               id: context.commonSchemata.uuidSchema,
               data:
               {
                  '?name': String,
                  '?route': Array.of(context.commonSchemata.routeEntrySchema)
               }
            },
            isValid: null
         }
      },

      AddRouteOwner:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body: context.commonSchemata.getStandardSharingBodyDefinition()
      },

      RemoveRouteOwner:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body: context.commonSchemata.getStandardSharingBodyDefinition()
      },

      AddRouteShares:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body: context.commonSchemata.getStandardSharingBodyDefinition()
      },

      RemoveRouteShares:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body: context.commonSchemata.getStandardSharingBodyDefinition()
      },

      /**
       * A reject message requests that the sending user wants to remove all shares from the described object, even if
       * not owner. Shares eligible to be removed this way:
       * <ul>
       * <li>specifically for the character</li>
       * <li>for the same corporation/alliance</li>
       * <li>for any group for which the sender is an owner</li>
       * </ul>
       */
      RejectSharedObject:
      {
         name: 0,
         header: getStandardHeaderDefinition(),
         body:
         {
            schema:
            {
               objectType: String,
               id: context.commonSchemata.uuidSchema
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
