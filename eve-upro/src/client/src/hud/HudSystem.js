upro.hud.HudSystem = Class.create(
{
   /**
    * Initializes the HUD.
    * 
    * @param resizableContext the context that will hold the Raphael paper;
    * @param width expected standard width - default: screen.width
    * @param height expected standard height - default: screen.height
    */
   initialize: function(resizableContext, width, height)
   {
      var temp = ScaleRaphael(resizableContext.getHolderName(), width ? width : screen.width, height ? height
            : screen.height);

      this.context = resizableContext;
      this.paper = temp;
      { // initial resize setup
         this.context.getFrame().addEventListener("resize", this.onResize.bind(this), false);
         this.resizeTimer = upro.sys.Timer.getSingleTimer(this.applyContextSizeOnPaper.bind(this));
         this.onResize();
      }

      this.activeContextMenu = null;

      this.debugMessageTexts = [];
      this.debugMessageElements = [];
      for ( var i = 0; i < 10; i++)
      {
         var elem = temp.text(10, 10 + (20 * (i + 1)), "");

         elem.attr(
         {
            "fill": "#FFF",
            "font-size": 20,
            "text-anchor": "start"
         });
         this.debugMessageElements.push(elem);
         this.debugMessageTexts.push("");
      }

      this.keyDispatcher = new upro.sys.KeyboardDispatcher();
      this.keyFocus = null;

      // debugging
      // temp.rect(0, 0, temp.w, temp.h).attr("stroke", "#FF0000");
   },

   /**
    * Returns the keyboard handler for the HUD System
    * 
    * @return the keyboard handler for the HUD System
    */
   getKeyboardHandler: function()
   {
      return this.keyDispatcher;
   },

   /**
    * This method calculates a screen space pixel to a real value with 0,0 at the center
    * 
    * @param pixelX x value, typically from mouse event
    * @param pixelY y value, typically from mouse event
    * @return {x,y} structure
    */
   pixelToReal: function(pixelX, pixelY)
   {
      var temp =
      {
         x: (pixelX / (this.paper.width / 2)) - 1,
         y: -((pixelY / (this.paper.height / 2)) - 1)
      };

      return temp;
   },

   /**
    * This method calculates an offset in real values to absolute pixel values _of the original scale_ internal Raphael
    * uses. So, the returned x/y pair are not pixel coordinates, but internal view coordinates.
    * 
    * @param real an x/y pair in real values
    * @return an x/y pair of view coordinates
    */
   realToViewCoordinates: function(real)
   {
      var pixelX = (real.x + 1) * (this.paper.width / 2), pixelY = (-real.y + 1) * (this.paper.height / 2);
      var ratioW = this.paper.w / this.paper.width;
      var ratioH = this.paper.h / this.paper.height;

      if (ratioW > ratioH)
      {
         var scaledHeight = this.paper.h / ratioW;

         correctedX = pixelX * ratioW;
         pixelY -= ((this.paper.height / 2) - (scaledHeight / 2));
         correctedY = (pixelY / scaledHeight) * this.paper.h;
      }
      else
      {
         var scaledWidth = this.paper.w / ratioH;

         pixelX -= ((this.paper.width / 2) - (scaledWidth / 2));
         correctedX = (pixelX / scaledWidth) * this.paper.w;
         correctedY = pixelY * ratioH;
      }

      var temp =
      {
         x: correctedX,
         y: correctedY
      };

      return temp;
   },

   getActiveContextMenu: function()
   {
      return this.activeContextMenu;
   },

   setActiveContextMenu: function(active)
   {
      var old = this.activeContextMenu;

      this.activeContextMenu = null;
      if (old)
      {
         old.cancel();
      }
      this.activeContextMenu = active;
   },

   /**
    * Sets the keyboard focus (registers a keyboard handler)
    * 
    * @param handler KeyboardHandler instance to return true if handled
    */
   setKeyFocus: function(handler)
   {
      if (this.keyFocus != handler)
      {
         if (this.keyFocus != null)
         {
            this.keyDispatcher.removeHandler(this.keyFocus);
            this.keyFocus.onFocusLost();
         }
         this.keyFocus = handler;
         if (this.keyFocus != null)
         {
            this.keyDispatcher.addHandler(this.keyFocus);
         }
      }
   },

   /**
    * Removes the key focus if given handler had it
    * 
    * @param handler to remove if set
    */
   removeKeyFocus: function(handler)
   {
      if (this.keyFocus == handler)
      {
         this.setKeyFocus(null);
      }
   },

   /**
    * Resize handler. Scales the paper to the new context frame sizes
    */
   onResize: function()
   {
      this.resizeTimer.start(20);
   },

   applyContextSizeOnPaper: function()
   {
      var frame = this.context.getFrame();

      this.paper.changeSize(frame.innerWidth, frame.innerHeight, true, false);
   },

   debugMessage: function(text)
   {
      var temp;

      for ( var i = this.debugMessageTexts.length - 1; i > 0; i--)
      {
         this.debugMessageTexts[i] = temp = this.debugMessageTexts[i - 1];
         this.debugMessageElements[i].attr("text", temp);
      }
      this.debugMessageTexts[0] = (new Date().toISOString()) + " - " + text;
      this.debugMessageElements[0].attr("text", this.debugMessageTexts[0]);
   },

   createHexagon: function(scale)
   {
      return upro.hud.HudSystem.createHexagon(this.paper, scale);
   }

});

/**
 * The factor for the diagonals to create a hexagon; Result of sqrt(3) of side length 1.
 */
upro.hud.HudSystem.HexagonDiagFactor = 1.732050808;

upro.hud.HudSystem.createHexagon = function(paper, scale)
{
   var diagFactor = upro.hud.HudSystem.HexagonDiagFactor;
   var basePath = "M0,-" + (2 * scale) + "L" + (diagFactor * scale) + ",-" + scale + "V" + scale + "L0," + (2 * scale)
         + "L-" + (diagFactor * scale) + "," + scale + "V-" + scale + "Z";

   var hexagon = paper.path(basePath);

   hexagon.attr(
   {
      fill: "#423f22",
      "fill-opacity": 0.5,
      stroke: "#741",
      "stroke-width": 2,
      "stroke-opacity": 0.8
   });

   return hexagon;
};
