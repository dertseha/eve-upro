/**
 * English texts
 */
upro.res.text.templates["en"] =
{
   /** General text for anything that is turned 'on' */
   "general.on": "On",
   /** General text for anything that is turned 'off' */
   "general.off": "Off",

   /** Label for an item name */
   "general.labels.itemName": "Name:",

   /** The "own corporation" predefined group */
   "predefined.groups.Corporation": "Own Corporation",

   /** Label for routing menu */
   "routing.menuLabel": "Routing",
   /** Command for clearing the route */
   "routing.clearRoute": "Clear Route",
   /** Command for setting the route to the autopilot */
   "routing.setAutopilot": "Send to autopilot",
   /** Label for routing capabilities menu */
   "routing.capabilities.menuLabel": "Capabilities",
   /** Label for routing rules menu */
   "routing.rules.menuLabel": "Routing Rules",
   /** Toggle rule on/off; 0: rule menu label, 1: on/off */
   "routing.rules.toggle": "Turn {0} {1}",
   /** Increase priority of the routing rule */
   "routing.rules.up": "Increase Priority",
   /** Decrease priority of the routing rule */
   "routing.rules.down": "Decrease Priority",

   /** Menu label for minSecurity */
   "routing.rules.rule[minSecurity].menuLabel": "Minimum Security",
   /** tip for minSecurity at limit */
   "routing.rules.rule[minSecurity].paramLimit": "Minimum Security at {0}",
   /** tip for settable minSecurity */
   "routing.rules.rule[minSecurity].paramSet": "Minimum Security at {0} - Set to {1}",

   /** Menu label for maxSecurity */
   "routing.rules.rule[maxSecurity].menuLabel": "Maximum Security",
   /** tip for maxSecurity at limit */
   "routing.rules.rule[maxSecurity].paramLimit": "Use Security below {0}",
   /** tip for settable maxSecurity */
   "routing.rules.rule[maxSecurity].paramSet": "Use Security below {0} - Set to {1}",

   /** Menu label for jumps */
   "routing.rules.rule[jumps].menuLabel": "Jump Count",
   /** tip for jumps at limit */
   "routing.rules.rule[jumps].paramLimit": "Jump Count Margin at {0}",
   /** tip for settable jumps */
   "routing.rules.rule[jumps].paramSet": "Jump Count Margin at {0} - Set to {1}",

   /** Menu label for jumpFuel */
   "routing.rules.rule[jumpFuel].menuLabel": "Jump Fuel (Distance)",
   /** tip for jumpFuel at limit */
   "routing.rules.rule[jumpFuel].paramLimit": "Distance Margin at {0}ly",
   /** tip for settable jumpFuel */
   "routing.rules.rule[jumpFuel].paramSet": "Distance Margin at {0}ly - Set to {1}ly",

   /** Toggling of jump gate capability */
   "routing.caps.jumpGates.toggle": "Turn Jump Gate Capability {0}",

   /** Toggling of jump bridge capability */
   "routing.caps.jumpBridges.toggle": "Turn Jump Bridge Capability {0}",

   /** Toggling of wormhole capability */
   "routing.caps.wormholes.toggle": "Turn Wormhole Capability {0}",

   /** jump drive menu label */
   "routing.caps.jumpDrive.menuLabel": "Jump Drive",
   /** Toggling of jump drive capability */
   "routing.caps.jumpDrive.toggle": "Turn Jump Drive Capability {0}",
   /** Jump drive range tooltip */
   "routing.caps.jumpDrive.rangeLimit": "Jump Range at {0}ly",
   /** Jump drive range tooltip */
   "routing.caps.jumpDrive.rangeSet": "Jump Range at {0}ly - Set to {1}ly",

   /** Menu label for jump corridor control */
   "corridor.menuLabel": "Jump Corridors",
   /** Menu label for specifying the exit system */
   "corridor.exit": "Set Exit",
   /** Menu label for specifying a wormhole entry */
   "corridor.entry.wormhole.static": "Static Wormhole Entry",
   /** Menu label for specifying a wormhole entry */
   "corridor.entry.wormhole.dynamic": "Dynamic Wormhole Entry",
   /** Menu label for specifying a jump bridge entry */
   "corridor.entry.jumpBridge": "Jump Bridge Entry",

   /** Add the given solar system as a checkpoint */
   "solarSystem.routing.addCheckpoint": "Add as Checkpoint",
   /** Add the given solar system as a waypoint */
   "solarSystem.routing.addWaypoint": "Add as Waypoint",
   /** Toggle the ignore status of given solar system */
   "solarSystem.routing.toggleIgnore": "Ignore Solar System",
   /** Remove the solar system from the route */
   "solarSystem.routing.remove": "Remove from Route",

   /** view menu label */
   "view.menuLabel": "View...",
   /** show the UI */
   "view.setUiVisible": "Show UI",
   /** hide the UI */
   "view.setUiInvisible": "Hide UI",

   /** Settings menu label */
   "settings.menuLabel": "Settings",

   /** Debug Panel menu label */
   "panels.debug.menuLabel": "Debug",

   /** Routes menu label */
   "routeList.menuLabel": "Routes",
   /** Autopilot Route Panel menu label */
   "panels.autopilot.route.menuLabel": "Autopilot Route",

   /** Groups menu label (list) */
   "groupList.menuLabel": "Groups",
   /** List of the groups */
   "panels.group.list.menuLabel": "Group List",
   /** Hint for the text field */
   "panels.group.list.textHint": "New Group name",

   /** List of group members */
   "panels.group.member.list.menuLabel": "Group Member List",

   /** Groups menu label (edit) */
   "groupEdit.menuLabel": "Groups",
   /** edit panel */
   "panels.group.edit.menuLabel": "Edit Group Invitations",
   /** Join a group command */
   "panels.group.edit.join": "Join",
   /** Leave a group command */
   "panels.group.edit.leave": "Leave",
   /** Create a group command */
   "panels.group.edit.create": "Create",
   /** Destroy a group command */
   "panels.group.edit.destroy": "Destroy",

   /** Search hint */
   "panels.group.edit.searchEntity.hint": "Enter Name to Search",
   /** Search command */
   "panels.group.edit.searchEntity.command": "Search...",
   /** Add invitation command */
   "panels.group.edit.addInvitation.command": "Add",
   /** Remove invitation command */
   "panels.group.edit.removeInvitation.command": "Remove",

   /** Menu Label for the map controls */
   "mapList.menuLabel": "Map Lists",

   /** Current locations of all to display */
   "panels.currentLocation.list.menuLabel": "Current Locations",

   /** Menu Label for the map controls */
   "map.menuLabel": "Map Controls",

   /** Current Location control */
   "panels.currrentLocation.menuLabel": "Current Location",
   /** Send the own location to given group */
   "panels.currentLocation.send.command": "Send Own",
   /** Display others location of given group */
   "panels.currentLocation.display.command": "Display Others",

   /** Session control panel */
   "panels.session.menuLabel": "Session Control",
   /** Logout command */
   "panels.session.logout.command": "Logout (This Browser)",

   /** menu label for jump corridor list */
   "panels.jumpCorridor.list.menuLabel": "List of Jump Corridors",

   /** Label for entry of jump corridor */
   "jumpCorridor.entryLabel": "Entry:",
   /** Label for exit of jump corridor */
   "jumpCorridor.exitLabel": "Exit:",
   /** Label for jump type of jump corridor */
   "jumpCorridor.jumpTypeLabel": "Jump Type:",

   /** Jump type name */
   "jumpCorridor.typeName.JumpGate": "Jump Gate",
   /** Jump type name */
   "jumpCorridor.typeName.JumpDrive": "Jump Drive",
   /** Jump type name */
   "jumpCorridor.typeName.JumpBridge": "Jump Bridge",
   /** Jump type name */
   "jumpCorridor.typeName.StaticWormhole": "Static Wormhole",
   /** Jump type name */
   "jumpCorridor.typeName.DynamicWormhole": "Dynamic Wormhole",

   /** menu label for jump corridor edit control */
   "panels.jumpCorridor.edit.menuLabel": "Modify Jump Corridor",
   /** button to update a jump corridor */
   "panels.jumpCorridor.edit.updateButton": "Update",
   /** button to destroy a jump corridor */
   "panels.jumpCorridor.edit.destroyButton": "Destroy",

   /** Main menu for shared object control */
   "sharedObject.menuLabel": "Shared Object Control",

   /** Hint for searching a body for sharing */
   "panels.sharedObject.edit.searchEntity.hint": "Enter Name to Search",
   /** Command label for searching */
   "panels.sharedObject.edit.searchEntity.command": "Search",
   /** Command label for adding a share */
   "panels.sharedObject.edit.addShare.command": "Share",
   /** Command label for removing a share */
   "panels.sharedObject.edit.removeShare.command": "Remove Share",
   /** Command label for setting an owner */
   "panels.sharedObject.edit.addOwner.command": "Add Owner",
   /** Command label for removing an owner */
   "panels.sharedObject.edit.removeOwner.command": "Revoke Ownership",
   /** Restricted entries (not knowing the name) */
   "panels.sharedObject.edit.restrictedBody": "Restricted",

   /** Panel for shared object interest control */
   "panels.sharedObject.interest.menuLabel": "Sharing Controls"
};
