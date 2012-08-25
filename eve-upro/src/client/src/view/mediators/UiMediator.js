/**
 * The UI mediator is the central entry point for the UI overlay. Its primary purpose is to provide the basic UI panel
 * layout and the corresponding accessors.
 */
upro.view.mediators.UiMediator = Class.create(upro.view.mediators.AbstractMediator,
      {
         initialize: function($super)
         {
            $super(upro.view.mediators.UiMediator.NAME, null);

            this.paperContextByPanelId = {};
            this.menuContextByPanelId = {};
            this.menuEntriesByPath = {};
            this.baseViewsByPanelId = {};

            var panelIds = [ "wList", "eList", "nwCtrl", "swCtrl", "neCtrl", "seCtrl" ];
            var self = this;
            panelIds.forEach(function(panelId)
            {
               self.baseViewsByPanelId[panelId] = {};
            });
         },

         onRegister: function()
         {
            var context = new upro.sys.ResizableContextWindow("ui");
            var layout = new upro.view.UiPanelLayout(context);

            this.setViewComponent(layout);

            this.createPaperContext("westBar");
            this.setupCenterContext();

            // Be sure to hide the UI AFTER creating all the paper context; FireFox turns the whole page black otherwise
            $("ui").hide();
         },

         /**
          * To be used when the visible UI should blur the layers behind it
          */
         setBaseBlur: function()
         {
            this.getViewComponent().setBaseBlur();
         },

         /**
          * Shows or hides the UI layer.
          * 
          * @param visible boolean whether to display the UI
          */
         setVisible: function(visible)
         {
            var temp = $("ui");

            if (visible)
            {
               temp.show();
               this.onResize();
               for ( var panelId in this.baseViewsByPanelId)
               {
                  var baseViews = this.baseViewsByPanelId[panelId];

                  for ( var viewId in baseViews)
                  {
                     var viewEntry = baseViews[viewId];

                     viewEntry.view.parent().layout();
                  }
               }
            }
            else
            {
               temp.hide();
            }
         },

         setSubMenu: function(menuPath, menuName, index, iconPath, label)
         {
            var paperContext = this.getPaperContext("center");
            var iconCreatorFactory = new upro.hud.IconCreatorFactory(paperContext, iconPath);
            var baseMenu = this.menuEntriesByPath[menuPath];
            var menuEntry =
            {
               radialMenu: baseMenu.radialMenu.setSubMenu(index, iconCreatorFactory.getIconCreator(), label)
            };

            this.menuEntriesByPath[menuPath + '.' + menuName] = menuEntry;
         },

         setMenuCommand: function(menuPath, index, iconPath, commandAdapter)
         {
            var paperContext = this.getPaperContext("center");
            var iconCreatorFactory = new upro.hud.IconCreatorFactory(paperContext, iconPath);
            var baseMenu = this.menuEntriesByPath[menuPath];

            baseMenu.radialMenu.setCommand(index, iconCreatorFactory.getIconCreator(), commandAdapter);
         },

         setBaseView: function(panelId, menuPath, index, iconPath, label, viewId, view)
         {
            var baseViews = this.baseViewsByPanelId[panelId];
            var viewEntry =
            {
               iconPath: iconPath,
               label: label,
               commandAdapter: new upro.hud.SimpleCommandAdapter(this.showBaseView.bind(this, panelId, viewId), label),
               view: view
            };

            view.visible(false);
            baseViews[viewId] = viewEntry;
            this.setMenuCommand(menuPath, index, iconPath, viewEntry.commandAdapter);
         },

         showBaseView: function(panelId, viewId)
         {
            var baseViews = this.baseViewsByPanelId[panelId];

            for ( var otherId in baseViews)
            {
               this.setViewVisible(panelId, otherId, false);
            }
            this.setViewVisible(panelId, viewId, true);
            this.cancelOpenMenus();

            {
               var viewEntry = this.baseViewsByPanelId[panelId][viewId];

               this.setMenuButtonData(panelId, viewEntry.iconPath, viewEntry.label);
            }
         },

         setViewVisible: function(panelId, viewId, visible)
         {
            var viewEntry = this.baseViewsByPanelId[panelId][viewId];

            viewEntry.view.visible(visible);
            viewEntry.commandAdapter.setActive(visible);
         },

         createPaperContext: function(panelId)
         {
            var element = $(panelId);
            var paper = new Raphael(element, "100%", "100%");
            var context =
            {
               paper: paper
            };

            this.paperContextByPanelId[panelId] = context;
         },

         getPaperContext: function(panelId)
         {
            return this.paperContextByPanelId[panelId];
         },

         getRescaleFunction: function(xScaler, yScaler)
         {
            var rescaleFunc = function(baseValues, dimension)
            {
               var viewCoord =
               {
                  x: xScaler(baseValues.x, dimension.width),
                  y: yScaler(baseValues.y, dimension.height)
               };

               return viewCoord;
            };

            return rescaleFunc;
         },

         setupCenterContext: function()
         {
            var panelId = "center";

            this.createPaperContext(panelId);
            var paperContext = this.getPaperContext(panelId);

            var funcScaleNone = function(baseValue, dimensionValue)
            {
               return baseValue;
            };
            var funcScaleByDimension = function(baseValue, dimensionValue)
            {
               return baseValue * dimensionValue;
            };
            var funcScaleByOffset = function(baseValue, dimensionValue)
            {
               return dimensionValue - baseValue;
            };
            var sideButtonBaseValues =
            {
               x: upro.hud.Button.getOffset[0](0).x,
               y: 0.5
            };
            var westControlButtonBaseValues =
            {
               x: 0.25,
               y: upro.hud.Button.getOffset[0](0).x + 1
            };
            var eastControlButtonBaseValues =
            {
               x: 0.75,
               y: upro.hud.Button.getOffset[0](0).x + 1
            };

            { // west menu
               var rescaleFunc = this.getRescaleFunction(funcScaleNone, funcScaleByDimension);

               this.createMenuContext("wList", paperContext, sideButtonBaseValues, upro.res.menu.IconData.Left,
                     rescaleFunc);

            }
            { // east menu
               var rescaleFunc = this.getRescaleFunction(funcScaleByOffset, funcScaleByDimension);

               this.createMenuContext("eList", paperContext, sideButtonBaseValues, upro.res.menu.IconData.Right,
                     rescaleFunc);
            }
            { // northwest menu
               var rescaleFunc = this.getRescaleFunction(funcScaleByDimension, funcScaleNone);

               this.createMenuContext("nwCtrl", paperContext, westControlButtonBaseValues, upro.res.menu.IconData.Up,
                     rescaleFunc);
            }
            { // southwest menu
               var rescaleFunc = this.getRescaleFunction(funcScaleByDimension, funcScaleByOffset);

               this.createMenuContext("swCtrl", paperContext, westControlButtonBaseValues, upro.res.menu.IconData.Down,
                     rescaleFunc);
            }
            { // northeast menu
               var rescaleFunc = this.getRescaleFunction(funcScaleByDimension, funcScaleNone);

               this.createMenuContext("neCtrl", paperContext, eastControlButtonBaseValues, upro.res.menu.IconData.Up,
                     rescaleFunc);
            }
            { // southeast menu
               var rescaleFunc = this.getRescaleFunction(funcScaleByDimension, funcScaleByOffset);

               this.createMenuContext("seCtrl", paperContext, eastControlButtonBaseValues, upro.res.menu.IconData.Down,
                     rescaleFunc);
            }

            window.addEventListener("resize", this.onResize.bind(this), false);
            this.onResize(); // repositions and shows all menu buttons
         },

         /**
          * Creates a menu context for a panel
          * 
          * @param paperContext paper context the menu shall live in
          * @param baseCoord the basic coordinate information
          * @param iconPath path to the radial menu icon
          * @param rescaleFunc function for rescaling the actual view coordinates from the base coordinates
          * @returns menu context object
          */
         createMenuContext: function(panelId, paperContext, baseCoord, iconPath, rescaleFunc)
         {
            var menuContext =
            {
               baseCommand: null,
               baseMenu: null,
               radialMenu: null,
               radialMenuContext: null,
               baseCoord: baseCoord,
               rescaleFunc: rescaleFunc,
               viewCoord: null
            };
            var iconCreatorFactory = new upro.hud.IconCreatorFactory(paperContext, iconPath);
            var iconCreator = iconCreatorFactory.getIconCreator();
            var self = this;

            menuContext.baseCommand = new upro.hud.SimpleCommandAdapter(function()
            {
               self.cancelOpenMenus();
               menuContext.baseMenu.hide();
               menuContext.radialMenuContext = new upro.hud.RadialMenuContext(menuContext.radialMenu, paperContext,
                     menuContext.viewCoord);
               menuContext.radialMenu.show(menuContext.radialMenuContext);
            }, "");
            menuContext.baseMenu = new upro.hud.MenuEntry(null, menuContext.baseCommand);
            menuContext.radialMenu = new upro.hud.RadialMenu(iconCreator, function()
            {
               menuContext.radialMenuContext = null;
               menuContext.radialMenu.hide();
               menuContext.baseMenu.show(paperContext, menuContext.viewCoord.x, menuContext.viewCoord.y);
            });

            this.menuContextByPanelId[panelId] = menuContext;
            this.menuEntriesByPath[panelId] =
            {
               radialMenu: menuContext.radialMenu
            };
         },

         cancelOpenMenus: function()
         {
            for ( var panelId in this.menuContextByPanelId)
            {
               var menuContext = this.menuContextByPanelId[panelId];

               if (menuContext.radialMenuContext)
               {
                  menuContext.radialMenuContext.cancel();
               }
            }
         },

         /**
          * Sets the data for a menu button. Recreates the button to set icon and label information.
          * 
          * @param panelId the ID of the menu button to change
          * @param iconPath new icon path
          * @param label new label
          */
         setMenuButtonData: function(panelId, iconPath, label)
         {
            var paperContext = this.getPaperContext("center");
            var menuContext = this.menuContextByPanelId[panelId];
            var iconCreatorFactory = new upro.hud.IconCreatorFactory(paperContext, iconPath);
            var iconCreator = iconCreatorFactory.getIconCreator();

            menuContext.baseMenu.hide();
            menuContext.baseMenu = new upro.hud.MenuEntry(iconCreator, menuContext.baseCommand);
            menuContext.baseCommand.setLabel(label);
            menuContext.baseMenu.show(paperContext, menuContext.viewCoord.x, menuContext.viewCoord.y);
         },

         /**
          * Resize handler. Ensures that all menus are repositioned where they belong to.
          */
         onResize: function()
         {
            var paperContext = this.getPaperContext("center");
            var element = $("center");
            var dimension = element.getDimensions();

            for ( var panelId in this.menuContextByPanelId)
            {
               var menuContext = this.menuContextByPanelId[panelId];

               if (menuContext.radialMenuContext)
               {
                  menuContext.radialMenuContext.cancel();
               }
               menuContext.baseMenu.hide();
               menuContext.viewCoord = menuContext.rescaleFunc(menuContext.baseCoord, dimension);
               menuContext.baseMenu.show(paperContext, menuContext.viewCoord.x, menuContext.viewCoord.y);
            }
         }

      });

upro.view.mediators.UiMediator.NAME = "UserInterface";
