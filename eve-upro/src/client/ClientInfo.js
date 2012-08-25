var path = require('path');

exports.header = "/*\n" + " * Copyright (c) 2011-2012 Christian Haas\n" + " *\n"
      + " * This software is provided 'as-is', without any express or implied\n"
      + " * warranty. In no event will the authors be held liable for any damages\n"
      + " * arising from the use of this software.\n" + " *\n"
      + " * Permission is granted to anyone to use this software for any purpose,\n"
      + " * including commercial applications, and to alter it and redistribute it\n"
      + " * freely, subject to the following restrictions:\n" + " *\n"
      + " *    1. The origin of this software must not be misrepresented; you must not\n"
      + " *    claim that you wrote the original software. If you use this software\n"
      + " *    in a product, an acknowledgment in the product documentation would be\n"
      + " *    appreciated but is not required.\n" + " *\n"
      + " *    2. Altered source versions must be plainly marked as such, and must not be\n"
      + " *    misrepresented as being the original software.\n" + " *\n"
      + " *    3. This notice may not be removed or altered from any source\n" + " *    distribution.\n" + " */\n";

exports.sourceFiles = [];

(function()
{
   var shareBase = '../../model/';

   var sourceFiles = [ //
   'upro.js', //
   'Uuid.js', //

   'sys/sys.js', //
   'sys/AnimFrame.js', //
   'sys/ResizableContext.js', //
   'sys/ResizableContextWindow.js', //
   'sys/Time.js', //
   'sys/Timer.js', //
   'sys/KeyboardListener.js', //
   'sys/KeyboardHandler.js', //
   'sys/KeyboardDispatcher.js', //
   'sys/MouseListener.js', //
   'sys/PointerHandler.js', //
   'sys/PointerOperation.js', //
   'sys/PointerOperationRegistry.js', //

   'eve/eve.js', //
   'eve/Util.js', //
   'eve/NullInGameBrowser.js', //
   'eve/RealInGameBrowser.js', //
   'eve/ThrottledInGameBrowser.js', //

   'navigation/navigation.js', //
   'navigation/IdentifiedObjectHolder.js', //
   'navigation/Universe.js', //
   'navigation/Galaxy.js', //
   'navigation/Region.js', //
   'navigation/Constellation.js', //
   'navigation/SolarSystem.js', //
   'navigation/JumpType.js', //
   'navigation/JumpCorridor.js', //
   'navigation/JumpPortal.js', //
   'navigation/SystemRouteEntry.js', //

   'navigation/finder/finder.js', //
   'navigation/finder/PathFinder.js', //
   'navigation/finder/PathFinderCapability.js', //
   'navigation/finder/PathFinderCapabilityJumpDrive.js', //
   'navigation/finder/PathFinderCapabilityJumpGates.js', //
   'navigation/finder/PathFinderCapabilityWaypoints.js', //
   'navigation/finder/PathFinderCost.js', //
   'navigation/finder/PathFinderCostRule.js', //
   'navigation/finder/PathFinderCostRuleJumpFuel.js', //
   'navigation/finder/PathFinderCostRuleJumps.js', //
   'navigation/finder/PathFinderCostRuleMaxSecurity.js', //
   'navigation/finder/PathFinderCostRuleMinSecurity.js', //
   'navigation/finder/PathFinderFilter.js', //
   'navigation/finder/PathFinderFilterSystem.js', //
   'navigation/finder/PathFinderWaypoint.js', //
   'navigation/finder/RouteFinder.js', //
   'navigation/finder/RouteFinderSimple.js', //
   'navigation/finder/RouteFinderAbstractTSP.js', //
   'navigation/finder/RouteFinderBruteForceTSP.js', //
   'navigation/finder/RouteFinderGeneticTSP.js', //

   'scene/scene.js', //
   'scene/SceneSystem.js', //
   'scene/ShaderProgram.js', //
   'scene/RotationBuffer.js', //
   'scene/SceneObject.js', //
   'scene/Camera.js', //
   'scene/SceneRenderObject.js', //
   'scene/PickResult.js', //
   'scene/GalaxyRenderObject.js', //
   'scene/VertexBufferSegment.js', //
   'scene/TrackedProjection.js', //

   'hud/hud.js', //
   'hud/CommandAdapter.js', //
   'hud/SimpleCommandAdapter.js', //
   'hud/SubMenuCommandAdapter.js', //
   'hud/HudSystem.js', //
   'hud/Button.js', //
   'hud/IconCreatorFactory.js', //
   'hud/RadialMenuContext.js', //
   'hud/RadialMenu.js', //
   'hud/MenuEntry.js', //
   'hud/Label.js', //
   'hud/Table.js', //
   'hud/TableModel.js', //
   'hud/SimpleTableModel.js', //
   'hud/TableModelKeyboardHandler.js', //

   'data/data.js', //
   shareBase + 'CommonSchemata.js', //
   shareBase + 'ClientRequests.js', //
   shareBase + 'ClientEvents.js', //
   shareBase + 'ClientBroadcastEvents.js', //
   'data/CommunicationUplink.js', //

   'model/model.js', //
   shareBase + 'navigation/RoutingRules.js', //
   shareBase + 'navigation/RoutingCapabilities.js', //
   'model/LocationTracker.js', //
   'model/UserRoutingRule.js', //

   'model/proxies/proxies.js', //
   'model/proxies/SessionControlProxy.js', //
   'model/proxies/LocationTrackerProxy.js', //
   'model/proxies/UserSessionProxy.js', //
   'model/proxies/UserSettingsProxy.js', //
   'model/proxies/UniverseProxy.js', //
   'model/proxies/UserViewDataProxy.js', //
   'model/proxies/ActiveRouteProxy.js', //
   'model/proxies/AutopilotProxy.js', //

   'control/ctrl.js', //
   'control/commands/cmd.js', //
   'control/commands/NotifiedStartupCommand.js', //
   'control/commands/SetupModelCommand.js', //
   'control/commands/SetupViewCommand.js', //
   'control/commands/InitApplicationCommand.js', //
   'control/commands/NotifiedSetUserInterfaceVisibleCommand.js', //
   'control/commands/NotifiedSetUserInterfaceInvisibleCommand.js', //
   'control/commands/NotifiedActiveInGameBrowserControlChangedCommand.js', //
   'control/commands/NotifiedAutopilotRouteChangedCommand.js', //
   'control/commands/NotifiedAutopilotNextRouteIndexChangedCommand.js', //
   'control/commands/NotifiedCharacterLocationStatusCommand.js', //
   'control/commands/NotifiedSessionLoggedInCommand.js', //
   'control/commands/NotifiedSetActiveGalaxyCommand.js', //
   'control/commands/NotifiedSetHighlightedObjectCommand.js', //
   'control/commands/NotifiedHighlightedObjectChangedCommand.js', //
   'control/commands/NotifiedScenePointerActivationCommand.js', //
   'control/commands/NotifiedUserIgnoredSolarSystemsChangedCommand.js', //
   'control/commands/NotifiedUserIgnoredSolarSystemIgnoreToggleCommand.js', //
   'control/commands/NotifiedActiveRouteResetCommand.js', //
   'control/commands/NotifiedActiveRouteRemoveEntryCommand.js', //
   'control/commands/NotifiedActiveRouteAddWaypointCommand.js', //
   'control/commands/NotifiedActiveRouteAddCheckpointCommand.js', //
   'control/commands/NotifiedActiveRoutePathChangedCommand.js', //
   'control/commands/NotifiedActiveRouteSetAutopilotCommand.js', //
   'control/commands/NotifiedUserRoutingRulesChangedCommand.js', //
   'control/commands/NotifiedUserRoutingRuleToggleCommand.js', //
   'control/commands/NotifiedUserRoutingRuleMoreCommand.js', //
   'control/commands/NotifiedUserRoutingRuleLessCommand.js', //
   'control/commands/NotifiedUserRoutingRuleUpCommand.js', //
   'control/commands/NotifiedUserRoutingRuleDownCommand.js', //
   'control/commands/NotifiedUserRoutingCapabilitiesChangedCommand.js', //
   'control/commands/NotifiedUserRoutingCapJumpGatesToggleCommand.js', //
   'control/commands/NotifiedUserRoutingCapJumpDriveToggleCommand.js', //
   'control/commands/NotifiedUserRoutingCapJumpDriveRangeStepCommand.js', //
   'control/commands/NotifiedNewCorridorSetExitCommand.js', //
   'control/commands/NotifiedNewCorridorPrepareWormholeCommand.js', //
   'control/commands/NotifiedNewCorridorPrepareJumpBridgeCommand.js', //

   'view/view.js', //
   'view/SceneObjectRotationOperation.js', //
   'view/OrientedMoveOperation.js', //
   'view/IdlePointerOperation.js', //
   'view/UiTheme.js', //
   'view/UiPanelLayout.js', //
   'view/ZoomMoveOperation.js', //

   'view/mediators/mediators.js', //
   'view/mediators/AbstractMediator.js', //
   'view/mediators/AbstractSideButtonMediator.js', //
   'view/mediators/DocumentMouseMediator.js', //
   'view/mediators/HudMediator.js', //
   'view/mediators/InGameBrowserMediator.js', //
   'view/mediators/SceneMediator.js', //
   'view/mediators/SolarSystemHighlight.js', //
   'view/mediators/SolarSystemHighlightMediator.js', //
   'view/mediators/AbstractContextMenuMediator.js', //
   'view/mediators/SolarSystemContextMenuMediator.js', //
   'view/mediators/MainContextMenuMediator.js', //
   'view/mediators/UiMediator.js', //
   'view/mediators/HideUiSideButtonMediator.js', //
   'view/mediators/DebugPanelMediator.js', //

   'app/app.js', //
   'app/Notifications.js', //
   'app/ApplicationFacade.js', //

   'res/res.js', //

   'res/text/text.js', //
   'res/text/Util.js', //
   'res/text/Lang.js', //

   'res/eve/eve.js', //
   'res/eve/MapData.js', //
   'res/eve/IconData.js', //

   'res/menu/menu.js', //
   'res/menu/IconData.js', //

   'res/text/templates/templates.js', //
   'res/text/templates/en.js' //
   ];

   function getFilePath(fileName)
   {
      return path.normalize(__dirname + '/src/' + fileName);
   }

   sourceFiles.forEach(function(sourceFile)
   {
      exports.sourceFiles.push(getFilePath(sourceFile));
   });
})();
