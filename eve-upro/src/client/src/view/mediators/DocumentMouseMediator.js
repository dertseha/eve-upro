/**
 * A mediator that handles the mouse on document level. It holds a PointerOperationRegistry bound to a mouse listener on
 * the document. It also listens to SetUserInterfaceVisible/Invisible notifications. When the UI is visible, the mouse
 * capturing needs to be disabled - otherwise no mouse events will come through to the UI.
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
   },

   onNotifySetUserInterfaceVisible: function()
   {
      this.mouseListener.stopObserving();
   },

   onNotifySetUserInterfaceInvisible: function()
   {
      this.mouseListener.startObserving();
   }

});

upro.view.mediators.DocumentMouseMediator.NAME = "DocumentMouse";
