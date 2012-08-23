/**
 * A menu entry creates and destroys a button on request and binds the button to a command adapter.
 */
upro.hud.MenuEntry = Class.create(
{
   initialize: function(iconCreator, commandAdapter)
   {
      this.iconCreator = iconCreator;
      this.commandAdapter = commandAdapter;
      this.commandAdapterListener = this.updateButtonOnCommand.bind(this);
      this.button = null;
   },

   show: function(context, x, y)
   {
      var icon = null;

      this.hide();
      if (this.iconCreator)
      {
         icon = this.iconCreator();
      }
      this.button = new upro.hud.Button(context, x, y, icon, this.commandAdapter.isCommandPossible(),
            this.commandAdapter.isCommandActive());
      this.button.setLabel(this.commandAdapter.getLabel());
      this.button.clickedCallback = this.onClicked.bind(this);
      this.commandAdapter.registerListener(this.commandAdapterListener);
   },

   hide: function()
   {
      if (this.button)
      {
         this.commandAdapter.unregisterListener(this.commandAdapterListener);
         this.button.destroy();
         this.button = null;
      }
   },

   onClicked: function()
   {
      this.commandAdapter.execute();
   },

   updateButtonOnCommand: function()
   {
      this.button.setEnabled(this.commandAdapter.isCommandPossible());
      this.button.setActive(this.commandAdapter.isCommandActive());
      this.button.setLabel(this.commandAdapter.getLabel());
   }
});
