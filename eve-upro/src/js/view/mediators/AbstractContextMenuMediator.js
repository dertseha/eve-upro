/**
 * This abstract mediator provides support for a context menu and
 * handes the common operations; First and foremost, creating
 * the base menu and handling its removal.
 *
 * The stored ViewComponent is the base menu.
 */
upro.view.mediators.AbstractContextMenuMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, name, iconCreator)
   {
      $super(name, new upro.hud.RadialMenu(iconCreator, this.onMenuCancel.bind(this)));

      this.activeContext = null;
      this.notifyBody = null;
   },

   /**
    * Returns the notification body set during show()
    * @return the notification body
    */
   getNotifyBody: function()
   {
      return this.notifyBody;
   },

   /**
    * Returns true if the context menu is currently shown
    * @return true if the context menu is currently shown
    */
   isVisible: function()
   {
      return this.activeContext != null;
   },

   /**
    * Requests to show the context menu at given position. If the context menu
    * is already shown, it will be cancelled first.
    * @param realPos the position to display the menu at
    * @param notifyBody the body to use for notifications
    */
   show: function(realPos, notifyBody)
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
      var menu = this.getViewComponent();
      var context = new upro.hud.RadialMenuContext(menu, hudSystem, realPos);

      this.cancel();
      this.activeContext = context;
      this.notifyBody = notifyBody;

      this.updateCommands();
      hudSystem.setActiveContextMenu(context);
      context.show();
   },

   /**
    * Cancels the context menu - if it is shown
    */
   cancel: function()
   {
      if (this.activeContext)
      {
         this.activeContext.cancel();
      }
   },

   /**
    * Creates a vector icon from given path data. Meant to be bound as icon creators
    * @param pathData the path data for the icon
    * @return a path object from the hud system
    */
   createVectorIcon: function(pathData)
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
      var path = hudSystem.paper.path(pathData);

      path.attr("fill", "#FFF");

      return path;
   },

   /**
    * Sends a notification of given event, passing the currently stored notify body
    * @param event to send
    * @param body optional body that overwrites getNotifyBody()
    */
   notify: function(event, body)
   {
      this.facade().sendNotification(event, (body !== undefined) ? body : this.getNotifyBody());
   },

   /**
    * Handler when the context menu gets closed.
    */
   onMenuCancel: function()
   {
      if (this.activeContext)
      {
         var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();

         hudSystem.setActiveContextMenu(null);
         this.activeContext = null;
      }
   },

   /**
    * Called if the entire menu should be updated - typically shortly before being shown.
    */
   updateCommands: function()
   {

   }
});
