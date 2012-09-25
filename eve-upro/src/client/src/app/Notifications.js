/**
 * An enumeration containing all the notification constants. Note: they are initialized with 0, but will be set to their
 * own name by the function below.
 */
upro.app.Notifications =
{
   /** First notification. */
   Startup: 0,
   /** Some debuggin message. Param: text */
   DebugMessage: 0,

   /** A session has been successfully created. Param: null */
   SessionLoggedIn: 0,

   /** To show the user interface */
   SetUserInterfaceVisible: 0,
   /** To hide the user interface */
   SetUserInterfaceInvisible: 0,

   /** When permission for IGB control has been changed. Param: boolean */
   ActiveInGameBrowserControlChanged: 0,

   /** The location of a character has changed. Param: charId */
   CharacterLocationStatus: 0,

   /** List of jump corridors in the universe changed */
   UniverseJumpCorridorsChanged: 0,
   /** Requests to set the active galaxy. Param: galaxyId */
   SetActiveGalaxy: 0,
   /** The active galaxy has changed. Param: galaxyId */
   ActiveGalaxyChanged: 0,
   /** The camera has been rotated a full circle */
   CameraRotatedFullCircle: 0,

   /** Requests to highlight an object */
   SetHighlightedObject: 0,
   /** Highlighted object has changed */
   HighlightedObjectChanged: 0,

   /** pointer activation in 3D scene. Param: realPos */
   ScenePointerActivation: 0,

   /** The route optimizer finished a request */
   RouteOptimizerFinished: 0,
   /** Resets the active route */
   ActiveRouteReset: 0,
   /** Recalculate the active route */
   ActiveRouteRecalculate: 0,
   /** Removes an entry from the active route. Param: SolarSystem */
   ActiveRouteRemoveEntry: 0,
   /** Add a checkpoint to the active route. Param: SolarSystem */
   ActiveRouteAddCheckpoint: 0,
   /** Add a waypoint to the active route. Param: SolarSystem */
   ActiveRouteAddWaypoint: 0,
   /** The set-up of the active route has changed. */
   ActiveRoutePathChanged: 0,
   /** Sends the active route to the autopilot */
   ActiveRouteSetAutopilot: 0,

   /** Notified when the list of ignored solar systems changed. Param: Id[] */
   UserIgnoredSolarSystemsChanged: 0,
   /** Have a system change its ignored status. Param: SolarSystem */
   UserIgnoredSolarSystemIgnoreToggle: 0,
   /** Set the ignore state for a list of systems */
   UserIgnoredSolarSystemsSetIgnoreState: 0,

   /** Notified when the routing rules have been changed */
   UserRoutingRulesChanged: 0,
   /** User routing rules: Toggle. Param: RuleType */
   UserRoutingRuleToggle: 0,
   /** User routing rules: More. Param: RuleType */
   UserRoutingRuleMore: 0,
   /** User routing rules: Less. Param: RuleType */
   UserRoutingRuleLess: 0,
   /** User routing rules: order up. Param: RuleType */
   UserRoutingRuleUp: 0,
   /** User routing rules: order down. Param: RuleType */
   UserRoutingRuleDown: 0,

   /** User routing capabilities changed */
   UserRoutingCapabilitiesChanged: 0,
   /** User routing capability jump bridge toggle */
   UserRoutingCapJumpBridgesToggle: 0,
   /** User routing capability jump gate toggle */
   UserRoutingCapJumpGatesToggle: 0,
   /** User routing capability jump drive toggle */
   UserRoutingCapJumpDriveToggle: 0,
   /** User routing capability jump drive range step. Param: Boolean whether to increment */
   UserRoutingCapJumpDriveRangeStep: 0,
   /** User routing capability wormhole toggle */
   UserRoutingCapWormholesToggle: 0,

   /** Event when the entry system for a new corridor has been set */
   NewCorridorPreparationChanged: 0,
   /** Sets the exit system for a new corridor. Param: SolarSystem */
   NewCorridorSetExit: 0,
   /** Prepares a new corridor of type wormhole. Param: SolarSystem */
   NewCorridorPrepareDynamicWormhole: 0,
   /** Prepares a new corridor of type wormhole. Param: SolarSystem */
   NewCorridorPrepareStaticWormhole: 0,
   /** Prepares a new corridor of type jump bridge. Param: SolarSystem */
   NewCorridorPrepareJumpBridge: 0,

   /** A new route for the autopilot was received */
   AutopilotRouteChanged: 0,
   /** The index of the next route entry has changed */
   AutopilotNextRouteIndexChanged: 0,

   /** Creation of a group has been requested */
   GroupCreateRequest: 0,
   /** notification about the change of the group list */
   GroupListChanged: 0,
   /** notification about the change of group data */
   GroupDataChanged: 0,
   /** List of members changed */
   GroupMemberListChanged: 0,
   /** Group selection request */
   GroupSelectionRequest: 0,
   /** Group selected */
   GroupSelected: 0,
   /** Group join request */
   GroupJoinRequest: 0,
   /** Group leave request */
   GroupLeaveRequest: 0,
   /** Group destroy request */
   GroupDestroyRequest: 0,
   /** request to ban group members */
   BanGroupMembersRequest: 0,
   /** request to unban group members */
   UnbanGroupMembersRequest: 0,

   /** List of known characters has changed */
   KnownCharactersChanged: 0,
   /** List of known corporations has changed */
   KnownCorporationsChanged: 0,
   /** List of known alliances has changed */
   KnownAlliancesChanged: 0,
   /** request to find bodies by name */
   FindBodyByNameRequest: 0,
   /** result of a body search */
   FindBodyResult: 0,

   /** list of location status groups changed */
   LocationStatusGroupListChanged: 0,
   /** Modify the settings of a location status group */
   ModifyLocationStatusGroupSettings: 0,
   /** List of characters in a solar system has changed */
   CharacterListInSolarSystemChanged: 0,
   /** List of displayed characters has changed */
   LocationStatusDisplayListChanged: 0,

   /** Generic notification about a changed shared object */
   SharedObjectDataChanged: 0,
   /** Request to add owner to a shared object */
   SharedObjectAddOwnerRequest: 0,
   /** Request to remove owner of a shared object */
   SharedObjectRemoveOwnerRequest: 0,
   /** Request to add shares to a shared object */
   SharedObjectAddSharesRequest: 0,
   /** Request to remove shares of a shared object */
   SharedObjectRemoveSharesRequest: 0,

   /** List of jump corridors changed */
   JumpCorridorListChanged: 0,
   /** Data of one jump corridor changed */
   JumpCorridorDataChanged: 0,
   /** Group selection request */
   JumpCorridorSelectionRequest: 0,
   /** Group selected */
   JumpCorridorSelected: 0,
   /** Request to update a jump corridor */
   UpdateJumpCorridorRequest: 0,
   /** Request to destroy a jump corridor */
   DestroyJumpCorridorRequest: 0,

   /** Request to create a new route from the active one */
   ActiveRouteCreateNewRouteRequest: 0,
   /** Request to update an existing route from the active one */
   ActiveRouteUpdateRouteRequest: 0,
   /** Request to set the active route */
   SetActiveRouteRequest: 0,

   /** Request to select a route */
   RouteSelectionRequest: 0,
   /** Selection status of the current route */
   RouteSelected: 0,
   /** List change of the routes */
   RouteListChanged: 0,
   /** Data change of one of the routes */
   RouteDataChanged: 0,
   /** Request to destroy a route */
   DestroyRouteRequest: 0,

   /** Request to reject a shared object */
   RejectSharedObjectRequest: 0,

   /** A request to select a specific solar system */
   SelectSolarSystem: 0
};

/**
 * Iterate through all entries in the enumeration and set the value to the id itself. That way, the values can be
 * initialized with just one char, but will have a human readable string during runtime.
 */
(function()
{
   for ( var notifyName in upro.app.Notifications)
   {
      upro.app.Notifications[notifyName] = notifyName;
   }
})();
