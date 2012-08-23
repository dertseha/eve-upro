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
   },

   onRegister: function()
   {
      var context = new upro.sys.ResizableContextWindow("ui");
      var layout = new upro.view.UiPanelLayout(context);

      this.setViewComponent(layout);

      var pointerHandler = new upro.sys.PointerHandler();
      new upro.sys.MouseListener(pointerHandler, layout.baseTable);
      this.createPaperContext("westBar");

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
   }

});

upro.view.mediators.UiMediator.NAME = "UserInterface";
