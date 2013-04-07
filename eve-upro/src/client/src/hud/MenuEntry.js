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
      this.label = null;
   },

   show: function(context, x, y, labelOptions)
   {
      var icon = null;
      var textOptions =
      {
         text: this.commandAdapter.getLabel(),
         fill: "#FFFFFF",
         "fill-opacity": 0.0,
         "font-size": 15,
         bracketSide: 0,
         bracketPadding: 5
      };
      var label = null;

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
      if (labelOptions)
      {
         textOptions["text-anchor"] = labelOptions.anchor;
         this.label = label = context.paper.text(labelOptions.x, labelOptions.y, this.commandAdapter.getLabel());
         this.label.attr(textOptions);
         this.label.show();
         this.label.animate(
         {
            "fill-opacity": 0.0
         }, 500, "linear", function()
         {
            label.animate(
            {
               "fill-opacity": 0.6
            }, 500, "backOut");
         });
      }
   },

   hide: function()
   {
      if (this.label)
      {
         this.label.remove();
         this.label = null;
      }
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
      var labelText = this.commandAdapter.getLabel();

      this.button.setEnabled(this.commandAdapter.isCommandPossible());
      this.button.setActive(this.commandAdapter.isCommandActive());
      this.button.setLabel(labelText);
      if (this.label)
      {
         this.label.attr("text", labelText);
      }
   }
});
