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
   },

   onRegister: function()
   {
      var context = new upro.sys.ResizableContextWindow("ui");
      var layout = new upro.view.UiPanelLayout(context);

      this.setViewComponent(layout);

      var pointerHandler = new upro.sys.PointerHandler();
      new upro.sys.MouseListener(pointerHandler, layout.baseTable);
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

   setVisible: function(visible)
   {
      var temp = $("ui");

      if (visible)
      {
         temp.show();
      }
      else
      {
         temp.hide();
      }
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

         this.menuContextByPanelId["westBar"] = this.createMenuContext(paperContext, sideButtonBaseValues,
               upro.res.menu.IconData.Left, rescaleFunc);

      }
      { // east menu
         var rescaleFunc = this.getRescaleFunction(funcScaleByOffset, funcScaleByDimension);

         this.menuContextByPanelId["eastBar"] = this.createMenuContext(paperContext, sideButtonBaseValues,
               upro.res.menu.IconData.Right, rescaleFunc);
      }
      { // northwest menu
         var rescaleFunc = this.getRescaleFunction(funcScaleByDimension, funcScaleNone);

         this.menuContextByPanelId["nwCtrl"] = this.createMenuContext(paperContext, westControlButtonBaseValues,
               upro.res.menu.IconData.Up, rescaleFunc);
      }
      { // southwest menu
         var rescaleFunc = this.getRescaleFunction(funcScaleByDimension, funcScaleByOffset);

         this.menuContextByPanelId["swCtrl"] = this.createMenuContext(paperContext, westControlButtonBaseValues,
               upro.res.menu.IconData.Down, rescaleFunc);
      }
      { // northeast menu
         var rescaleFunc = this.getRescaleFunction(funcScaleByDimension, funcScaleNone);

         this.menuContextByPanelId["neCtrl"] = this.createMenuContext(paperContext, eastControlButtonBaseValues,
               upro.res.menu.IconData.Up, rescaleFunc);
      }
      { // southeast menu
         var rescaleFunc = this.getRescaleFunction(funcScaleByDimension, funcScaleByOffset);

         this.menuContextByPanelId["seCtrl"] = this.createMenuContext(paperContext, eastControlButtonBaseValues,
               upro.res.menu.IconData.Down, rescaleFunc);
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
   createMenuContext: function(paperContext, baseCoord, iconPath, rescaleFunc)
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

      menuContext.baseCommand = new upro.hud.SimpleCommandAdapter(function()
      {
         menuContext.baseMenu.hide();
         menuContext.radialMenuContext = new upro.hud.RadialMenuContext(menuContext.radialMenu, paperContext,
               menuContext.viewCoord);
         menuContext.radialMenu.show(menuContext.radialMenuContext);
      }, "");
      menuContext.baseMenu = new upro.hud.MenuEntry(null, menuContext.baseCommand);
      menuContext.radialMenu = new upro.hud.RadialMenu(iconCreator, function()
      {
         menuContext.radialMenu.hide();
         menuContext.baseMenu.show(paperContext, menuContext.viewCoord.x, menuContext.viewCoord.y);
      });

      return menuContext;
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

         menuContext.radialMenu.cancel();
         menuContext.baseMenu.hide();
         menuContext.viewCoord = menuContext.rescaleFunc(menuContext.baseCoord, dimension);
         menuContext.baseMenu.show(paperContext, menuContext.viewCoord.x, menuContext.viewCoord.y);
      }
   }

});

upro.view.mediators.UiMediator.NAME = "UserInterface";
