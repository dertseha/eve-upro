/**
 * A label is a simple element displaying an optional icon and a text.
 */
upro.hud.Label = Class.create(
{
   initialize: function(hudSystem, x, y, width, height)
   {
      this.hudSystem = hudSystem;
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;

      this.icon = null;
      this.text = this.hudSystem.paper.text(this.x + this.height, y + this.height / 2, "");
      this.text.attr(
      {
         "text-anchor": "start",
         "clip-rect": "" + (x + height) + "," + y + "," + (width - height - 3) + "," + height, // BUG Not working for IE
         "font-size": height - 4,
         "fill": "#FFFFFF"
      });
   },

   /**
    * Cleanup of the element
    */
   destroy: function()
   {
      this.destroyIcon();
      this.text.remove();
   },

   setElementsBefore: function(other)
   {
      this.text.insertBefore(other);
      if (this.icon)
      {
         this.icon.insertBefore(this.text);
      }
   },

   /**
    * Sets the text
    * @param textString value to set
    */
   setText: function(textString)
   {
      this.text.attr({"text": textString});
   },

   /**
    * Sets the icon
    * @param icon element to take over as icon. Label takes control.
    */
   setIcon: function(icon)
   {
      this.destroyIcon();

      if (icon)
      {
         var box = icon.getBBox();
         var scale = (box.height > box.width) ? box.height : box.width;

         icon.translate(this.x + (this.height / 2) - ((box.width - box.x) / 2), this.y + (this.height / 2) - ((box.height - box.y) / 2));
         if (scale > 0)
         {
            icon.scale(this.height / scale, this.height / scale);
         }
      }
   },

   /**
    * Removes the current icon
    */
   destroyIcon: function()
   {
      if (this.icon)
      {
         this.icon.remove();
         this.icon = null;
      }
   }

});
