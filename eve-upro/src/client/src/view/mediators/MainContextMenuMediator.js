/**
 * Context menu mediator for master.
 */
upro.view.mediators.MainContextMenuMediator = Class
      .create(upro.view.mediators.AbstractContextMenuMediator,
            {
               initialize: function($super)
               {
                  $super(upro.view.mediators.MainContextMenuMediator.NAME, null);
               },

               onRegister: function()
               {
                  var menu = this.getViewComponent();
                  var mediator = this;

                  { // routing
                     var routingMenu = menu.setSubMenu(0, this.createVectorIcon.bind(this,
                           upro.res.menu.IconData.Routing), upro.res.text.Lang.format("routing.menuLabel"));

                     this.commandActiveRouteReset = new upro.hud.SimpleCommandAdapter(function()
                     {
                        mediator.notify(upro.app.Notifications.ActiveRouteReset);
                        mediator.cancel();
                     }, upro.res.text.Lang.format("routing.clearRoute"));
                     routingMenu.setCommand(3, this.createVectorIcon.bind(this, upro.res.menu.IconData.Delete),
                           this.commandActiveRouteReset);

                     this.commandActiveRouteSetAutopilot = new upro.hud.SimpleCommandAdapter(function()
                     {
                        mediator.notify(upro.app.Notifications.ActiveRouteSetAutopilot);
                        mediator.cancel();
                     }, upro.res.text.Lang.format("routing.setAutopilot"));
                     routingMenu.setCommand(1, this.createVectorIcon.bind(this, upro.res.menu.IconData.Autopilot),
                           this.commandActiveRouteSetAutopilot);

                     { // rules
                        var rulesMenu = routingMenu.setSubMenu(5, this.createVectorIcon.bind(this,
                              upro.res.menu.IconData.List), upro.res.text.Lang.format("routing.rules.menuLabel"));

                        this.ruleCommands = {};
                        this.createRoutingRuleCommandSet(rulesMenu, 0, "minSecurity",
                              upro.res.menu.IconData.MinSecurity);
                        this.createRoutingRuleCommandSet(rulesMenu, 1, "maxSecurity",
                              upro.res.menu.IconData.MaxSecurity);
                        this.createRoutingRuleCommandSet(rulesMenu, 2, "jumps", upro.res.menu.IconData.Hash);
                        this.createRoutingRuleCommandSet(rulesMenu, 5, "jumpFuel", upro.res.menu.IconData.Fuel);
                     }
                     { // capabilities
                        var capMenu = routingMenu.setSubMenu(0, this.createVectorIcon.bind(this,
                              upro.res.menu.IconData.Capabilities), upro.res.text.Lang
                              .format("routing.capabilities.menuLabel"));

                        this.commandRoutingCapJumpGates = new upro.hud.SimpleCommandAdapter(function()
                        {
                           mediator.notify(upro.app.Notifications.UserRoutingCapJumpGatesToggle);
                        });
                        capMenu.setCommand(0, this.createVectorIcon.bind(this, upro.res.menu.IconData.JumpGate),
                              this.commandRoutingCapJumpGates);

                        var driveMenu = capMenu.setSubMenu(1, this.createVectorIcon.bind(this,
                              upro.res.menu.IconData.JumpDrive), upro.res.text.Lang
                              .format("routing.caps.jumpDrive.menuLabel"));

                        this.commandRoutingCapJumpDrive = new upro.hud.SimpleCommandAdapter(function()
                        {
                           mediator.notify(upro.app.Notifications.UserRoutingCapJumpDriveToggle);
                        });
                        driveMenu.setCommand(3, this.createVectorIcon.bind(this, upro.res.menu.IconData.Power),
                              this.commandRoutingCapJumpDrive);
                        this.commandRoutingCapJumpDriveMore = new upro.hud.SimpleCommandAdapter(function()
                        {
                           mediator.notify(upro.app.Notifications.UserRoutingCapJumpDriveRangeStep, true);
                        });
                        driveMenu.setCommand(0, this.createVectorIcon.bind(this, upro.res.menu.IconData.Higher),
                              this.commandRoutingCapJumpDriveMore);
                        this.commandRoutingCapJumpDriveLess = new upro.hud.SimpleCommandAdapter(function()
                        {
                           mediator.notify(upro.app.Notifications.UserRoutingCapJumpDriveRangeStep, false);
                        });
                        driveMenu.setCommand(1, this.createVectorIcon.bind(this, upro.res.menu.IconData.Lower),
                              this.commandRoutingCapJumpDriveLess);
                     }
                  }
               },

               /**
                * Creates the command set for a routing rule. This expects that all rules have the same commands.
                * 
                * @param rulesMenu the menu to insert the submenu in
                * @param rulesMenuIndex at which index to insert
                * @param ruleType the rule type according to upro.model.UserRoutingRule
                * @param mainIcon icon to use for this rule menu
                */
               createRoutingRuleCommandSet: function(rulesMenu, rulesMenuIndex, ruleType, mainIcon)
               {
                  var menuLabel = upro.res.text.Lang.format("routing.rules.rule[" + ruleType + "].menuLabel");
                  var subMenu = rulesMenu.setSubMenu(rulesMenuIndex, this.createVectorIcon.bind(this, mainIcon),
                        menuLabel);
                  var mediator = this;

                  this.ruleCommands[ruleType] = {};

                  this.ruleCommands[ruleType].more = new upro.hud.SimpleCommandAdapter(function()
                  {
                     mediator.notify(upro.app.Notifications.UserRoutingRuleMore, ruleType);
                  });
                  subMenu.setCommand(0, this.createVectorIcon.bind(this, upro.res.menu.IconData.Higher),
                        this.ruleCommands[ruleType].more);
                  this.ruleCommands[ruleType].less = new upro.hud.SimpleCommandAdapter(function()
                  {
                     mediator.notify(upro.app.Notifications.UserRoutingRuleLess, ruleType);
                  });
                  subMenu.setCommand(1, this.createVectorIcon.bind(this, upro.res.menu.IconData.Lower),
                        this.ruleCommands[ruleType].less);

                  this.ruleCommands[ruleType].toggle = new upro.hud.SimpleCommandAdapter(function()
                  {
                     mediator.notify(upro.app.Notifications.UserRoutingRuleToggle, ruleType);
                  });
                  subMenu.setCommand(3, this.createVectorIcon.bind(this, upro.res.menu.IconData.Power),
                        this.ruleCommands[ruleType].toggle);

                  this.ruleCommands[ruleType].up = new upro.hud.SimpleCommandAdapter(function()
                  {
                     mediator.notify(upro.app.Notifications.UserRoutingRuleUp, ruleType);
                  }, upro.res.text.Lang.format("routing.rules.up"));
                  subMenu.setCommand(5, this.createVectorIcon.bind(this, upro.res.menu.IconData.Up),
                        this.ruleCommands[ruleType].up);
                  this.ruleCommands[ruleType].down = new upro.hud.SimpleCommandAdapter(function()
                  {
                     mediator.notify(upro.app.Notifications.UserRoutingRuleDown, ruleType);
                  }, upro.res.text.Lang.format("routing.rules.down"));
                  subMenu.setCommand(4, this.createVectorIcon.bind(this, upro.res.menu.IconData.Down),
                        this.ruleCommands[ruleType].down);
               },

               /** {@inheritDoc} */
               updateCommands: function()
               {
                  this.updateCommandActiveRoute();
                  this.updateCommandRoutingCapabilities();
                  this.updateCommandRoutingRules();
               },

               /**
                * Updates the commands for the active route
                */
               updateCommandActiveRoute: function()
               {
                  var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);

                  this.commandActiveRouteReset.setPossible(!activeRouteProxy.isEmpty());
               },

               updateCommandRoutingCapabilities: function()
               {
                  var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);
                  var inUse;
                  var onText = upro.res.text.Lang.format("general.on");
                  var offText = upro.res.text.Lang.format("general.off");

                  { // jump gates
                     inUse = settingsProxy.getRoutingCapJumpGatesInUse();

                     this.commandRoutingCapJumpGates.setActive(inUse);
                     this.commandRoutingCapJumpGates.setLabel(upro.res.text.Lang.format(
                           "routing.caps.jumpGates.toggle", inUse ? offText : onText));
                  }
                  { // jump drive
                     var range = settingsProxy.getRoutingCapJumpDriveRange();
                     var belowMaximum = range < upro.model.proxies.UserSettingsProxy.JumpDriveConstants.MaximumRange;
                     var aboveMinimum = range > upro.model.proxies.UserSettingsProxy.JumpDriveConstants.MinimumRange;
                     inUse = settingsProxy.getRoutingCapJumpDriveInUse();

                     this.commandRoutingCapJumpDrive.setActive(inUse);
                     this.commandRoutingCapJumpDrive.setLabel(upro.res.text.Lang.format(
                           "routing.caps.jumpDrive.toggle", inUse ? offText : onText));

                     this.commandRoutingCapJumpDriveMore.setPossible(belowMaximum);
                     this.commandRoutingCapJumpDriveMore.setLabel(belowMaximum ? upro.res.text.Lang.format(
                           "routing.caps.jumpDrive.rangeSet", range, range
                                 + upro.model.proxies.UserSettingsProxy.JumpDriveConstants.RangeStep)
                           : upro.res.text.Lang.format("routing.caps.jumpDrive.rangeLimit", range));
                     this.commandRoutingCapJumpDriveLess.setPossible(aboveMinimum);
                     this.commandRoutingCapJumpDriveLess.setLabel(aboveMinimum ? upro.res.text.Lang.format(
                           "routing.caps.jumpDrive.rangeSet", range, range
                                 - upro.model.proxies.UserSettingsProxy.JumpDriveConstants.RangeStep)
                           : upro.res.text.Lang.format("routing.caps.jumpDrive.rangeLimit", range));
                  }
               },

               /**
                * Updates the commands for the routing rules
                */
               updateCommandRoutingRules: function(rules)
               {
                  if (!rules)
                  {
                     var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

                     rules = settingsProxy.getRoutingRules();
                  }

                  for ( var i = 0; i < rules.length; i++)
                  {
                     var rule = rules[i];
                     var commandEntry = this.ruleCommands[rule.getRuleType()];

                     if (commandEntry)
                     {
                        var menuLabel = upro.res.text.Lang.format("routing.rules.rule[" + rule.getRuleType()
                              + "].menuLabel");
                        var parameter = rule.getFixedParameter();
                        var belowMaximum = rule.isBelowMaximum();
                        var aboveMinimum = rule.isAboveMinimum();

                        commandEntry.toggle.setActive(rule.getInUse());
                        commandEntry.toggle.setLabel(upro.res.text.Lang.format("routing.rules.toggle", menuLabel,
                              upro.res.text.Lang.format(rule.getInUse() ? "general.off" : "general.on")));
                        commandEntry.more.setPossible(belowMaximum);
                        commandEntry.more.setLabel(belowMaximum ? upro.res.text.Lang.format("routing.rules.rule["
                              + rule.getRuleType() + "].paramSet", parameter, rule.getFixedParameterIncremented())
                              : upro.res.text.Lang.format("routing.rules.rule[" + rule.getRuleType() + "].paramLimit",
                                    parameter));
                        commandEntry.less.setPossible(aboveMinimum);
                        commandEntry.less.setLabel(aboveMinimum ? upro.res.text.Lang.format("routing.rules.rule["
                              + rule.getRuleType() + "].paramSet", parameter, rule.getFixedParameterDecremented())
                              : upro.res.text.Lang.format("routing.rules.rule[" + rule.getRuleType() + "].paramLimit",
                                    parameter));
                        commandEntry.up.setPossible(i > 0);
                        commandEntry.down.setPossible(i < (rules.length - 1));
                     }
                  }
               },

               /** Notification handler */
               onNotifyActiveRoutePathChanged: function()
               {
                  this.updateCommandActiveRoute();
               },

               /** Notification handler */
               onNotifyUserRoutingCapabilitiesChanged: function()
               {
                  this.updateCommandRoutingCapabilities();
               },

               /** Notification handler */
               onNotifyUserRoutingRulesChanged: function(rules)
               {
                  this.updateCommandRoutingRules(rules);
               }
            });

upro.view.mediators.MainContextMenuMediator.NAME = "MainContextMenu";
