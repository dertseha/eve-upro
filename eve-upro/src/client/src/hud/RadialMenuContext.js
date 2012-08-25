/**
 * A radial menu context is the hook a radial menu and any sub menu run and register themselves in
 */
upro.hud.RadialMenuContext = Class.create(
{
   /**
    * Initializes the context
    * 
    * @param mainMenu The main menu to run
    * @param paperContext the paper context the menu should be shown in
    * @param viewCoord the view coordinates to show the menu at
    */
   initialize: function(mainMenu, paperContext, viewCoord)
   {
      this.mainMenu = mainMenu;
      this.paperContext = paperContext;
      this.viewCoord = viewCoord;

      this.activeMenu = null;
   },

   /**
    * Returns the position
    * 
    * @return the position
    */
   getViewCoord: function()
   {
      return this.viewCoord;
   },

   /**
    * Returns the paper context
    * 
    * @return the paper context
    */
   getPaperContext: function()
   {
      return this.paperContext;
   },

   /**
    * Shows the main menu
    */
   show: function()
   {
      this.mainMenu.show(this);
   },

   /**
    * Cancels the menu stack. Calls cancel() while there is an active menu
    */
   cancel: function()
   {
      while (this.activeMenu)
      {
         this.activeMenu.cancel();
      }
   },

   /**
    * Sets the currently active menu. The calling code must ensure not to overlap calling this method.
    * 
    * @param menu to set as active one
    */
   setActiveMenu: function(menu)
   {
      this.activeMenu = menu;
   }

});
