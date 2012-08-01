/**
 * A radial menu has a base button and up to 6 surrounding buttons, all
 * bound to a certain command.
 * The surrounding buttons are bound to a command adapter while the base
 * button cancels the menu.
 */
upro.hud.RadialMenu = Class.create(
{
   /**
    * Initializes the menu.
    * @param iconCreator to create the center icon
    * @param cancelCallback called when the menu is cancelled
    */
   initialize: function(iconCreator, cancelCallback)
   {
      this.iconCreator = iconCreator;

      this.cancelEntry = new upro.hud.MenuEntry(iconCreator,
         new upro.hud.SimpleCommandAdapter(this.onCancel.bind(this, cancelCallback)));
      this.commands = {};

      this.context = null;
   },

   /**
    * Sets a command entry for given index
    * @param index 0..5 the slot to set the command in
    * @param iconCreator the creator function that returns a new icon instance
    * @param commandAdapter the adapter for the corresponding command
    */
   setCommand: function(index, iconCreator, commandAdapter)
   {
      this.commands[index] = new upro.hud.MenuEntry(iconCreator, commandAdapter);
   },

   /**
    * Sets a submenu entry for a given index
    * @param index 0..5 the slot to set the command in
    * @param iconCreator the creator function that returns a new icon instance
    * @return a RadiaMenu representing the sub menu
    */
   setSubMenu: function(index, iconCreator, label)
   {
      var commandAdapter = new upro.hud.SubMenuCommandAdapter(this, iconCreator, label);

      this.commands[index] = new upro.hud.MenuEntry(iconCreator, commandAdapter);

      return commandAdapter.getSubMenu();
   },

   /**
    * Shows the radial menu based on given context. If the menu was shown in another,
    * it is reset before.
    * @param context A RadialMenuContext instance to work with
    */
   show: function(context)
   {
      var hudSystem = context.getHudSystem();
      var viewCoord = hudSystem.realToViewCoordinates(context.getRealPos());
      var offset = null;

      this.hide();
      this.context = context;
      this.context.setActiveMenu(this);
      this.cancelEntry.show(hudSystem, viewCoord.x, viewCoord.y);
      for (var index in this.commands)
      {
         offset = upro.hud.Button.getOffset[index](upro.hud.RadialMenu.PADDING);
         this.commands[index].show(hudSystem, viewCoord.x + offset.x, viewCoord.y + offset.y);
      }
   },

   /**
    * Executes the cancel command
    */
   cancel: function()
   {
      if (this.context)
      {
         this.cancelEntry.commandAdapter.execute();
      }
   },

   /**
    * Callback from the cancel command
    */
   onCancel: function(callback)
   {
      this.hide();
      if (callback)
      {
         callback();
      }
   },

   /**
    * Hides the menu
    */
   hide: function()
   {
      if (this.context)
      {
         this.context.setActiveMenu(null);
         this.context = null;
      }
      this.cancelEntry.hide();
      for (var index in this.commands)
      {
         this.commands[index].hide();
      }
   }

});

/** The padding to be used between the buttons */
upro.hud.RadialMenu.PADDING = 2;
