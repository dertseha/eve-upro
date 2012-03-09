/**
 * A radial menu context is the hook a radial menu and any sub menu
 * run and register themselves in
 */
upro.hud.RadialMenuContext = Class.create(
{
   /**
    * Initializes the context
    * @param mainMenu The main menu to run
    * @param hudSystem the system the menu should be shown in
    * @param realPos the position to show the menu at
    */
   initialize: function(mainMenu, hudSystem, realPos)
   {
      this.mainMenu = mainMenu;
      this.hudSystem = hudSystem;
      this.realPos = realPos;

      this.activeMenu = null;
   },

   /**
    * Returns the position
    * @return the position
    */
   getRealPos: function()
   {
      return this.realPos;
   },

   /**
    * Returns the HUD System
    * @return the HUD System
    */
   getHudSystem: function()
   {
      return this.hudSystem;
   },

   /**
    * Shows the main menu
    */
   show: function()
   {
      this.mainMenu.show(this);
   },

   /**
    * Cancels the menu stack.
    * Calls cancel() while there is an active menu
    */
   cancel: function()
   {
      while (this.activeMenu)
      {
         this.activeMenu.cancel();
      }
   },

   /**
    * Sets the currently active menu. The calling code must
    * ensure not to overlap calling this method.
    * @param menu to set as active one
    */
   setActiveMenu: function(menu)
   {
      this.activeMenu = menu;
   }

});
