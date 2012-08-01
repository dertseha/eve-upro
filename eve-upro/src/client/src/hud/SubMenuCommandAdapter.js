/**
 * This command adapter runs a sub menu as command.
 * It ensures that either the sub-menu or the main menu is displayed.
 */
upro.hud.SubMenuCommandAdapter = Class.create(upro.hud.CommandAdapter,
{
   initialize: function(parent, iconCreator, label)
   {
      this.parent = parent;
      this.label = label;
      this.sub = new upro.hud.RadialMenu(iconCreator, this.onCancelled.bind(this));
   },

   /** {@inheritDoc} */
   getLabel: function()
   {
      return this.label;
   },

   /**
    * Returns the internal sub-menu
    * @return the internal sub-menu
    */
   getSubMenu: function()
   {
      return this.sub;
   },

   /**
    * Hides the parent menu and shows the sub-menu
    */
   execute: function()
   {
      this.context = this.parent.context;
      this.parent.hide();
      this.sub.show(this.context);
   },

   /**
    * Shows the parent menu
    */
   onCancelled: function()
   {
      var context = this.context;

      this.context = null;
      this.parent.show(context);
   }

});
