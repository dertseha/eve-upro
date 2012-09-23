/**
 * A mediator that handles the keyboard on document level. It holds a KeyboardListener bound to the dispatcher from the
 * HudSystem. It also listens to SetUserInterfaceVisible/Invisible notifications. When the UI is visible, the keyboard
 * capturing needs to be disabled - otherwise no mouse events will come through to the UI.
 */
upro.view.mediators.DocumentKeyboardMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.DocumentKeyboardMediator.NAME, null);

      this.keyListener = null;
   },

   onRegister: function()
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();

      this.keyListener = new upro.sys.KeyboardListener(hudSystem.getKeyboardHandler());
      this.setViewComponent(this.keyListener);
   },

   onNotifySetUserInterfaceVisible: function()
   {
      this.keyListener.stopObserving();
   },

   onNotifySetUserInterfaceInvisible: function()
   {
      this.keyListener.startObserving();
   }

});

upro.view.mediators.DocumentKeyboardMediator.NAME = "DocumentKeyboard";
