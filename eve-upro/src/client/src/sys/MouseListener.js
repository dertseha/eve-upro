/**
 * A listener to mouse events to forward it to a handler in a unified manner.
 */
upro.sys.MouseListener = Class.create(
{
   /**
    * Initializes the listener
    * 
    * @param handler a PointerHandler instance to call for events
    * @param context to observe the mouse events on. If not provided, document is used.
    */
   initialize: function(handler, context)
   {
      this.handler = handler;
      this.context = context || document;

      this.position =
      {
         "x": 0,
         "y": 0,
         "z": 0
      };
      this.buttons = [ false, false, false ];

      this.ignoredHandler = this.onIgnored.bind(this);
      this.mouseDownHandler = this.onMouseDown.bind(this);
      this.mouseUpHandler = this.onMouseUp.bind(this);
      this.mouseMoveHandler = this.onMouseMove.bind(this);
      this.mouseWheelHandler = this.onMouseWheel.bind(this);

      this.startObserving();
   },

   callObserveFunction: function(func)
   {
      func.call(Element, this.context, 'click', this.ignoredHandler);
      func.call(Element, this.context, 'dblclick', this.ignoredHandler);
      func.call(Element, this.context, 'contextmenu', this.ignoredHandler);

      func.call(Element, this.context, 'mousedown', this.mouseDownHandler);
      func.call(Element, this.context, 'mouseup', this.mouseUpHandler);
      func.call(Element, this.context, 'mousemove', this.mouseMoveHandler);

      func.call(Element, this.context, 'mousewheel', this.mouseWheelHandler);
      func.call(Element, this.context, 'DOMMouseScroll', this.mouseWheelHandler);
   },

   startObserving: function()
   {
      this.callObserveFunction(Element.observe);
   },

   stopObserving: function()
   {
      this.callObserveFunction(Element.stopObserving);
   },

   /**
    * Updates the current position from the event data
    * 
    * @param event the event to read
    */
   updatePosition: function(event)
   {
      this.position.x = event.pointerX();
      this.position.y = event.pointerY();
      this.position.z = 0;
   },

   /**
    * Updates the active button states from given event and returns a mask array specifying the button. The arrays are
    * to be interpreted as [primary ('left'), secondary ('right'), tertiary ('middle')]
    * 
    * @param event the event to read
    * @param down boolean whether the button is down (pressed) or not
    * @return an array of booleans specifying which button was pressed
    */
   updateButtons: function(event, down)
   {
      var mask = [ false, false, false ];

      if (event.isLeftClick())
      {
         mask[upro.sys.MouseListener.BUTTON_INDEX_PRIMARY] = true;
         this.buttons[upro.sys.MouseListener.BUTTON_INDEX_PRIMARY] = down;
      }
      if (event.isRightClick())
      {
         mask[upro.sys.MouseListener.BUTTON_INDEX_SECONDARY] = true;
         this.buttons[upro.sys.MouseListener.BUTTON_INDEX_SECONDARY] = down;
      }
      if (event.isMiddleClick())
      {
         mask[upro.sys.MouseListener.BUTTON_INDEX_TERTIARY] = true;
         this.buttons[upro.sys.MouseListener.BUTTON_INDEX_TERTIARY] = down;
      }

      return mask;
   },

   /**
    * Stops and ignores the given event.
    * 
    * @param event mouse event
    */
   onIgnored: function(event)
   {
      event.stop();
   },

   /**
    * Handler for button down
    * 
    * @param event mouse event
    */
   onMouseDown: function(event)
   {
      event.stop();

      this.updatePosition(event);
      var mask = this.updateButtons(event, true);
      this.handler.onDown(this.position, this.buttons, mask);
   },

   /**
    * Handler for button up
    * 
    * @param event mouse event
    */
   onMouseUp: function(event)
   {
      event.stop();

      if (!Prototype.Browser.EVE_IGB || !event.isMiddleClick()) // EVE IGB misses the middle down event
      {
         this.updatePosition(event);
         var mask = this.updateButtons(event, false);
         this.handler.onUp(this.position, this.buttons, mask);
      }
   },

   /**
    * Handler for mouse move
    * 
    * @param event mouse event
    */
   onMouseMove: function(event)
   {
      this.updatePosition(event);
      this.handler.onMove(this.position, this.buttons);
   },

   /**
    * Handler for mouse wheel/ball/whatever This function is more explorative as Prototype doesn't provide abstraction
    * here.
    * 
    * @param event mouse event
    */
   onMouseWheel: function(event)
   {
      var rotation = null;

      Event.extend(event);
      event.stop();

      if (event.wheelDeltaX && event.wheelDeltaY)
      { // i.e.: WebKit
         rotation = [ event.wheelDeltaX, event.wheelDeltaY, 0 ];
      }
      else if (event.wheelDelta)
      { // i.e.: IE
         rotation = [ 0, event.wheelDelta, 0 ];
      }
      else if (event.detail)
      { // i.e.: Firefox
         // The -40 factor was hand-picked after observation
         rotation = [ 0, event.detail * -40, 0 ];
      }

      if (rotation)
      {
         if (Prototype.Browser.EVE_IGB)
         {
            rotation[1] /= 120;
         }

         this.updatePosition(event);
         this.handler.onRotate(this.position, this.buttons, rotation);
      }
   }

});

upro.sys.MouseListener.BUTTON_INDEX_PRIMARY = 0;
upro.sys.MouseListener.BUTTON_INDEX_SECONDARY = 1;
upro.sys.MouseListener.BUTTON_INDEX_TERTIARY = 2;
