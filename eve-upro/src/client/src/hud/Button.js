/**
 * A button is a simple GUI element that requests to execute a
 * command (callback) when activated (clicked).
 * The button itself is represented by a hexagon and an optional
 * icon (which can be any element registered in raphael).
 */
upro.hud.Button = Class.create(
{
   /**
    * Initializes the button.
    * @param hudSystem the HUD system to run in
    * @param x horizontal (view coordinates) position
    * @param y vertical (view coordinates) position
    * @icon optional icon element. The button takes ownership of the object.
    */
   initialize: function(hudSystem, x, y, icon, initialEnabled, initialActive)
   {
      this.hudSystem = hudSystem;

      this.clickedCallback = null;

      this.enabled = (initialEnabled !== undefined) ? initialEnabled : true;
      this.active = (initialActive !== undefined) ? initialActive : false;

      this.wholeSet = this.hudSystem.paper.set();
      this.createBase();
      this.wholeSet.translate(x, y);

      this.icon = icon;
      if (icon)
      {
         var box = icon.getBBox();
         var scale = (box.height > box.width) ? box.height : box.width;

         icon.hide();
         icon.translate(x - ((box.width - box.x) / 2), y - ((box.height - box.y) / 2)); // center icon on button
         icon.scale((upro.hud.Button.Scale * 2) / scale, (upro.hud.Button.Scale * 2) / scale); // scale it down
         icon.toFront();
         icon.attr(upro.hud.Button.States.Enabled[this.enabled].IconAttr);
         this.wholeSet.push(icon);
      }

      var pointerHandler = new upro.sys.PointerHandler();

      pointerHandler.onUp = this.onPointerUp.bind(this);
      this.wholeSet.forEach(function(element)
      {
         new upro.sys.MouseListener(pointerHandler, Element.extend(element[0]));

         return true;
      });
      this.wholeSet.show();
   },

   /**
    * Marks this button unusable. Will detach any handler and prepare the
    * GUI elements to be destroyed (after an animation)
    */
   destroy: function()
   {
      var wholeSet = this.wholeSet;

      this.clickedCallback = null;
      wholeSet.toBack();
      wholeSet.animate({"fill-opacity": 0.2, "stroke-opacity": 0.3}, 200, ">", function() { wholeSet.remove(); });
   },

   /**
    * Enables or disables the button. If disabled, the icon is made semi-transparent and
    * clicking the button is ignored.
    * @param value: boolean whether to enable the button
    */
   setEnabled: function(value)
   {
      var newValue = !!value;

      if ((newValue != this.enabled) && this.icon)
      {
         var attr = upro.hud.Button.States.Enabled[newValue].IconAttr;

         this.enabled = newValue;
         this.icon.animate(attr, 50);
      }
   },

   /**
    * Returns true if the button is enabled
    * @return true if the button is enabled
    */
   isEnabled: function()
   {
      return this.enabled;
   },

   setActive: function(value)
   {
      var newValue = !!value;

      if (newValue != this.active)
      {
         var attr = upro.hud.Button.States.Active[newValue].BaseAttr;

         this.active = newValue;
         this.base.animate(attr, 50);
      }
   },

   /**
    * Returns true if the button is active
    * @return true if the button is active
    */
   isActive: function()
   {
      return this.active;
   },

   /**
    * Sets the label (tooltip) for this button
    * @param text to set
    */
   setLabel: function(text)
   {
      this.wholeSet.forEach(function(element)
      {
         element.attr("title", text);

         return true;
      });
   },

   /**
    * Creates the base of the button - a hexagon
    */
   createBase: function()
   {
      var base = this.hudSystem.createHexagon(upro.hud.Button.Scale).hide();

      base.attr({fill: "#423f22", stroke: "#741", "stroke-width": 2});
      base.attr(upro.hud.Button.States.Active[this.active].BaseAttr);

      this.base = base;
      this.wholeSet.push(base);
   },

   onPointerUp: function(position, buttonStates, changeMask)
   {
      if (changeMask[0] && this.clickedCallback && this.enabled)
      {
         this.clickedCallback();
      }
   }

});

/**
 * Scale for the buttons. Hand-picked value.
 * A circle that encloses a button has a radius of this value.
 */
upro.hud.Button.Scale = 10;

/**
 * Returns the unit shift for the diagonal side
 * @param padding to apply
 * @return {x,y} pair
 */
upro.hud.Button.getShiftHalf = function(padding)
{
   var temp =
   {
      x: (padding / 2) + (upro.hud.Button.Scale * 2),
      y: (padding * 1) + (upro.hud.Button.Scale * 2 * upro.hud.HudSystem.HexagonDiagFactor)
   };

   return temp;
};

/**
 * Returns the unit shift for the 'flat' side
 * @param padding to apply
 * @return {x,y} pair
 */
upro.hud.Button.getShiftFull = function(padding)
{
   var temp =
   {
      x: (padding * 1) + (upro.hud.Button.Scale * 4),
      y: 0
   };

   return temp;
};

upro.hud.Button.States = {};

upro.hud.Button.States.Enabled = {};
upro.hud.Button.States.Enabled[true] = {};
upro.hud.Button.States.Enabled[true].IconAttr = {"fill-opacity": 1.0, "stroke-opacity": 1.0};
upro.hud.Button.States.Enabled[false] = {};
upro.hud.Button.States.Enabled[false].IconAttr = {"fill-opacity": 0.2, "stroke-opacity": 0.3};

upro.hud.Button.States.Active = {};
upro.hud.Button.States.Active[true] = {};
upro.hud.Button.States.Active[true].BaseAttr = {"fill-opacity": 0.9, "stroke-opacity": 1.0};
upro.hud.Button.States.Active[false] = {};
upro.hud.Button.States.Active[false].BaseAttr = {"fill-opacity": 0.5, "stroke-opacity": 0.8};

/**
 * An array of 6 functions that return the offset for the 6 sides
 */
upro.hud.Button.getOffset = [];
upro.hud.Button.getOffset.push(function(padding) { var temp = upro.hud.Button.getShiftHalf(padding); return { x: temp.x, y: -temp.y }; });
upro.hud.Button.getOffset.push(function(padding) { var temp = upro.hud.Button.getShiftFull(padding); return { x: temp.x, y: temp.y }; });
upro.hud.Button.getOffset.push(function(padding) { var temp = upro.hud.Button.getShiftHalf(padding); return { x: temp.x, y: temp.y }; });
upro.hud.Button.getOffset.push(function(padding) { var temp = upro.hud.Button.getShiftHalf(padding); return { x: -temp.x, y: temp.y }; });
upro.hud.Button.getOffset.push(function(padding) { var temp = upro.hud.Button.getShiftFull(padding); return { x: -temp.x, y: temp.y }; });
upro.hud.Button.getOffset.push(function(padding) { var temp = upro.hud.Button.getShiftHalf(padding); return { x: -temp.x, y: -temp.y }; });
