/**
 * A mediator that handles the mouse on document level.
 * It holds a PointerOperationRegistry bound to a mouse listener on the document.
 */
upro.view.mediators.DocumentMouseMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.DocumentMouseMediator.NAME, null);
   },

   onRegister: function()
   {
      var opRegistry = new upro.sys.PointerOperationRegistry();

      this.mouseListener = new upro.sys.MouseListener(opRegistry);

      this.setViewComponent(opRegistry);
   }

});

upro.view.mediators.DocumentMouseMediator.NAME = "DocumentMouse";
