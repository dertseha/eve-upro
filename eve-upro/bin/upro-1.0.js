/*!
 * Copyright (c) 2011-2012 Christian Haas
 *
 * This software is provided 'as-is', without any express or implied
 * warranty. In no event will the authors be held liable for any damages
 * arising from the use of this software.
 *
 * Permission is granted to anyone to use this software for any purpose,
 * including commercial applications, and to alter it and redistribute it
 * freely, subject to the following restrictions:
 *
 *    1. The origin of this software must not be misrepresented; you must not
 *    claim that you wrote the original software. If you use this software
 *    in a product, an acknowledgment in the product documentation would be
 *    appreciated but is not required.
 *
 *    2. Altered source versions must be plainly marked as such, and must not be
 *    misrepresented as being the original software.
 *
 *    3. This notice may not be removed or altered from any source
 *    distribution.
 */

if (typeof upro == "undefined")
{
   var upro = {};
}

/**
 * Static helper for creating UUID values
 */

upro.Uuid =
{
   /** The all-zero UUID */
   Empty: "00000000-0000-0000-0000-000000000000",

   /**
    * Creates a V4 (pseudo-random) UUID value
    * Found on: https://gist.github.com/982883
    * Note, yuicompressor expands the numbers, so meh :)
    * @param a: placeholder for recursion
    * @return a UUID value
    */
   newV4: function(a)
   {
      return a             // if the placeholder was passed, return
         ?  (              // a random number from 0 to 15
            a ^            // unless b is 8,
            Math.random()  // in which case
            * 16           // a random number from
            >> a/4         // 8 to 11
            ).toString(16) // in hexadecimal
         :  (              // or otherwise a concatenated string:
            [1e7] +        // 10000000 +
            -1e3 +         // -1000 +
            -4e3 +         // -4000 +
            -8e3 +         // -80000000 +
            -1e11          // -100000000000,
            ).replace
               (           // replacing
               /[018]/g,    // zeroes, ones, and eights with
               upro.Uuid.newV4 // random hex digits
               );
   }
};

/**
 * The system namespace holds the access implementations to the
 * system the application runs in - typically, the browser window.
 */
upro.sys = {};

/**
 * Although IGB is based on WebKit, we need a dedicated flag for some quirks
 */
Prototype.Browser.EVE_IGB = typeof CCPEVE !== "undefined";

/**
 * Provides log output of given text
 * defaults to console.log with date/time and a prefix
 * @param text to log
 */
upro.sys.log = function(text)
{
   console.log((new Date().toISOString()) + " upro: " + text);
};

/**
 * Request for a frame animation.
 * See http://paulirish.com/2011/requestanimationframe-for-smart-animating/  et al.
 */
window.requestAnimFrame = (function()
{
   return window.requestAnimationFrame ||
      window.webkitRequestAnimationFrame ||
      window.mozRequestAnimationFrame ||
      window.oRequestAnimationFrame ||
      window.msRequestAnimationFrame ||
      function(callback, element)
      {
         return window.setTimeout(callback, 1000 / 60);
      };
})();

/**
 * Stops an animation loop
 */
window.cancelRequestAnimFrame = (function()
{
   return window.cancelAnimationFrame ||
      window.webkitCancelRequestAnimationFrame ||
      window.mozCancelRequestAnimationFrame ||
      window.oCancelRequestAnimationFrame ||
      window.msCancelRequestAnimationFrame ||
      window.clearTimeout;
})();

/**
 * A resizable context is some display context embedded entity
 * that acts as a holder.
 * Typically, the frame will be the window and the holder some element in the DOM.
 */
upro.sys.ResizableContext = Class.create(
{
   initialize: function()
   {

   },

   getHolderName: function()
   {
      return null;
   },

   getFrame: function()
   {
      return null;
   }
});

/**
 * The window resizable context is based on the (browser) window and
 * some holding element
 */
upro.sys.ResizableContextWindow = Class.create(upro.sys.ResizableContext,
{
   initialize: function(holderName)
   {
      this.holderName = holderName;
   },

   getHolderName: function()
   {
      return this.holderName;
   },

   getFrame: function()
   {
      return $(window);
   }
});

/**
 * Time related helper
 */
upro.sys.Time =
{
   /**
    * Returns the current tick in milliseconds
    * @return the current tick in milliseconds
    */
   tickMSec: function()
   {
      return +new Date();
   }
};

/**
 * A timer waits a certain time until it calls a callback. Reason for not using prototype's PeriodicalExecutor: - Having
 * a private one is easier for testing (should it be needed)
 */
upro.sys.Timer = Class.create(
{
   initialize: function(callback)
   {
      this.callback = callback;
      this.context = null;
      this.executing = false;
   },

   /**
    * Starts the timer with given millisecond interval Call is ignored if already running
    * 
    * @param msec milliseconds to wait
    */
   start: function(msec)
   {
      if (this.context == null)
      {
         this.context = this.startInternal(this.callbackInternal.bind(this), msec);
      }
   },

   /**
    * Internal start function
    */
   startInternal: function(code, msec)
   {
      return null;
   },

   /**
    * Stops (aborts) any pending call Call is ignored if timer is not running
    */
   stop: function()
   {
      if (this.context != null)
      {
         var context = this.context;

         this.context = null;
         this.stopInternal(context);
      }
   },

   /**
    * Internal stop function
    */
   stopInternal: function(context)
   {

   },

   /**
    * Internal callback function
    */
   callbackInternal: function()
   {
      if (!this.executing)
      {
         this.context = this.restartInternal(this.context);
         try
         {
            this.executing = true;
            this.callback();
            this.executing = false;
         }
         catch (e)
         {
            this.executing = false;
            throw e;
         }
      }
   },

   restartInternal: function(context)
   {
      return context;
   }

});

/**
 * Returns a timer object calling the callback periodically
 * 
 * @return a timer object calling the callback periodically
 */
upro.sys.Timer.getIntervalTimer = function(callback)
{
   var timer = new upro.sys.Timer(callback);

   timer.startInternal = function(code, msec)
   {
      return window.setInterval(code, msec);
   };
   timer.stopInternal = function(context)
   {
      window.clearInterval(context);
   };

   return timer;
};

/**
 * Returns a timer object calling the callback once. Can be restarted.
 * 
 * @return a timer object calling the callback once
 */
upro.sys.Timer.getSingleTimer = function(callback)
{
   var timer = new upro.sys.Timer(callback);

   timer.startInternal = function(code, msec)
   {
      return window.setTimeout(code, msec);
   };
   timer.stopInternal = function(context)
   {
      window.clearTimeout(context);
   };
   timer.restartInternal = function(context)
   {
      return null;
   };

   return timer;
};

/**
 * A listener to keyboard events to forward it to a handler in a
 * unified manner.
 */
upro.sys.KeyboardListener = Class.create(
{
   /**
    * Initializes the listener
    * @param handler
    * @param context to observe the keyboard events on. If not provided, document is used.
    */
   initialize: function(handler, context)
   {
      this.handler = handler;
      this.context = context || document;

      this.boundHandler =
      {
         'keydown': this.onKeyDown.bind(this),
         'keyup': this.onKeyUp.bind(this),
         'keypress': this.onKeyPress.bind(this)
      };
      for (var name in this.boundHandler)
      {
         Element.observe(this.context, name, this.boundHandler[name]);
      }
   },

   /**
    * Unlinks all references to handlers - unregisters them
    */
   destroy: function()
   {
      for (var name in this.boundHandler)
      {
         Element.stopObserving(this.context, name, this.boundHandler[name]);
      }
   },

   /**
    * Returns true for events/keys that should be stopped.
    * This function primarily looks for actions that somehow affect
    * the content of the view (application).
    * @param keyCode the determined keyCode
    * @param event event this is called in
    * @return true if the event should be filtered
    */
   shouldStopEvent: function(keyCode, event)
   {
      var rCode = false;

      if ((keyCode == 82) && event.ctrlKey && !event.shiftKey)
      {  // Ctrl+R (without shift) -- reload
         rCode = true;
      }
      else if (keyCode == 116)
      {  // F5 -- reload
         rCode = true;
      }
      else if (keyCode == 118)
      {  // F7 -- caret browsing
         rCode = true;
      }
      else if ((keyCode == 65) && event.ctrlKey)
      {  // Ctrl+A -- select all
         rCode = true;
      }
      else if ((keyCode == 70) && event.ctrlKey)
      {  // Ctrl+F -- search
         rCode = true;
      }
      else if ((keyCode == 83) && event.ctrlKey)
      {  // Ctrl+S -- save
         rCode = true;
      }
      else if (keyCode == Event.KEY_TAB)
      {  // TAB -- don't try to switch focus
         rCode = true;
      }
      else if (keyCode == Event.KEY_BACKSPACE)
      {  // Backspace -- go back
         rCode = true;
      }

      return rCode;
   },

   /**
    * Event Handler for keydown
    * @param event the event data
    */
   onKeyDown: function(event)
   {
      var keyCode = event.which || event.keyCode;

      if (this.shouldStopEvent(keyCode, event))
      {
         event.stop();
      }
      this.handler.onDown(keyCode);
   },

   /**
    * Event Handler for keydown
    * @param event the event data
    */
   onKeyUp: function(event)
   {
      var keyCode = event.which || event.keyCode;

      if (this.shouldStopEvent(keyCode, event))
      {
         event.stop();
      }
      this.handler.onUp(keyCode);
   },

   /**
    * Event Handler for keydown
    * @param event the event data
    */
   onKeyPress: function(event)
   {
      var keyCode = event.which || event.keyCode;

      if (this.shouldStopEvent(keyCode, event))
      {
         event.stop();
      }
      this.handler.onPress(keyCode);
   }
});

/**
 * A keyboard handler processes single keyboard events
 */
upro.sys.KeyboardHandler = Class.create(
{
   initialize: function()
   {

   },

   /**
    * A key is triggered in its down state.
    * Receiving an UP is optional.
    * @param keyCode of the key. Nearly a raw scan code.
    */
   onDown: function(keyCode)
   {

   },

   /**
    * A key was released while having focus.
    * Receiving an UP is optional.
    * @param keyCode of the key. Nearly a raw scan code.
    */
   onUp: function(keyCode)
   {

   },

   /**
    * A character was entered
    * @param charCode of the key. Can be used for String.fromCharCode()
    */
   onPress: function(charCode)
   {

   }

});

/**
 * A keyboard dispatcher routes keyboard events to a list of
 * registered KeyboardHandler.
 * Every event received is provided to the handler until one
 * returns true (having it handled).
 */
upro.sys.KeyboardDispatcher = Class.create(upro.sys.KeyboardHandler,
{
   initialize: function()
   {
      this.handlers = [];
   },

   /**
    * Adds given handler at end of list
    * @param handler to register
    */
   addHandler: function(handler)
   {
      if (this.handlers.indexOf(handler) < 0)
      {
         this.handlers.push(handler);
      }
   },

   /**
    * Removes given handler from the list
    * @param handler to remove
    */
   removeHandler: function(handler)
   {
      var index = this.handlers.indexOf(handler);

      if (index >= 0)
      {
         this.handlers.splice(index, 1);
      }
   },

   /**
    * Dispatches an event identified with methodName and given parameter
    * Iterates through all registered handlers and calls the method until one returns true
    *
    * @param methodName to call on the registered handlers
    * @param param to pass
    * @return true if a registered handler returned true
    */
   dispatch: function(methodName, param)
   {
      var tempList = this.handlers.slice(0), i, handled = false, handler;

      for (i = 0; !handled && (i < tempList.length); i++)
      {
         handler = tempList[i];
         if ((this.handlers.indexOf(handler) >= 0) && handler[methodName](param))
         {
            handled = true;
         }
      }

      return handled;
   },

   /** {@inheritDoc} */
   onDown: function(keyCode)
   {
      return this.dispatch("onDown", keyCode);
   },

   /** {@inheritDoc} */
   onUp: function(keyCode)
   {
      return this.dispatch("onUp", keyCode);
   },

   /** {@inheritDoc} */
   onPress: function(charCode)
   {
      return this.dispatch("onPress", charCode);
   }

});

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
      var ignored = this.onIgnored.bind(this);

      this.handler = handler;
      this.context = context || document;

      this.position =
      {
         "x": 0,
         "y": 0,
         "z": 0
      };
      this.buttons = [ false, false, false ];

      Element.observe(this.context, 'click', ignored);
      Element.observe(this.context, 'dblclick', ignored);
      Element.observe(this.context, 'contextmenu', ignored);

      Element.observe(this.context, 'mousedown', this.onMouseDown.bind(this));
      Element.observe(this.context, 'mouseup', this.onMouseUp.bind(this));
      Element.observe(this.context, 'mousemove', this.onMouseMove.bind(this));

      Element.observe(this.context, 'mousewheel', this.onMouseWheel.bind(this));
      Element.observe(this.context, 'DOMMouseScroll', this.onMouseWheel.bind(this));
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

/**
 * A pointer handler processes single pointer (mouse) events
 *
 * Accepted data:
 * Position: A structure of absolute positions with members x, y, z
 *
 * Buttons: An array of booleans, true means pressed. A mouse
 *    typically has three buttons; ordered left, right, middle.
 * Button Change Mask: Same order as button states, true if causing event
 *
 * Rotation: An array of rotation deltas. Index 1 whould be the common mouse wheel.
 *    (index 0 the left/right rotation on an Apple mouse)
 */
upro.sys.PointerHandler = Class.create(
{
   initialize: function()
   {

   },

   /**
    * Button(s) pressed down
    * @param position where
    * @param buttonStates the current collective states
    * @param changeMask which button(s) caused the event
    */
   onDown: function(position, buttonStates, changeMask)
   {

   },

   /**
    * Button(s) depressed
    * @param position where
    * @param buttonStates the current collective states
    * @param changeMask which button(s) caused the event
    */
   onUp: function(position, buttonStates, changeMask)
   {

   },

   /**
    * Pointer was moved
    * @param position where to
    * @param buttonStates the current collective states
    */
   onMove: function(position, buttonStates)
   {

   },

   /**
    * Pointer was rotated
    * @param position where at
    * @param buttonStates the current collective states
    * @param rotation the rotation deltas
    */
   onRotate: function(position, buttonStates, rotation)
   {

   }

});

/**
 * A pointer operation is something started and stopped based on
 * certain conditions - typically a combination of pressed buttons.
 *
 * It extends the PointerHandler interface to receive all pointer
 * actions while being active.
 */
upro.sys.PointerOperation = Class.create(upro.sys.PointerHandler,
{
   initialize: function()
   {

   },

   /**
    * Called when the operation should start. A typical implementation
    * will store the position for further delta calculations.
    * @param position the position where the operation was started
    * @param buttonStates boolean array of the current states
    */
   onStart: function(position, buttonStates)
   {

   },

   /**
    * Called when the operation has to stop. Anything related to this
    * operation should be aborted. May be called without notifying
    * any change of button states (i.e. onUp() not called)
    * @param position the position where the operation was stopped
    */
   onStop: function(position)
   {

   }
});

/**
 * This registry contains a list of pointer operations that are
 * triggered based on received pointer events.
 *
 * Operations are registered based on a certain button combination.
 *
 * Button presses are routed to the current active state, but
 * if the pointer is moved beyond a certain threshold AND the
 * button combination matches a differet operation, the current
 * one will be stopped and the new matching made active.
 *
 * PointerOperation.onUp() will NOT be received by any operation if
 * the active one changed - only onStop() is called for the old one.
 *
 * Pointer rotation does not affect anything and will always be
 * forwarded to the currently active operation.
 */
upro.sys.PointerOperationRegistry = Class.create(upro.sys.PointerHandler,
{
   initialize: function()
   {
      this.nullEntry = { "buttonStates": [], "operation": upro.sys.PointerOperationRegistry.NullOperation };

      this.operations = [];
      this.activeEntry = this.nullEntry;

      this.lastDivergingPosition = null;
   },

   /**
    * Registers given operation at given combination of button states.
    * Operations are ordered, with earlier operations having higher priority than later ones.
    * This is important regarding button combinations - The operation without any active button
    * should always go last!
    *
    * Note: The newly registered operation will not be called immediately, even if
    * the current state would match. During startup, the pointer position is unknown,
    * and defaulting to 0|0|0 would result in undesired situations. After all, the system
    * is meant to be re-active, so waiting for a first action is the best.
    *
    * @param buttonStates boolean array of buttons to match
    * @param operation the PointerOperation to register
    */
   registerOperation: function(buttonStates, operation)
   {
      this.operations.push({ "buttonStates": buttonStates.slice(0), "operation": operation });
   },

   /** {@inheritDoc} */
   onDown: function(position, buttonStates, changeMask)
   {
      this.updateActiveOperation(position, buttonStates);
      this.activeEntry.operation.onDown(position, buttonStates, changeMask);
   },

   /** {@inheritDoc} */
   onUp: function(position, buttonStates, changeMask)
   {
      var newStateEntry = this.findMatchingOperationForStates(buttonStates);

      this.lastDivergingPosition = null;
      if ((this.activeEntry != newStateEntry) &&
         !this.doesStateMatchMask(this.activeEntry.buttonStates, newStateEntry.buttonStates))
      {
         this.setActiveOperationEntry(newStateEntry, position, buttonStates);
      }
      else
      {
         this.activeEntry.operation.onUp(position, buttonStates, changeMask);
      }
   },

   /** {@inheritDoc} */
   onMove: function(position, buttonStates)
   {
      this.updateActiveOperation(position, buttonStates);
      this.activeEntry.operation.onMove(position, buttonStates);
   },

   /** {@inheritDoc} */
   onRotate: function(position, buttonStates, rotation)
   {
      var newStateEntry = this.findMatchingOperationForStates(buttonStates);

      if (this.activeEntry != newStateEntry)
      {
         this.setActiveOperationEntry(newStateEntry, position, buttonStates);
      }
      this.activeEntry.operation.onRotate(position, buttonStates, rotation);
   },

   /**
    * Updates the activate operation according to current button states.
    * Also considers some threshold regarding movement between button down/up
    * @param position the current pointer position
    * @param buttonStates the current button states
    */
   updateActiveOperation: function(position, buttonStates)
   {
      var newStateEntry = this.findMatchingOperationForStates(buttonStates);

      if (this.activeEntry != newStateEntry)
      {
         var vecPos = vec3.create([position.x, position.y, position.z]);

         if (!this.lastDivergingPosition)
         {
            this.lastDivergingPosition = vecPos;
         }
         else if (vec3.length(vec3.subtract(vecPos, this.lastDivergingPosition)) >=
            upro.sys.PointerOperationRegistry.MoveThreshold)
         {
            this.setActiveOperationEntry(newStateEntry, position, buttonStates);
         }
      }
   },

   /**
    * Checks whether a state is contained within a given mask
    * @param state array of booleans to check if included in mask
    * @param mask array of booleans to check against
    * @return true if state is within mask
    */
   doesStateMatchMask: function(state, mask)
   {
      var rCode = true;

      for (var i = 0; rCode && (i < state.length); i++)
      {
         if (state[i] && !mask[i])
         {
            rCode = false;
         }
      }

      return rCode;
   },

   /**
    * Returns the operation that fits best (highest priority) for given
    * combination of button states
    * @param buttonStates to filter for
    * @return an operation entry matching the button states
    */
   findMatchingOperationForStates: function(buttonStates)
   {
      var foundStateEntry = null;

      for (var i = 0; (foundStateEntry == null) && (i < this.operations.length); i++)
      {
         var entry = this.operations[i];

         if (this.doesStateMatchMask(entry.buttonStates, buttonStates))
         {
            foundStateEntry = entry;
         }
      }

      return (foundStateEntry != null) ? foundStateEntry : this.nullEntry;
   },

   /**
    * Sets the active operation entry; Calls Stop on previous and Start on new
    * @param entry the entry to activate
    * @param position the current position
    * @param buttonStates the current button states
    */
   setActiveOperationEntry: function(entry, position, buttonStates)
   {
      this.activeEntry.operation.onStop(position);
      this.activeEntry = entry;
      if (this.lastDivergingPosition != null)
      {
         this.activeEntry.operation.onStart(
            {"x": this.lastDivergingPosition[0], "y": this.lastDivergingPosition[1], "z": this.lastDivergingPosition[2]},
            buttonStates);
         this.lastDivergingPosition = null;
      }
      else
      {
         this.activeEntry.operation.onStart(position, buttonStates);
      }
   }

});

/** A null operation not doing anything */
upro.sys.PointerOperationRegistry.NullOperation = new upro.sys.PointerOperation();

/** Threshold for movement during a click */
upro.sys.PointerOperationRegistry.MoveThreshold = 5;

/**
 * The eve namespace contains code very much EVE specific.
 */
upro.eve = {};

/**
 * The Util container holds utility functions
 */
upro.eve.Util =
{
   /** The regular expression to support isValidName() */
   REGEX_NAME: /([a-z]|[A-Z]|[0-9])+([-'\x2E\x20]?([a-z]|[A-Z]|[0-9])+)*/,

   /** The regular expression to support isValidNameInput() */
   REGEX_NAME_INPUT: /(([a-z]|[A-Z]|[0-9])+([-'\x2E\x20])?)*/,

   /**
    * Returns true if the given text is a valid name by EVE standards;
    * Although not 1:1 translated.
    * Also, essentially restricts to roman (ASCII) letters.
    *
    * Rules:
    * - Must start and end with alphanumeric char
    * - May contain one of: a single quotation, a blank or a dash in between at a time
    *
    * Ignored from EVE standards (http://www.eveonline.com/pnp/namepolicy.asp)
    * - Length: 4-24 characters
    * - dash/dot only allowed for corp names
    *
    * @param text to test
    * @return true if given text is a valid name
    */
   isValidName: function(text)
   {
      var result = upro.eve.Util.REGEX_NAME.exec(text);

      //upro.sys.log("Test (" + text + ") - result: (" + result + ")");

      return (result != null) && (result.indexOf(text) >= 0);
   },

   /**
    * This method is a more lenient variant of isValidName(), as it doesn't
    * check any proper endings. This one only wants an alphanumeric start.
    * Allowed Non-Alphanumeric chars still may not appear more than once in a row
    *
    * @param text to test
    * @return true if given text is a valid name (for input)
    */
   isValidNameInput: function(text)
   {
      var result = upro.eve.Util.REGEX_NAME_INPUT.exec(text);

      return (result != null) && (result.indexOf(text) >= 0);
   }
};

/**
 * The navigation namespace holds everything related to cartography;
 * The representation of the (EVE) universe down to solar system level.
 * Organisational elements, such as routes are also contained.
 */
upro.nav = {};

/**
 * This class is basically a map of objects that have an ID.
 * It furthermore provides functionality to both listen to changes
 * of the map and to wait for specific additions.
 */
upro.nav.IdentifiedObjectHolder = Class.create(
{
   initialize: function(owner)
   {
      this.owner = owner;
      this.position = this.owner.position;

      this.objects = {};
      this.listeners = [];
      this.waiters = {};
   },

   toString: function()
   {
      return "ObjectHolder for " + this.owner.toString();
   },

   /**
    * Adds the given object to the map. First all listeners are informed, then
    * all waiters.
    * @param object the object to add
    */
   add: function(object)
   {
      var waiterList = this.waiters[object.id];
      var i;

      this.objects[object.id] = object;

      for (i = this.listeners.length - 1; i >= 0; i--)
      {
         this.listeners[i].onAdded(object);
      }
      if (waiterList !== undefined)
      {
         for (i = waiterList.length - 1; i >= 0; i--)
         {
            var waiter = waiterList[i];

            waiter(object);
         }
         delete this.waiters[object.id];
      }
   },

   /**
    * Removes the object with given ID
    * @param id of the object to remove
    */
   remove: function(id)
   {
      var object = this.objects[id];

      if (object !== undefined)
      {
         delete this.objects[id];

         for (var i = this.listeners.length - 1; i >= 0; i--)
         {
            this.listeners[i].onRemoved(object);
         }
      }
   },

   /**
    * Retrieves the object with given ID. Returns undefined if not found
    * @param id to look for
    * @return the object with given ID.
    */
   get: function(id)
   {
      return this.objects[id];
   },

   /**
    * Tries to find all objects of which the name contains the given
    * name part, case insenstitive.
    * @param namePart to be found.
    * @return an array of the found objects
    */
   find: function(namePart)
   {
      var result = [];
      var namePartLower = namePart.toLowerCase();

      for (objectId in this.objects)
      {
         var object = this.objects[objectId];
         var nameLower = object.name.toLowerCase();

         if (nameLower.indexOf(namePartLower) >= 0)
         {
            result.push(object);
         }
      }

      return result;
   },

   /**
    * Returns the object that has the given name (case insensitive)
    * @param searchName the name of the object to look for
    * @return the object that has the given name
    */
   findExact: function(searchName)
   {
      var result = null;
      var searchNameLower = searchName.toLowerCase();

      for (objectId in this.objects)
      {
         var object = this.objects[objectId];
         var nameLower = object.name.toLowerCase();

         if (nameLower == searchNameLower)
         {
            result = object;
         }
      }

      return result;
   },

   /**
    * Registers the given listener for any changes
    * @param listener to register
    */
   register: function(listener)
   {
      var index = this.listeners.indexOf(listener);

      if (index < 0)
      {
         this.listeners.push(listener);
      }
   },

   /**
    * Unregisters the given listener
    * @param listener to unregister
    */
   unregister: function(listener)
   {
      var index = this.listeners.indexOf(listener);

      if (index >= 0)
      {
         this.listeners.splice(index, 1);
      }
   },

   /**
    * Requests to wait for an object with given ID. If the object is already contained,
    * the waiter function will be called immediately. Otherwise, it will be
    * stored and called when the object is added.
    * The waiter will be removed automatically when it is called
    * @param id to look for
    * @param waiter to call as soon as the object with given ID is added
    */
   waitFor: function(id, waiter)
   {
      var object = this.get(id);

      if (object !== undefined)
      {
         waiter(object);
      }
      else
      {
         var waiterList = this.waiters[id];

         if (waiterList === undefined)
         {
            this.waiters[id] = waiterList = [];
         }
         waiterList.push(waiter);
      }
   },

   /**
    * Stops waiting for an object
    * @param id to look for
    * @param waiter to unregister
    */
   stopWaitingFor: function(id, waiter)
   {
      var waiterList = this.waiters[id];

      if (waiterList !== undefined)
      {
         var index = waiterList.indexOf(waiter);

         if (index >= 0)
         {
            waiterList.splice(index, 1);
            if (waiterList.length == 0)
            {
               delete this.waiters[id];
            }
         }
      }
   }
});

/**
 * The universe contains... well, not everything per se, but at least the
 * galaxies of EVE. So far, that's typically New Eden and the Wormhole galaxy.
 *
 */
upro.nav.Universe = Class.create(
{
   initialize: function()
   {
      this.galaxies = new upro.nav.IdentifiedObjectHolder({ position: vec3.create(0.0, 0.0, 0.0) });
   }

});

/**
 * The galaxy is the entry point for everything contained in it.
 * An application should add any smaller entities via this class,
 * which then takes care to register all references within it.
 *
 * Regions, Constellations, Systems and Jump Corridors can be added
 * at any time, in any order. The idea is that an application can
 * load the corresponding data in a timer, bit by bit, to prohibit
 * stalling during startup.
 *
 */
upro.nav.Galaxy = Class.create(
{
   initialize: function(id, name, x, y, z, scale)
   {
      var galaxy = this;

      this.id = id;
      this.name = name;
      this.scale = scale ? scale : 1;
      this.position = vec3.create([x, y, z]);

      this.solarSystems = new upro.nav.IdentifiedObjectHolder(this);
      this.solarSystems.register(
      {
         onAdded: function(system) { galaxy.onSolarSystemAdded(system); },
         onRemoved: function(system) { }
      });
      this.constellations = new upro.nav.IdentifiedObjectHolder(this);
      this.constellations.register(
      {
         onAdded: function(constellation) { galaxy.onConstellationAdded(constellation); },
         onRemoved: function(constellation) { }
      });
      this.regions = new upro.nav.IdentifiedObjectHolder(this);
      this.regions.register(
      {
         onAdded: function(region) { galaxy.onRegionAdded(region); },
         onRemoved: function(region) { }
      });

      this.jumpCorridors = [];
   },

   toString: function()
   {
      return 'Galaxy [' + this.name + ']';
   },

   /**
    * Adds a static jump corridor within this galaxy.
    * Only suitable for NewEden's gates or possibly W-Space internal statics
    */
   addStaticJumpCorridor: function(systemId1, systemId2, jumpType)
   {
      var corridor = new upro.nav.JumpCorridor(this, systemId1, this, systemId2, jumpType);

      this.jumpCorridors.push(corridor);
   },

   onSolarSystemAdded: function(system)
   {
      var region = this.regions.get(system.regionId);

/* TODO: optimization. proposal: get this code on a SolarSystem base (calculateDistances()) that is run in a timer
if (this.id == 9)
{
   var allSystems = this.solarSystems;
   var tempVec = vec3.create();

   system.distances = {};
   var lightYearToMeters = 9460.7304725808; // this number is reduced by the factor also applied to the system positions

   for (var systemId in allSystems.objects)
   {
      var other = allSystems.get(systemId);

      if ((other.security < 0.5) && (other !== system)) // can't jump into high-sec - or itself
      {
         var dist = vec3.length(vec3.subtract(system.position, other.position, tempVec));
         var ly = dist / lightYearToMeters;
         if (ly <= 20.0)
         {
            system.distances[other.id] = dist;
            other.distances[system.id] = dist;
         }
      }
   }
}
*/
      system.galaxy = this;
      if (region != undefined)
      {
         this.registerSolarSystemInRegion(region, system);
      }
   },

   onConstellationAdded: function(constellation)
   {
      constellation.galaxy = this;
      for (regionId in this.regions.objects)
      {
         var region = this.regions.get(regionId);

         if (constellation.regionId === region.id)
         {
            this.registerConstellationInRegion(region, constellation);
         }
      }
   },

   onRegionAdded: function(region)
   {
      region.galaxy = this;
      for (constellationId in this.constellations.objects)
      {
         var constellation = this.constellations.get(constellationId);

         if (constellation.regionId === region.id)
         {
            this.registerConstellationInRegion(region, constellation);
         }
      }
      for (systemId in this.solarSystems.objects)
      {
         var system = this.solarSystems.get(systemId);

         if (system.regionId === region.id)
         {
            this.registerSolarSystemInRegion(region, system);
         }
      }
   },

   registerConstellationInRegion: function(region, constellation)
   {
      if ((constellation.region === null) && (region.constellations.get(constellation.id) === undefined))
      {
         region.constellations.add(constellation);
      }
   },

   registerSolarSystemInRegion: function(region, system)
   {
      if ((system.region === null) && (region.solarSystems.get(system.id) === undefined))
      {
         region.solarSystems.add(system);
      }
   }

});

upro.nav.Galaxy.create = function(id, name, x, y, z, scale)
{
   return new upro.nav.Galaxy(id, name, x, y, z, scale);
};

upro.nav.Region = Class.create(
{
   initialize: function(id, name, x, y, z, galaxyId)
   {
      var region = this;

      this.id = id;
      this.name = name;
      this.position = vec3.create([x, y, z]);

      this.galaxyId = galaxyId;
      this.galaxy = null;

      this.solarSystems = new upro.nav.IdentifiedObjectHolder(this);
      this.solarSystems.register(
      {
         onAdded: function(system) { region.onSolarSystemAdded(system); },
         onRemoved: function(system) { }
      });
      this.constellations = new upro.nav.IdentifiedObjectHolder(this);
      this.constellations.register(
      {
         onAdded: function(constellation) { region.onConstellationAdded(constellation); },
         onRemoved: function(constellation) { }
      });
   },

   toString: function()
   {
      return 'Region [' + this.name + ']';
   },

   onSolarSystemAdded: function(system)
   {
      var constellation = this.constellations.get(system.constellationId);

      system.region = this;
      if (constellation != undefined)
      {
         this.registerSolarSystemInConstellation(constellation, system);
      }
   },

   onConstellationAdded: function(constellation)
   {
      constellation.region = this;
      for (systemId in this.solarSystems.objects)
      {
         var system = this.solarSystems.get(systemId);

         if (system.constellationId === constellation.id)
         {
            this.registerSolarSystemInConstellation(constellation, system);
         }
      }
   },

   registerSolarSystemInConstellation: function(constellation, system)
   {
      if ((system.constellation === null) && (constellation.solarSystems.get(system.id) === undefined))
      {
         constellation.solarSystems.add(system);
      }
   }

});

upro.nav.Region.create = function(id, name, x, y, z)
{
   return new upro.nav.Region(id, name, x, y, z);
};

upro.nav.Constellation = Class.create(
{
   initialize: function(id, name, x, y, z, regionId)
   {
      var constellation = this;

      this.id = id;
      this.name = name;
      this.position = vec3.create([x, y, z]);

      this.galaxy = null;
      this.regionId = regionId;
      this.region = null;

      this.solarSystems = new upro.nav.IdentifiedObjectHolder(this);
      this.solarSystems.register(
      {
         onAdded: function(system) { constellation.onSolarSystemAdded(system); },
         onRemoved: function(system) { }
      });
   },

   toString: function()
   {
      return 'Constellation [' + this.name + ']';
   },

   onSolarSystemAdded: function(system)
   {
      system.constellation = this;
   }

});

upro.nav.Constellation.create = function(id, name, x, y, z, regionId)
{
   return new upro.nav.Constellation(id, name, x, y, z, regionId);
};

upro.nav.SolarSystem = Class.create(
{
   initialize: function(id, name, x, y, z, security, regionId, constellationId)
   {
      this.id = id;
      this.name = name;
      this.position = vec3.create([ x, y, z ]);
      this.trueSec = security;
      this.security = (Math.floor((security + 0.05) * 10) / 10.0).toFixed(1);
      if (this.security < 0.0)
      {
         this.security = 0.0;
      }

      this.galaxy = null;
      this.regionId = regionId;
      this.region = null;
      this.constellationId = constellationId;
      this.constellation = null;

      this.jumpPortals = new upro.nav.IdentifiedObjectHolder(this);
   },

   toString: function()
   {
      return 'SolarSystem [' + this.name + ']';
   }
});

upro.nav.SolarSystem.create = function(id, name, x, y, z, security, regionId, constellationId)
{
   return new upro.nav.SolarSystem(id, name, x, y, z, security, regionId, constellationId);
};

/**
 * A jump type identifies how a system can be reached
 */
upro.nav.JumpType =
{
   /** Initial value - typically used for instances either not known or start systems */
   None: "None",

   // MedicalClone -- requires knowledge where it is. Would be awesome: Stranded in W-Space,
   //                 and the only solution your computer comes up with is: Kill yourself.
   // JumpClone -- requires knowledge where they are and from where a jump can be initiated (list of stations)

   /** A pair of jump gates permanently connecting two systems */
   JumpGate: "JumpGate",
   /** A transport system in the ship available for low-/nullsec destinations within range in NewEden */
   JumpDrive: "JumpDrive",
   /** A pair of built structures that act as jump gates between two systems */
   JumpBridge: "JumpBridge",
   /** A static wormhole permanently connects two systems, but the entries are moving. */
   StaticWormhole: "StaticWormhole",
   /** A dynamic wormhole connects two systems for a short period of time */
   DynamicWormhole: "DynamicWormhole"

   // TitanBridge -- technically correct, but not quite something you can plan with
};

/**
 * A Jump corridor is a general pair of two jump portals; It could be for
 * jump gates, (static) worm holes and jump bridges.
 */
upro.nav.JumpCorridor = Class.create(
{
   initialize: function(galaxy1, systemId1, galaxy2, systemId2, jumpType)
   {
      var local = this;

      this.jumpType = jumpType;

      this.galaxy1 = galaxy1;
      this.systemId1 = systemId1;
      this.system1 = null;
      this.portal1 = null;

      this.galaxy2 = galaxy2;
      this.systemId2 = systemId2;
      this.system2 = null;
      this.portal2 = null;

      if ((galaxy1.id < galaxy2.id) || ((galaxy1.id === galaxy2.id) && (systemId1 < systemId2)))
      {
         this.id = this.createId(galaxy1, systemId1, galaxy2, systemId2);
      }
      else
      {
         this.id = this.createId(galaxy2, systemId2, galaxy1, systemId1);
      }

      this.waiter1 = function(solarSystem) { local.onSystem1Added(solarSystem); };
      this.galaxy1.solarSystems.waitFor(this.systemId1, this.waiter1);
      this.waiter2 = function(solarSystem) { local.onSystem2Added(solarSystem); };
      this.galaxy2.solarSystems.waitFor(this.systemId2, this.waiter2);
   },

   toString: function()
   {
      return 'JumpCorridor [' + this.id + ']';
   },

   /**
    * Returns the jump type
    * @return the jump type
    */
   getJumpType: function()
   {
      return this.jumpType;
   },

   createId: function(galaxy1, systemId1, galaxy2, systemId2)
   {
      return "" + galaxy1.id + "." + systemId1 + "-" + galaxy2.id + "." + systemId2;
   },

   dispose: function()
   {
      this.galaxy1.solarSystems.stopWaitingFor(this.systemId1, this.waiter1);
      if (this.system1 != null)
      {
         this.system1.jumpPortals.remove(this.portal1.id);
      }
      this.galaxy2.solarSystems.stopWaitingFor(this.systemId2, this.waiter2);
      if (this.system2 != null)
      {
         this.system2.jumpPortals.remove(this.portal2.id);
      }
   },

   onSystem1Added: function(solarSystem)
   {
      this.system1 = solarSystem;
      this.checkPassage();
   },

   onSystem2Added: function(solarSystem)
   {
      this.system2 = solarSystem;
      this.checkPassage();
   },

   checkPassage: function()
   {
      if ((this.system1 != null) && (this.system2 != null))
      {
         this.portal1 = this.addPortal(this.system1, this.system2);
         this.portal2 = this.addPortal(this.system2, this.system1);
      }
   },

   addPortal: function(sourceSystem, destSystem)
   {
      var portal = this.createPortal(destSystem);

      sourceSystem.jumpPortals.add(portal);

      return portal;
   },

   createPortal: function(destSystem)
   {
      return new upro.nav.JumpPortal(this, destSystem);
   }
});

/**
 * A jump portal is an entry to a jump corridor, with given system
 * on the other end
 */
upro.nav.JumpPortal = Class.create(
{
   initialize: function(corridor, system)
   {
      this.corridor = corridor;
      this.system = system;

      this.id = system.id;
      this.name = system.name;
   },

   /**
    * Returns the JumpCorridor this instance is bound to
    * @return the JumpCorridor this instance is bound to
    */
   getJumpCorridor: function()
   {
      return this.corridor;
   },

   toString: function()
   {
      return 'JumpPortal [' + this.name + ']';
   }

});

/**
 * A system route entry marks a solar system along a list of
 * a route.
 * Apart of the system itself, the type of the entry is stored and
 * the type of the jump /to reach the next system/ is stored.
 */
upro.nav.SystemRouteEntry = Class.create(
{
   initialize: function(solarSystem, entryType, jumpType)
   {
      this.solarSystem = solarSystem;
      this.entryType = entryType;
      this.jumpType = jumpType;
   },

   /**
    * Returns the solar system
    * @return the solar system
    */
   getSolarSystem: function()
   {
      return this.solarSystem;
   },

   /**
    * Returns the entry type
    * @return the entry type
    */
   getEntryType: function()
   {
      return this.entryType;
   },

   /**
    * Returns the jump type to reach the next system
    * @return the jump type to reach the next system
    */
   getJumpType: function()
   {
      return this.jumpType;
   },

   /**
    * Returns a copy of this with a given entry type
    * @return a copy of this with a given entry type
    */
   asEntryType: function(entryType)
   {
      return new upro.nav.SystemRouteEntry(this.getSolarSystem(), entryType, this.jumpType);
   },

   /**
    * Returns true if the given other entry is allowed to follow this entry
    * @param other the other entry to test
    * @return true if the given other entry is allowed to follow this entry
    */
   acceptsNext: function(other)
   {
      var rCode = false;

      if ((other.entryType == upro.nav.SystemRouteEntry.EntryType.Checkpoint) ||
         (this.solarSystem != other.solarSystem))
      {
         rCode = true;
      }

      return rCode;
   }

});

upro.nav.SystemRouteEntry.EntryType =
{
   /** A system to be passed, in defined order along other checkpoints */
   Checkpoint: "Checkpoint",
   /** A system to be passed, regardless of order between checkpoints */
   Waypoint: "Waypoint",
   /** A system determined to be necessary to reach next waypoint or checkpoint */
   Transit: "Transit"
};

/**
 * The (navigational) finder namespace contains intelligence to find
 * ways through the universe.
 */
upro.nav.finder = {};

/**
 * A PathFinder determines the route with the least cost between two systems.
 * Capabilities allow the finder to determine next jumps from a given system and define costs.
 * Rules sort costs by their weight
 * Filters work against capabilities, having the finder ignore systems not allowed (unless destination).
 */
upro.nav.finder.PathFinder = Class.create(
{
   initialize: function(sourceSystem, destinationSystem, capabilities, rules, filters)
   {
      this.sourceSystem = sourceSystem;
      this.destinationSystem = destinationSystem;

      this.capabilities = capabilities;
      this.rules = rules;
      this.filters = (filters !== undefined) ? filters : [];

      this.waypointsBySystem = {};

      this.cheapestPath = null;
      this.pendingWaypoints = [];
      this.onlyConsiderLastCost = false;

      {  // set up first waypoint representing the start system
         var cost = new upro.nav.finder.PathFinderCost(); // the first 'waypoint' has no cost - we're already here
         var firstWaypoint = new upro.nav.finder.PathFinderWaypoint(this, this.sourceSystem, null, cost, upro.nav.JumpType.None);

         this.waypointsBySystem[this.sourceSystem.id] = firstWaypoint;
         this.pendingWaypoints.push(firstWaypoint);
      }
   },

   /**
    * Performs a search blocking until all paths are walked through.
    * Can and will take long! Use continueSearch() in a timer instead!
    */
   performSearch: function()
   {
      var done = false;

      while (!done)
      {
         done = this.continueSearch();
      }
   },

   /**
    * Continues an ongoing search
    * @return true if the search is completed
    */
   continueSearch: function()
   {
      if (this.pendingWaypoints.length > 0)
      {
         var waypoint = this.pendingWaypoints.shift();

         this.processNextWaypoints(waypoint);
      }

      return this.pendingWaypoints.length == 0;
   },

   /**
    * Finds and processes further waypoints from the given one
    * @param sourceWaypoint from which further possible jumps should be considered
    */
   processNextWaypoints: function(sourceWaypoint)
   {
      if (((this.cheapestPath == null) || (this.cheapestPath.totalCost.compareTo(sourceWaypoint.totalCost, this.rules) > 0)) &&
         (this.onlyConsiderLastCost || (this.waypointsBySystem[sourceWaypoint.system.id] === sourceWaypoint)))
      {  // ignore this waypoint if it is already more expensive than a found route
         var next = this.getNextWaypointsByCapabilities(sourceWaypoint);

         for (var i = 0; i < next.length; i++)
         {
            var waypoint = next[i];
            var existingWaypoint = this.waypointsBySystem[waypoint.system.id];

            if ((existingWaypoint === undefined) || (waypoint.totalCost.compareTo(existingWaypoint.totalCost, this.rules) < 0))
            {
               if (waypoint.system === this.destinationSystem)
               {
                  this.waypointsBySystem[waypoint.system.id] = waypoint;
                  this.onPathFound(waypoint);
               }
               else
               {
                  if (!this.onlyConsiderLastCost)
                  {
                     this.waypointsBySystem[waypoint.system.id] = waypoint;
                  }
                  this.pendingWaypoints.push(waypoint);
               }
            }
         }
      }
   },

   /**
    * Returns the next waypoints as reachable from given sourceWaypoint
    * @param sourceWaypoint the waypoint from which to search
    * @return an array of further waypoints as retrieved from the capabilities
    */
   getNextWaypointsByCapabilities: function(sourceWaypoint)
   {
      var waypoints = [];

      for (var capIndex = 0; capIndex < this.capabilities.length; capIndex++)
      {
         var capability = this.capabilities[capIndex];
         var capWaypoints = capability.getNextWaypoints(this, sourceWaypoint);

         for (var capWaypointIndex = 0; capWaypointIndex < capWaypoints.length; capWaypointIndex++)
         {
            var capWaypoint = capWaypoints[capWaypointIndex];
            var found = false;

            for (var waypointIndex = 0; !found && (waypointIndex < waypoints.length); waypointIndex++)
            {
               var existingWaypoint = waypoints[waypointIndex];

               if (existingWaypoint.system === capWaypoint.system)
               {
                  found = true;
                  if (existingWaypoint.totalCost.compareTo(capWaypoint.totalCost, this.rules) > 0)
                  {  // the new cost is cheaper than the previous (typically jump gates over jump drives)
                     waypoints[waypointIndex] = capWaypoint;
                  }
               }
            }
            if (!found && !this.isWaypointFiltered(capWaypoint))
            {
               waypoints.push(capWaypoint);
            }
         }
      }

      return waypoints;
   },

   /**
    * Returns true if the given waypoint is not allowed as per filters
    * @param waypoint the waypoint to test
    * @return true if the given waypoint is not allowed as per filters
    */
   isWaypointFiltered: function(waypoint)
   {
      var rCode = false;

      if (waypoint.system !== this.destinationSystem)
      {  // destination can't be filtered if required
         for (var i = 0; !rCode && (i < this.filters.length); i++)
         {
            var filter = this.filters[i];

            rCode = filter.isWaypointFiltered(this, waypoint);
         }
      }

      return rCode;
   },

   /**
    * Callback for a found path to the destination system
    * @param waypoint the last waypoint of a new found path
    */
   onPathFound: function(waypoint)
   {
      //jsUnity.log("Cheaper: " + waypoint.getPathInNames() + " cost: " + waypoint.totalCost.toString());
      this.cheapestPath = waypoint;
   },

   /**
    * Returns a PathFinderCost instance initialized with the properties of given system.
    * Sets 'jumps' cost item to 1 and also min/max security values if the system is not the destination system.
    * @param system for which to create a cost object
    * @return a PathFinderCost instance
    */
   getBasicCostTo: function(system)
   {
      var cost = new upro.nav.finder.PathFinderCost();

      cost.costItems.jumps = 1;
      if (system !== this.destinationSystem)
      {
         cost.setSecurity(system);
      }

      return cost;
   },

   /**
    * Returns the sum of both given costs under the current rules
    * @param subTotal the previous subTotal (typically waypoint.totalCost)
    * @param cost the cost to add
    * @return the sum of both given costs
    */
   sumCosts: function(subTotal, cost)
   {
      return subTotal.plus(cost, this.rules);
   }
});

/**
 * A path finder capability is something that can retrieve next waypoints
 * from a given source system
 */
upro.nav.finder.PathFinderCapability = Class.create(
{
   initialize: function()
   {

   },

   getNextWaypoints: function(pathFinder, sourceWaypoint)
   {
      return [];
   }

});

/**
 * A jump drive capability allows a ship to travel (without moving) a certain distance of light years by itself.
 * This capability is limited to a specific galaxy (NewEden) and a certain type of destination
 * systems: those with a security of less than 0.5 (no high-sec)
 */
upro.nav.finder.PathFinderCapabilityJumpDrive = Class.create(upro.nav.finder.PathFinderCapability,
{
   initialize: function(maxLightYears)
   {
      this.maxLightYears = maxLightYears;
      this.lightYearToMeters = 9460.7304725808; // this number is reduced by the factor also applied to the system positions
      this.maxDistance = this.maxLightYears * this.lightYearToMeters;
   },

   getNextWaypoints: function(pathFinder, sourceWaypoint)
   {
      var waypoints = [];
      var galaxy = sourceWaypoint.system.galaxy;

      if (galaxy.id == 9) // TODO: Where to place this constant - whom to given control?
      {
/* TODO: optimization. This code goes hand in hand with a missing function SolarSystem.calculateDistances()
         see Galaxy.onSolarSystemAdded()

         for (otherId in sourceWaypoint.system.distances)
         {
            var dist = sourceWaypoint.system.distances[otherId];

            if (dist <= this.maxDistance)
            {
               var system = sourceWaypoint.system.galaxy.solarSystems.get(otherId);
                  var cost = pathFinder.getBasicCostTo(system);

                  cost.costItems.jumpDistance = dist;
                  var waypoint = new upro.nav.finder.PathFinderWaypoint(pathFinder, system, sourceWaypoint,
                     pathFinder.sumCosts(sourceWaypoint.totalCost, cost), upro.nav.JumpType.JumpDrive);

                  waypoints.push(waypoint);
            }
         }
*/

         var allSystems = galaxy.solarSystems;
         var tempVec = vec3.create();

         for (var systemId in allSystems.objects)
         {
            var system = allSystems.get(systemId);

            if ((system.security < 0.5) && (system !== sourceWaypoint.system)) // can't jump into high-sec - or itself
            {
               var dist = vec3.length(vec3.subtract(sourceWaypoint.system.position, system.position, tempVec));

               if (dist <= this.maxDistance)
               {
                  var cost = pathFinder.getBasicCostTo(system);

                  cost.costItems.jumpDistance = dist;
                  var waypoint = new upro.nav.finder.PathFinderWaypoint(pathFinder, system, sourceWaypoint,
                     pathFinder.sumCosts(sourceWaypoint.totalCost, cost), upro.nav.JumpType.JumpDrive);

                  waypoints.push(waypoint);
               }
            }
         }
      }

      return waypoints;
   }

});

/**
 * This capability follows jump gates from the provided system
 */
upro.nav.finder.PathFinderCapabilityJumpGates = Class.create(upro.nav.finder.PathFinderCapability,
{
   initialize: function()
   {

   },

   getNextWaypoints: function(pathFinder, sourceWaypoint)
   {
      var waypoints = [];

      for (var systemId in sourceWaypoint.system.jumpPortals.objects)
      {
         var jumpPortal = sourceWaypoint.system.jumpPortals.get(systemId);
         var jumpType = jumpPortal.getJumpCorridor().getJumpType();

         if (jumpType == upro.nav.JumpType.JumpGate)
         {
            var system = jumpPortal.system;
            var cost = pathFinder.getBasicCostTo(system);
            var waypoint = new upro.nav.finder.PathFinderWaypoint(pathFinder, system, sourceWaypoint,
               pathFinder.sumCosts(sourceWaypoint.totalCost, cost), jumpType);

            waypoints.push(waypoint);
         }
      }

      return waypoints;
   }

});

/**
 * This capability takes a complete graph of PathFinderWaypoint destinations
 * and lets the PathFinder find the cheapest route out of them - meta!
 * Only downside: this is thus a brute-force implementation of the TSP.
 * Don't try and run more than 10 waypoints.
 */
upro.nav.finder.PathFinderCapabilityWaypoints = Class.create(upro.nav.finder.PathFinderCapability,
{
   initialize: function(routesBySourceSystem, destinationSystem)
   {
      this.routesBySourceSystem = routesBySourceSystem;
      this.destinationSystem = destinationSystem;
   },

   getNextWaypoints: function(pathFinder, sourceWaypoint)
   {
      var waypoints = [];
      var routesByDestinationSystem = this.routesBySourceSystem[sourceWaypoint.system.id];

      for (var destinationSystemId in routesByDestinationSystem)
      {
         var destinationWaypoint = routesByDestinationSystem[destinationSystemId];
         var destSystem = this.getSystemFromPath(destinationWaypoint, destinationSystemId);

         if (!this.isSystemInRoute(sourceWaypoint, destSystem) &&
            (destSystem !== this.destinationSystem))
         {
            var cost = destinationWaypoint.totalCost;
            var waypoint = new upro.nav.finder.PathFinderWaypoint(pathFinder, destSystem, sourceWaypoint,
               pathFinder.sumCosts(sourceWaypoint.totalCost, cost));

            waypoints.push(waypoint);
         }
      }
      if ((waypoints.length == 0) && (this.destinationSystem !== undefined))
      {  // last waypoint before the destination
         var destinationWaypoint = routesByDestinationSystem[this.destinationSystem.id];
         var cost = destinationWaypoint.totalCost;
         var waypoint = new upro.nav.finder.PathFinderWaypoint(pathFinder, this.destinationSystem, sourceWaypoint,
            pathFinder.sumCosts(sourceWaypoint.totalCost, cost));

         waypoints.push(waypoint);
      }

      return waypoints;
   },

   isSystemInRoute: function(endWaypoint, system)
   {
      var rCode = false;
      var waypoint = endWaypoint;

      while (!rCode && (waypoint !== null))
      {
         rCode = waypoint.system === system;
         waypoint = waypoint.previousWaypoint;
      }

      return rCode;
   },

   getSystemFromPath: function(endWaypoint, systemId)
   {
      var system = null;
      var waypoint = endWaypoint;

      while ((system === null) && (waypoint !== null))
      {
         if (waypoint.system.id == systemId)
         {
            system = waypoint.system;
         }
         waypoint = waypoint.previousWaypoint;
      }

      return system;
   }

});

upro.nav.finder.PathFinderCost = Class.create(
{
   initialize: function()
   {
      this.costItems = {};
   },

   setSecurity: function(system)
   {
      this.costItems.minSecurity = system.security;
      this.costItems.maxSecurity = system.security;
   },

   toString: function()
   {
      var text = "{";

      for (var key in this.costItems)
      {
         text += key + ": " + this.costItems[key] + ",";
      }
      text += " }";

      return text;
   },

   compareTo: function(other, rules)
   {
      var rCode = 0;

      for (var i = 0; (rCode == 0) && (i < rules.length); i++)
      {
         var rule = rules[i];

         rCode = rule.comparator(this.costItems, other.costItems);
      }

      return rCode;
   },

   plus: function(other, rules)
   {
      var result = new upro.nav.finder.PathFinderCost();

      for (var item in this.costItems)
      {
         result.costItems[item] = this.costItems[item];
      }
      for (var i = 0; i < rules.length; i++)
      {
         var rule = rules[i];

         rule.add(result.costItems, other.costItems);
      }

      return result;
   }
});

/**
 * A path finder cost rule weighs cost and return their
 * relative order.
 */
upro.nav.finder.PathFinderCostRule = Class.create(
{
   initialize: function()
   {

   },

   comparator: function(costA, costB)
   {
      return 0;
   },

   add: function(costA, costB)
   {

   }

});


upro.nav.finder.PathFinderCostRuleJumpFuel = Class.create(upro.nav.finder.PathFinderCostRule,
{
   initialize: function(margin)
   {
      var lightYearToMeters = 9460.7304725808; // this number is reduced by the factor also applied to the system positions

      this.margin = margin * lightYearToMeters;
   },

   comparator: function(costA, costB)
   {
      var distA = costA.jumpDistance ? costA.jumpDistance : 0;
      var distB = costB.jumpDistance ? costB.jumpDistance : 0;
      var result = distA - distB;

      if (this.margin > 0)
      {
         result /= this.margin;
         result = ((result < 0) ? Math.ceil(result) : Math.floor(result)) * this.margin;
      }

      return result;
   },

   add: function(costA, costB)
   {
      if (costB.jumpDistance !== undefined)
      {
         if (costA.jumpDistance)
         {
            costA.jumpDistance += costB.jumpDistance;
         }
         else
         {
            costA.jumpDistance = costB.jumpDistance;
         }
      }
   }

});


upro.nav.finder.PathFinderCostRuleJumps = Class.create(upro.nav.finder.PathFinderCostRule,
{
   initialize: function(margin)
   {
      this.margin = margin;
   },

   comparator: function(costA, costB)
   {
      var result = costA.jumps - costB.jumps;

      if (this.margin > 0)
      {
         result /= this.margin;
         result = ((result < 0) ? Math.ceil(result) : Math.floor(result)) * this.margin;
      }

      return result;
   },

   add: function(costA, costB)
   {
      if (costA.jumps)
      {
         costA.jumps += costB.jumps;
      }
      else
      {
         costA.jumps = costB.jumps;
      }
   }

});


upro.nav.finder.PathFinderCostRuleMaxSecurity = Class.create(upro.nav.finder.PathFinderCostRule,
{
   initialize: function(securityLimit)
   {
      this.securityLimit = securityLimit;
   },

   comparator: function(costA, costB)
   {
      // -10 for those systems not needing security - either source or destination systems.
      var isGoodA = (costA.maxSecurity !== undefined) ? ((costA.maxSecurity < this.securityLimit) ? -1 : 0) : -10;
      var isGoodB = (costB.maxSecurity !== undefined) ? ((costB.maxSecurity < this.securityLimit) ? -1 : 0) : -10;

      if ((isGoodA == 0) && (isGoodB == 0))
      {  // if both are above the limit, have the system with the lower status count
         isGoodA = costA.maxSecurity - this.securityLimit;
         isGoodB = costB.maxSecurity - this.securityLimit;
      }

      return isGoodA - isGoodB;
   },

   add: function(costA, costB)
   {
      if (costA.maxSecurity !== undefined)
      {
         if ((costB.maxSecurity !== undefined) && (costA.maxSecurity < costB.maxSecurity))
         {
            costA.maxSecurity = costB.maxSecurity;
         }
      }
      else
      {
         costA.maxSecurity = costB.maxSecurity;
      }
   }

});


upro.nav.finder.PathFinderCostRuleMinSecurity = Class.create(upro.nav.finder.PathFinderCostRule,
{
   initialize: function(securityLimit)
   {
      this.securityLimit = securityLimit;
   },

   comparator: function(costA, costB)
   {
      // -10 for those systems not needing security - either source or destination systems.
      var isGoodA = (costA.minSecurity !== undefined) ? ((costA.minSecurity >= this.securityLimit) ? -1 : 0) : -10;
      var isGoodB = (costB.minSecurity !== undefined) ? ((costB.minSecurity >= this.securityLimit) ? -1 : 0) : -10;

      if ((isGoodA == 0) && (isGoodB == 0))
      {  // if both are below the limit, have the system with the higher status count
         isGoodA = this.securityLimit - costA.minSecurity;
         isGoodB = this.securityLimit - costB.minSecurity;
      }

      return isGoodA - isGoodB;
   },

   add: function(costA, costB)
   {
      if (costA.minSecurity !== undefined)
      {
         if ((costB.minSecurity !== undefined) && (costA.minSecurity > costB.minSecurity))
         {
            costA.minSecurity = costB.minSecurity;
         }
      }
      else
      {
         costA.minSecurity = costB.minSecurity;
      }
   }

});

/**
 * A path finder filter rules out waypoints because of their
 * properties. A simple filter could be a system filter that
 * denies specific systems. Or ones were accidents happened recently.
 */
upro.nav.finder.PathFinderFilter = Class.create(
{
   initialize: function()
   {

   },

   /**
    * Returns true if the given waypoint is not to be included
    * @param pathFinder reference to the calling finder
    * @param waypoint the waypoint to check
    * @return true if the given waypoint is not to be included
    */
   isWaypointFiltered: function(pathFinder, waypoint)
   {
      return false;
   }

});

/**
 * This filter simply rules out a certain system by its ID
 * e.g., "Avoid Jita".
 */
upro.nav.finder.PathFinderFilterSystem = Class.create(
{
   initialize: function(systemId)
   {
      this.systemId = systemId;
   },

   isWaypointFiltered: function(pathFinder, waypoint)
   {
      return waypoint.system.id == this.systemId;
   }

});

/**
 * A path finder waypoint is a system that was reached by some
 * means of transporation and a certain amount of cost from
 * a previous waypoint. The type of the jump is also noted.
 */
upro.nav.finder.PathFinderWaypoint = Class.create(
{
   initialize: function(finder, system, previousWaypoint, cost, jumpType)
   {
      this.system = system;
      this.previousWaypoint = previousWaypoint;
      this.totalCost = cost;
      this.jumpType = jumpType;
   },

   /**
    * Returns true if the waypoint is uni-directional (can not be travelled back)
    * @return true if the waypoint is uni-directional
    */
   isUnidirectional: function()
   {
      return this.jumpType == upro.nav.JumpType.JumpDrive; // or clone, ...
   },

   /**
    * Returns the path to this waypoint as text
    * @return the path to this waypoint as text form representing a pseudo array (no quotes)
    */
   getPathInNames: function()
   {
      var text = "[";
      var pathList = [];
      var temp = this.previousWaypoint;

      pathList.push(this.system.name);
      while (temp != null)
      {
         pathList.push(temp.system.name + ", ");
         temp = temp.previousWaypoint;
      }
      pathList.reverse();
      for (var i = 0; i < pathList.length; i++)
      {
         text += pathList[i];
      }
      text += "]";

      return text;
   }
});

/**
 * A route finder creates a route between a source system and a list of waypoint systems
 * and to (but not including!) a destination system.
 */
upro.nav.finder.RouteFinder = Class.create(
{
   initialize: function(capabilities, rules, filters, sourceSystem, waypoints, destinationSystem)
   {
      this.capabilities = capabilities;
      this.rules = rules;
      this.filters = filters;

      this.sourceSystem = sourceSystem;
      this.waypoints = waypoints;
      this.destinationSystem = destinationSystem;

      this.pendingTask = undefined;
      this.route = [];
   },


   /**
    * Continues an ongoing search or starts a new one
    * @return true if the search is completed
    */
   continueSearch: function()
   {
      if (this.pendingTask === undefined)
      {  // start a new search
         this.clearRoute();
         this.pendingTask = this.internalStart;
      }
      if (this.pendingTask !== undefined)
      {  // got something to do
         this.pendingTask = this.pendingTask();
      }

      return this.pendingTask === undefined;
   },

   /**
    * The internal start function. Needs to be overwritten to have this thing do
    * something.
    * @return a local function to call next time
    */
   internalStart: function()
   {
      return undefined;
   },

   /**
    * Returns the current route entries. An array of SystemRouteEntry instances.
    * Entries will have types of either Waypoint or Transit. The start system
    * will be Waypoint as well - the user should convert it to Checkpoint if needed.
    * @return the current route entries
    */
   getRouteEntries: function()
   {
      return this.route;
   },

   /**
    * Adds the given system to the route
    * @param solarSystem the solar system to add
    * @param entryType the entry type
    * @param jumpType the jump type
    */
   addRouteEntry: function(solarSystem, entryType, jumpType)
   {
      this.route.push(new upro.nav.SystemRouteEntry(solarSystem, entryType, jumpType));
   },

   /**
    * Resets the route
    */
   clearRoute: function()
   {
      this.route = [];
   },

   /**
    * Cleanup procedure on a failed search. Clears the route.
    */
   searchFailed: function()
   {
      this.clearRoute();
   }

});

/**
 * This simple route finder only considers the cheapest, direct routes between
 * the list of given systems - no reordering performed.
 */
upro.nav.finder.RouteFinderSimple = Class.create(upro.nav.finder.RouteFinder,
{
   initialize: function($super, capabilities, rules, filters, sourceSystem, waypoints, destinationSystem)
   {
      $super(capabilities, rules, filters, sourceSystem, waypoints, destinationSystem);

      this.pathFinder = null;
      this.lastSystem = null;
      this.waypointIndex = 0;
   },

   /** {@inheritDoc} */
   internalStart: function()
   {
      this.pathFinder = null;
      this.lastSystem = this.sourceSystem;
      this.waypointIndex = 0;

      return this.getNextStep();
   },

   /**
    * Returns the next function to call or undefined if the search is completed
    * @return the next function to call or undefined if the search is completed
    */
   getNextStep: function()
   {
      var nextSystem = null;
      var nextFunction = undefined;

      if (this.waypointIndex < this.waypoints.length)
      {
         this.addRouteEntry(this.lastSystem, upro.nav.SystemRouteEntry.EntryType.Waypoint);
         nextSystem = this.waypoints[this.waypointIndex];
      }
      else if (this.lastSystem !== this.destinationSystem)
      {
         this.addRouteEntry(this.lastSystem, upro.nav.SystemRouteEntry.EntryType.Waypoint);
         nextSystem = this.destinationSystem;
      }
      if (nextSystem)
      {
         this.pathFinder = new upro.nav.finder.PathFinder(this.lastSystem, nextSystem, this.capabilities, this.rules, this.filters);
         nextFunction = this.runFinder;
      }

      return nextFunction;
   },

   /**
    * This function runs the current path finder and handles its result
    */
   runFinder: function()
   {
      var result = this.pathFinder.continueSearch();
      var nextFunction = this.runFinder;

      if (result)
      {
         if (this.pathFinder.cheapestPath)
         {
            var waypoint = this.pathFinder.cheapestPath.previousWaypoint;
            var transitSystems = [];

            while ((waypoint != null) && (waypoint.previousWaypoint != null))
            {  // traverse back and get all waypoints
               transitSystems.push(waypoint.system);
               waypoint = waypoint.previousWaypoint;
            }
            // reverse the list and add all to route
            transitSystems.reverse();
            for (var i = 0; i < transitSystems.length; i++)
            {
               this.addRouteEntry(transitSystems[i], upro.nav.SystemRouteEntry.EntryType.Transit, transitSystems[i].jumpType);
            }
            // set up next cycle
            this.lastSystem = this.pathFinder.cheapestPath.system;
            this.waypointIndex++;
            nextFunction = this.getNextStep();
         }
         else
         {
            this.searchFailed();
            nextFunction = undefined;
         }
      }

      return nextFunction;
   }

});


/**
 * This is an abstract base class for a TSP implementation.
 * It first calculates the costs of the complete graph before starting
 * off the (inherited) TSP algorithm.
 *
 * An optimization exists that will not start the higher level function
 * if there are less than two waypoints.
 */
upro.nav.finder.RouteFinderAbstractTSP = Class.create(upro.nav.finder.RouteFinder,
{
   initialize: function($super, capabilities, rules, filters, sourceSystem, waypoints, destinationSystem)
   {
      $super(capabilities, rules, filters, sourceSystem, waypoints, destinationSystem);

      this.edges = []; // a list of edges
      this.edgeMap = {}; // a bi-directional map of maps of edges between A and B systems
   },

   /** {@inheritDoc} */
   internalStart: function()
   {
      var nextFunction = undefined;

      this.createEdges();
      this.edgeIndex = 0;
      if (this.edges.length > 0)
      {
         nextFunction = this.runNextEdge();
      }
      else
      {  // no waypoints, only source and dest
         this.addRouteEntry(this.sourceSystem, upro.nav.SystemRouteEntry.EntryType.Waypoint, upro.nav.JumpType.None);
      }

      return nextFunction;
   },

   createEdges: function()
   {
      this.edges = [];
      this.edgeMap = {};
      if (this.destinationSystem && (this.sourceSystem.id != this.destinationSystem.id))
      {
         this.addBidirectionalEdge(this.sourceSystem, this.destinationSystem);
      }
      for (var i = 0; i < this.waypoints.length; i++)
      {
         var waypoint = this.waypoints[i];

         this.addBidirectionalEdge(this.sourceSystem, waypoint);
         if (this.destinationSystem)
         {
            this.addBidirectionalEdge(waypoint, this.destinationSystem);
         }
         for (var j = i + 1; j < this.waypoints.length; j++)
         {
            this.addBidirectionalEdge(waypoint, this.waypoints[j]);
         }
      }
   },

   addBidirectionalEdge: function(systemA, systemB)
   {
      var edge = this.createEdge(systemA, systemB);

      this.setEdgeMapEntry(systemA.id, systemB.id, edge);
      this.setEdgeMapEntry(systemB.id, systemA.id, edge);
   },

   addUnidirectionalEdge: function(systemA, systemB)
   {
      var edge = this.createEdge(systemA, systemB);

      this.setEdgeMapEntry(systemA.id, systemB.id, edge);
   },

   createEdge: function(systemA, systemB)
   {
      var edge =
      {
         systemA: systemA,
         systemB: systemB,
         path: null,
         cost: null
      };

      this.edges.push(edge);

      return edge;
   },

   setEdgeMapEntry: function(systemId1, systemId2, edge)
   {
      var destMap = this.edgeMap[systemId1];

      if (destMap === undefined)
      {
         this.edgeMap[systemId1] = destMap = {};
      }
      destMap[systemId2] = edge;
   },

   runNextEdge: function()
   {
      var nextFunction = this.tspStart;

      if (this.edgeIndex < this.edges.length)
      {
         var edge = this.edges[this.edgeIndex];

         this.pathFinder = new upro.nav.finder.PathFinder(edge.systemA, edge.systemB, this.capabilities, this.rules, this.filters);
         nextFunction = this.runFinder;
      }
      else if (this.waypoints.length < 2)
      {  // no need for running a more detailed algorithm - there's only one solution
         var route = [];

         route.push(this.sourceSystem);
         if (this.waypoints.length == 1)
         {
            route.push(this.waypoints[0]);
         }
         if (this.destinationSystem)
         {
            route.push(this.destinationSystem);
         }
         this.onRouteFound(route);
         nextFunction = undefined;
      }

      return nextFunction;
   },

   /**
    * This function runs the current path finder and handles its result
    */
   runFinder: function()
   {
      var result = this.pathFinder.continueSearch();
      var nextFunction = this.runFinder;

      if (result)
      {
         if (this.pathFinder.cheapestPath)
         {
            var edge = this.edges[this.edgeIndex];

            edge.cost = this.pathFinder.cheapestPath.totalCost;
            edge.path = this.pathFinder.cheapestPath;

            this.checkUnidirectionalEdge(edge);

            this.edgeIndex++;
            nextFunction = this.runNextEdge();
         }
         else
         {
            this.searchFailed();
            nextFunction = undefined;
         }
      }

      return nextFunction;
   },

   /**
    * Checks whether the given edge is unidirectional. If that's the case,
    * a dedicated edge in the reverse direction is created if needed
    * @param edge to check
    */
   checkUnidirectionalEdge: function(edge)
   {
      var isUnidirectional = false;
      var waypoint = edge.path;

      while (!isUnidirectional && waypoint)
      {
         if (waypoint.isUnidirectional())
         {
            isUnidirectional = true;
         }
         waypoint = waypoint.previousWaypoint;
      }
      if (isUnidirectional && this.edgeMap[edge.systemB.id][edge.systemA.id] == edge)
      {  // found an unidirectional edge that has not yet been properly reversed
         this.addUnidirectionalEdge(edge.systemB, edge.systemA);
      }
   },

   /**
    * The cascaded TSP start function. Called when the costs of the complete graph have
    * been calculated and not less than two waypoints exist. Returns the next function.
    * @return the next function to call.
    */
   tspStart: function()
   {
      return undefined;
   },

   onRouteFound: function(optimizedList)
   {
      var notLastSegment;
      var entryType = null;
      var i, j;

      this.clearRoute();
      for (i = 0; i < (optimizedList.length - 1); i++)
      {
         var systemA = optimizedList[i];
         var systemB = optimizedList[i + 1];
         var edge = this.edgeMap[systemA.id][systemB.id];
         var transitSystems = [];
         var jumpTypes = [];
         var waypoint = edge.path;

         notLastSegment = i < (optimizedList.length - 2);
         while (waypoint != null)
         {
            transitSystems.push(waypoint.system);
            jumpTypes.push(waypoint.jumpType);
            waypoint = waypoint.previousWaypoint;
         }
         jumpTypes.pop(); // remove the 'None' currently at the end of the route
         if (systemA === edge.systemA)
         {  // the path was calculated in the right direction, but waypoints accumulated wrong way around - simply reverse
            transitSystems.reverse();
            jumpTypes.reverse();
         }
         if (notLastSegment || (this.destinationSystem))
         {  // drop the destination (to be included by next loop) unless last one without fixed destination
            transitSystems.pop();
         }
         else
         {  // the final destination should have a proper jump type
            jumpTypes.push(upro.nav.JumpType.None);
         }
         for (j = 0; j < transitSystems.length; j++)
         {
            entryType = upro.nav.SystemRouteEntry.EntryType.Transit;

            if ((j == 0) || ((j == transitSystems.length - 1) && !notLastSegment && !this.destinationSystem))
            {
               entryType = upro.nav.SystemRouteEntry.EntryType.Waypoint;
            }
            this.addRouteEntry(transitSystems[j], entryType, jumpTypes[j]);
         }
      }

      // also rewrite the list of waypoints
      optimizedList.shift();
      if (this.destinationSystem)
      {
         optimizedList.pop();
      }
      this.waypoints = optimizedList;
   }

});

/**
 * This is a brute force TSP route finder. Don't use beyond 10 systems.
 * Don't use it at all actually. Using the PathFinder internally, it
 * always requires a destination system.
 * Use only for reference.
 */
upro.nav.finder.RouteFinderBruteForceTSP = Class.create(upro.nav.finder.RouteFinderAbstractTSP,
{
   initialize: function($super, capabilities, rules, filters, sourceSystem, waypoints, destinationSystem)
   {
      $super(capabilities, rules, filters, sourceSystem, waypoints, destinationSystem);

      this.bruteForceFinder = null;
   },

   /** {@inheritDoc} */
   tspStart: function()
   {
      var routesBySourceSystem = {};

      for (var sourceId in this.edgeMap)
      {
         var edgeDestMap = this.edgeMap[sourceId];
         var destRouteByDestSystem = {};

         routesBySourceSystem[sourceId] = destRouteByDestSystem;
         for (var destId in edgeDestMap)
         {
            var edge = edgeDestMap[destId];

            destRouteByDestSystem[destId] = edge.path;
         }
      }

      var forceCapabilities = [];

      forceCapabilities.push(new upro.nav.finder.PathFinderCapabilityWaypoints(routesBySourceSystem, this.destinationSystem));
      this.bruteForceFinder = new upro.nav.finder.PathFinder(this.sourceSystem, this.destinationSystem, forceCapabilities, this.rules, undefined);
      this.bruteForceFinder.onlyConsiderLastCost = true;

      return this.runBruteForceFinder;
   },

   runBruteForceFinder: function()
   {
      var result = this.bruteForceFinder.continueSearch();
      var nextFunction = this.runBruteForceFinder;

      if (result)
      {
         if (this.bruteForceFinder.cheapestPath)
         {
            var waypoint = this.bruteForceFinder.cheapestPath;
            var optimizedList = [];

            while (waypoint != null)
            {  // traverse back and get all waypoints
               optimizedList.push(waypoint.system);
               waypoint = waypoint.previousWaypoint;
            }
            optimizedList.reverse();
            this.onRouteFound(optimizedList);
         }
         else
         {
            this.searchFailed();
         }
         nextFunction = undefined;
      }

      return nextFunction;
   }

});


/**
 * This is a TSP route finder using the genetic algorithm.
 *
 * Population: Initialized with a certain amount of random routes. Is sorted by fitness (cost)
 *             and only a certain limit kept across generations.
 * Selection:  Two parents are selected random from the remaining population.
 * Offspring:  Only two generated per generation - not an entire new population created.
 * Crossover:  One, position random; Second half is optimized (system swapped only if causes lower cost)
 * Mutation:   Percentage based
 * Abort:      Either through hard limit or an uncontested limit (best stayed on top for x generations)
 *
 * Great deal of information gathered from here:
 * http://www.obitko.com/tutorials/genetic-algorithms/index.php [2011-09]
 * http://elearning.najah.edu/OldData/pdfs/Genetic.ppt [2011-09]
 */
upro.nav.finder.RouteFinderGeneticTSP = Class.create(upro.nav.finder.RouteFinderAbstractTSP,
{
   initialize: function($super, capabilities, rules, filters, sourceSystem, waypoints, destinationSystem)
   {
      $super(capabilities, rules, filters, sourceSystem, waypoints, destinationSystem);

      this.population = [];
      this.populationLimit = 10; // amount of best solutions to keep across generations. parents selected random.
      this.initialPopulationCount = 50; // how many to create randomly first
      this.generationLimit = 40000; // How many generations to run at most
      this.uncontestetLimit = 4000; // If the best stays top for this amount, the algorithm stops
      this.mutationPercentage = 0.5; // 0 turns it off
   },

   /** {@inheritDoc} */
   tspStart: function()
   {
      for (var i = 0; i < this.initialPopulationCount; i++)
      {
         this.createRandomCitizen();
      }
      this.onRouteFound(this.population[0].route.slice(0)); // notify the first route
      this.generation = 0;
      this.uncontestet = 0;

      return this.runGeneration;
   },

   /**
    * Runs another generation or aborts if limit criteria have been met
    * @return next function or undefined
    */
   runGeneration: function()
   {
      var nextFunction = this.runGeneration;

      if (this.population.length > this.populationLimit)
      {  // trim down the population to the requested limit
         this.population.splice(this.populationLimit, this.population.length - this.populationLimit);
      }
      if ((this.generation < this.generationLimit) && (this.uncontestet < this.uncontestetLimit))
      {  // should run at all?
         var parent1 = this.population[this.getRandomIndex(this.population.length)];
         var parent2 = this.population[this.getRandomIndex(this.population.length)];
         var crossover = 1 + this.getRandomIndex(this.waypoints.length);

         this.generateOffspring(parent1, parent2, crossover);
         this.generateOffspring(parent2, parent1, crossover);

         this.generation++;
         this.uncontestet++;
      }
      else
      {
         nextFunction = undefined;
      }

      return nextFunction;
   },

   /**
    * Returns a random integer value from 0 up to, not including, a limit
    * @param limit to use
    * @return a random integer value from 0 up to, not including, a limit
    */
   getRandomIndex: function(limit)
   {
      var value = Math.floor(Math.random() * limit);

      if (value >= limit)
      {  // sadly, documentation seems scarce and not concise - is it now 'including' or 'less than' 1?
         // anyway, simply paranoia then
         value = limit - 1;
      }

      return value;
   },

   /**
    * Creates an empty chromosome
    * @return an empty chromosome
    */
   createChromosome: function()
   {
      var chromosome =
      {
         cost: new upro.nav.finder.PathFinderCost(),
         route: []
      };

      return chromosome;
   },

   /**
    * Creates one random citizen and adds it to the population
    */
   createRandomCitizen: function()
   {
      var chromosome = this.createChromosome();

      chromosome.route.push(this.sourceSystem);
      for (var i = 0; i < this.waypoints.length; i++)
      {
         this.addRandomWaypointToChromosome(chromosome);
      }
      if (this.destinationSystem)
      {
         chromosome.route.push(this.destinationSystem);
      }
      chromosome.cost = this.calculateCost(chromosome);
      this.integrateSorted(chromosome);
   },

   /**
    * Adds a random waypoint system to the chromosome
    * @param chromosome to modify
    */
   addRandomWaypointToChromosome: function(chromosome)
   {
      var added = false;

      while (!added)
      {
         var index = this.getRandomIndex(this.waypoints.length);
         var system = this.waypoints[index];

         if (!this.chromosomeContainsSystem(chromosome, system))
         {
            chromosome.route.push(system);
            added = true;
         }
      }
   },

   /**
    * Returns true if the given chromosome already contains given system
    * @param chromosome to check
    * @param system to search for
    * @return true if included
    */
   chromosomeContainsSystem: function(chromosome, system)
   {
      var rCode = false;

      for (var i = 1; !rCode && (i < chromosome.route.length); i++)
      {
         var temp = chromosome.route[i];

         rCode = temp.id == system.id;
      }

      return rCode;
   },

   /**
    * Calculates the cost of the chromosome
    * @param chromosome to use
    * @return the cost
    */
   calculateCost: function(chromosome)
   {
      var cost = new upro.nav.finder.PathFinderCost();

      for (var i = 0; i < (chromosome.route.length - 1); i++)
      {
         var systemA = chromosome.route[i];
         var systemB = chromosome.route[i + 1];
         var edge = this.edgeMap[systemA.id][systemB.id];

         cost = cost.plus(edge.path.totalCost, this.rules);
      }

      return cost;
   },

   /**
    * Integrates the given chromosome in the population at the ordered position
    * @param chromosome to add
    * @param true if it became the first
    */
   integrateSorted: function(chromosome)
   {
      var done = false;
      var isFirst = false;
      var i;

      for (i = this.population.length - 1; !done && (i >= 0); i--)
      {  // find a place from the back (worst) first - this way a bad one is handled sooner
         var other = this.population[i];

         if (chromosome.cost.compareTo(other.cost, this.rules) > 0)
         {
            this.population.splice(i + 1, 0, chromosome);
            done = true;
         }
      }
      if (!done)
      {  // this new one is the new best
         this.population.splice(0, 0, chromosome);
         isFirst = true;
      }

      return isFirst;
   },

   /**
    * Generates an offspring from given parents and using given crossover point
    * @param parent1 first parent
    * @param parent2 second parent
    * @param crossover point where to split
    */
   generateOffspring: function(parent1, parent2, crossover)
   {
      var offspring = this.createChromosome();
      var mutated = (Math.random() * 100) < this.mutationPercentage;
      var i;

      for (i = 0; i < crossover; i++)
      {  // copy first half
         offspring.route.push(parent1.route[i]);
      }
      for (i = crossover; i < parent2.route.length; i++)
      {  // copy second half
         var system1 = parent1.route[i];
         var system2 = parent2.route[i];

         if (!this.chromosomeContainsSystem(offspring, system2))
         {  // system2 might be new here
            var testOptimize = !mutated && (system1.id != system2.id) && !this.chromosomeContainsSystem(offspring, system1);

            offspring.route.push(system2);
            if (testOptimize)
            {  // test whether adding system2 here makes it truly better
               var cost2 = this.calculateCost(offspring);
               offspring.route[offspring.route.length - 1] = system1;
               var cost1 = this.calculateCost(offspring);

               if (cost1.compareTo(cost2, this.rules) >= 0)
               {  // system2 is better
                  offspring.route[offspring.route.length - 1] = system2;
               }
            }
         }
         else if (!this.chromosomeContainsSystem(offspring, system1))
         {  // system2 already contained, can't splice
            offspring.route.push(system1);
         }
         else
         {  // this path is entered because of several optimizations before. Take a random system
            this.addRandomWaypointToChromosome(offspring);
         }
      }
      if (mutated)
      {  // apply mutation
         this.mutate(offspring);
      }

      offspring.cost = this.calculateCost(offspring);
      if (this.integrateSorted(offspring))
      {
         this.onRouteFound(offspring.route.slice(0));
         this.uncontestet = 0;
      }
   },

   /**
    * Mutates the given chromosome by swapping two random waypoints
    * @param chromosome to mutate
    */
   mutate: function(chromosome)
   {
      var index1 = 1 + this.getRandomIndex(this.waypoints.length);
      var index2 = 1 + this.getRandomIndex(this.waypoints.length);
      var temp = chromosome.route[index1];

      chromosome.route[index1] = chromosome.route[index2];
      chromosome.route[index2] = temp;
   }
});

/**
 * The scene namespace contains 3D stuff
 */
upro.scene = {};

/**
 * The scene system is the main context object for the 3D space;
 * It initializes and handles the WebGL context, has all bodies
 * registered and runs the render loop.
 */
upro.scene.SceneSystem = Class.create(
{
   initialize: function(resizableContext)
   {
      this.context = resizableContext;

      this.matrixStack = [];
      this.mvMatrix = mat4.identity(mat4.create());

      this.camera = new upro.scene.Camera();
      this.inverseCameraPos = vec3.negate(this.camera.position, vec3.create());
      this.rotationBuffer = this.getCameraRotationBuffer();

      this.bodies = [];

      this.setupCanvas();
      this.setupGL();
      this.setupProjectionMatrix();

      this.context.getFrame().addEventListener("resize", this.onResize.bind(this), false);

      this.animId = null;
      this.animCallback = this.render.bind(this);

      this.lastRenderTick = upro.sys.Time.tickMSec();
      this.render(this);
   },

   pixelToReal: function(pixelX, pixelY)
   {
      var temp =
      {
         x: (pixelX / (this.canvas.width / 2)) - 1,
         y: -((pixelY / (this.canvas.height / 2)) - 1)
      };

      return temp;
   },

   /**
    * Adds a render object to the list
    * @param body the object to add
    */
   addRenderObject: function(body)
   {
      this.bodies.push(body);
   },

   /**
    * Projects given position vector onto the 2d plane based on current mv/p matrices.
    *
    * @param position the vec3 to project
    * @return a structure of {x, y} in view space coordinates or null if behind view
    */
   project: function(position)
   {
      var temp = quat4.create();
      var result = null;

      temp[0] = position[0];
      temp[1] = position[1];
      temp[2] = position[2];
      temp[3] = 1;

      mat4.multiplyVec4(this.mvMatrix, temp);
      mat4.multiplyVec4(this.pMatrix, temp);

      if (temp[3] > 0)
      {
         temp[0] /= temp[3];
         temp[1] /= temp[3];
         temp[2] /= temp[3];

         result = {};
         result.x = 0 + this.canvas.width * (temp[0] + 1) * 0.5;
         result.y = 0 + this.canvas.height * (-temp[1] + 1) * 0.5;

         result.x = result.x / this.canvas.width * 2 - 1;
         result.y = result.y / this.canvas.height * -2 + 1;
      }

      return result;
   },

   /**
    * Tries to pick something at given viewPosition
    * @param viewPosition to search from
    * @return A PickResult nearest to viewPosition or null if nothing found
    */
   pickAt: function(viewPosition)
   {
      var result = null, temp = null, i, body;

      for (i = 0; i < this.bodies.length; i++)
      {
         body = this.bodies[i];
         temp = body.pick(viewPosition);
         if ((temp != null) && ((result == null) || (temp.getDistance() < result.getDistance())))
         {
            result = temp;
         }
      }

      return result;
   },

   /**
    * Returns a rotation helper that is based on the scenes camera
    * rotation.
    * @return a RotationBuffer instance
    */
   getCameraRotationBuffer: function()
   {
      return new upro.scene.RotationBuffer(this, this.camera.rotation);
   },

   pushMatrix: function()
   {
      this.matrixStack.push(mat4.create(this.mvMatrix));
   },

   popMatrix: function()
   {
      if (this.matrixStack.length == 0)
      {
         throw "matrixStack is empty!";
      }
      this.mvMatrix = this.matrixStack.pop();
   },

   render: function()
   {
      this.animId = window.requestAnimFrame(this.animCallback, this.canvas);
      {
         var now = upro.sys.Time.tickMSec();
         var timeDiffMSec = now - this.lastRenderTick;

         this.lastRender = now;
         this.draw(timeDiffMSec);
      }
   },

   draw: function(timeDiffMSec)
   {
      var modifiedCamera = this.camera.isOrientationModified();

      this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT | this.gl.STENCIL_BUFFER_BIT);

      mat4.identity(this.mvMatrix);

      vec3.negate(this.camera.position, this.inverseCameraPos);
      this.rotationBuffer.rotateVector(this.inverseCameraPos);
      mat4.translate(this.mvMatrix, this.inverseCameraPos);

      // render all registered bodies
      this.bodies.each(function(body)
      {
         if (modifiedCamera)
         {
            body.setOrientationModified(true);
         }
         body.render(timeDiffMSec);
         body.setOrientationModified(false);
      }, this);
      this.camera.setOrientationModified(false);
   },

   onResize: function()
   {
      this.resizeCanvas();
      this.setupProjectionMatrix();
      this.camera.setOrientationModified(true);
   },

   resizeCanvas: function()
   {
      this.canvas.width = this.context.getFrame().innerWidth,
      this.canvas.height = this.context.getFrame().innerHeight;
   },

   setupProjectionMatrix: function()
   {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

      this.pMatrix = mat4.create();
      mat4.perspective(45, this.canvas.width / this.canvas.height, 0.1, 1000, this.pMatrix);
   },

   setupCanvas: function()
   {
      var canvas = $(this.context.getHolderName());

      this.canvas = canvas;

      canvas.style.backgroundColor = "gray"; // should anything go wrong, we'd see it
      this.resizeCanvas();
   },

   setupGL: function()
   {
      var gl = this.canvas.getContext("experimental-webgl");

      this.gl = gl;

      gl.clearColor(0.0, 0.0, 0.0, 1.0);

      gl.enable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
   },

   loadShaderProgram: function(shaderConstructor, scriptProvider)
   {
      var programHandle = upro.scene.ShaderProgram.compileAndLink(this.gl, scriptProvider);
      var program = null;

      if (programHandle != null)
      {
         program = new shaderConstructor(this.gl, programHandle);
      }

      return program;
   }

});

upro.scene.SceneSystem.SUPPORTED = !!window.WebGLRenderingContext;

/**
 * A shader program consists of compiled vertex and fragment shader scripts. It may have additional parameters for data
 * exchange, but these must be bound in the derived class.
 * 
 * Create a compiled and linked shader program by using SceneSystem.loadShaderProgram
 */
upro.scene.ShaderProgram = Class.create(
{
   initialize: function(gl, handle)
   {
      this.gl = gl;
      this.handle = handle;

      this.mvMatrixUniform = this.gl.getUniformLocation(this.handle, "uMVMatrix");
      this.pMatrixUniform = this.gl.getUniformLocation(this.handle, "uPMatrix");

      this.colorAttribute = gl.getAttribLocation(this.handle, "aColor");
      this.gl.enableVertexAttribArray(this.colorAttribute);

      this.positionAttribute = gl.getAttribLocation(this.handle, "aPosition");
      this.gl.enableVertexAttribArray(this.positionAttribute);
   },

   /**
    * Returns the handle to the program
    * 
    * @return the handle to the program
    */
   getHandle: function()
   {
      return this.handle;
   },

   /**
    * Makes this shader program active
    */
   use: function()
   {
      this.gl.useProgram(this.handle);
   }
});

/**
 * Compiles and links a list of scripts to a shader program.
 * 
 * @param gl GL context
 * @param scriptProvider an array of provider containing at least { id, type, text } (which a typical <script> entry
 *           does
 * @return a program handle or null if failure
 */
upro.scene.ShaderProgram.compileAndLink = function(gl, scriptProvider)
{
   var shaderProgram = gl.createProgram();

   for ( var i = 0; i < scriptProvider.length; i++)
   {
      var object = upro.scene.ShaderProgram.compileScript(gl, scriptProvider[i]);

      gl.attachShader(shaderProgram, object);
   }

   gl.linkProgram(shaderProgram);
   if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
   {
      console.log("Shader Link Problem");
      shaderProgram = null;
   }

   return shaderProgram;
};

/**
 * Compiles a script from a provider. The type of the script must either be "x-shader/x-fragment" or
 * "x-shader/x-vertex".
 * 
 * @param gl GL context
 * @param scriptProvider one script provider. See compileAndLink()
 * @return a shader object handle, ready for linking into a program
 */
upro.scene.ShaderProgram.compileScript = function(gl, scriptProvider)
{
   var shader = null;

   if (scriptProvider.type === "x-shader/x-fragment")
   {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
   }
   else if (scriptProvider.type === "x-shader/x-vertex")
   {
      shader = gl.createShader(gl.VERTEX_SHADER);
   }

   if (shader)
   {
      gl.shaderSource(shader, scriptProvider.text);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      {
         console.log("Shader Compile Problem in '" + scriptProvider.id + "': " + gl.getShaderInfoLog(shader));
         shader = null;
      }
   }

   return shader;
};

/**
 * This is a helper class for rotation.
 */
upro.scene.RotationBuffer = Class.create(
{
   /**
    * @param scene SceneSystem reference to take the mvMatrix from
    * @param rotation rotation vector reference to use
    */
   initialize: function(scene, rotation)
   {
      this.scene = scene;
      this.rotation = rotation;

      this.rotMatrix = mat4.create();
      this.axisPitch = vec3.create();
   },

   /**
    * Rotates the given vector
    * @param vector to rotate
    * @return the given vector
    */
   rotateVector: function(vector)
   {
      var axisPitch = vec3.set([1.0, 0.0, 0.0], this.axisPitch);
      var rotation = this.rotation;
      var rotMatrix = this.rotMatrix;

      mat4.identity(rotMatrix);
      mat4.rotateY(rotMatrix, -rotation[1]);

      mat4.multiply(this.scene.mvMatrix, rotMatrix);

      mat4.inverse(rotMatrix);
      mat4.multiplyVec3(rotMatrix, axisPitch);
      mat4.multiplyVec3(rotMatrix, vector);

      {  // now apply pitch
         mat4.identity(rotMatrix);
         mat4.rotate(rotMatrix, -rotation[0], axisPitch);
         mat4.multiply(this.scene.mvMatrix, rotMatrix);

         mat4.inverse(rotMatrix);
         mat4.multiplyVec3(rotMatrix, vector);
      }

      return vector;
   }

});

/**
 * A scene object is something can have a position in a scene
 */
upro.scene.SceneObject = Class.create(
{
   initialize: function()
   {
      this.position = vec3.create([0.0, 0.0, 0.0]);
      this.rotation = vec3.create([0.0, 0.0, 0.0]);
      this.orientationModified = false;
   },

   isOrientationModified: function()
   {
      return this.orientationModified;
   },

   setOrientationModified: function(value)
   {
      this.orientationModified = value;
   }

});

/**
 * A camera is a simple scene object for handling a viewport
 */
upro.scene.Camera = Class.create(upro.scene.SceneObject,
{
   initialize: function($super)
   {
      $super();
   }
});

/**
 * A scene render object is a scene object that can be added, displayed and picked
 * within a scene - i.e. something visible
 */
upro.scene.SceneRenderObject = Class.create(upro.scene.SceneObject,
{
   initialize: function($super)
   {
      $super();

      this.scene = null;
      this.mvMatrix = mat4.create();

      this.projectionTrackers = {};
      this.projectionHelperVec = vec3.create();
   },

   /**
    * Requests to add this to the given scene.
    * Inheritance typically creates some buffers in here
    * This method stores the provided reference and registers itself at the scene
    *
    * @param scene the scene to add to
    */
   addToScene: function(scene)
   {
      this.scene = scene;
      scene.addRenderObject(this);
   },

   /** {@inheritDoc} */
   setOrientationModified: function($super, value)
   {
      $super(value);
   },

   /**
    * Adds given projection tracker
    * @tracker A TrackedProjection instance
    */
   addProjectionTracker: function(tracker)
   {
      this.projectionTrackers[tracker.getId()] = tracker;
   },

   /**
    * Removes the projection tracker with given id
    * @param id the identification of the tracker to remove
    */
   removeProjectionTracker: function(id)
   {
      delete this.projectionTrackers[id];
   },

   /**
    * Rests all registered projection trackers.
    * @param doCallback whether the callback should be called
    */
   resetProjectionTrackers: function(doCallback)
   {
      var tracker;

      for (var id in this.projectionTrackers)
      {
         tracker = this.projectionTrackers[id];
         tracker.reset(doCallback);
      }
   },

   /**
    * Updates the projection tracks
    */
   updateProjectionTrackers: function()
   {
      var tracker = null;
      var isModified = this.isOrientationModified();

      for (var id in this.projectionTrackers)
      {
         tracker = this.projectionTrackers[id];

         if (isModified || !tracker.isProjectionConfirmed())
         {
            vec3.add(tracker.position, this.position, this.projectionHelperVec);
            // rotation - if necessary!

            tracker.setProjectedPosition(this.scene.project(this.projectionHelperVec));
         }
      }
   },

   /**
    * Requests to render this object.
    * @param timeDiffMSec the time since the last frame
    */
   render: function(timeDiffMSec)
   {

   },

   /**
    * Picks the or an information object at given view position
    * @param viewPosition to look at
    * @return a PickResult instance nearest to viewPosition or null
    */
   pick: function(viewPosition)
   {

   }

});

/**
 * A pick result contains info regarding a selective search on
 * a view position
 */
upro.scene.PickResult = Class.create(
{
   initialize: function(refObject, viewPosition, distance)
   {
      this.refObject = refObject;
      this.viewPosition = viewPosition;
      this.distance = distance;
   },

   getRefObject: function()
   {
      return this.refObject;
   },

   getViewPosition: function()
   {
      return this.viewPosition;
   },

   getDistance: function()
   {
      return this.distance;
   }
});

upro.scene.GalaxyRenderObject = Class.create(upro.scene.SceneRenderObject,
{
   initialize: function($super, basicShader, systemShader)
   {
      $super();

      this.basicShader = basicShader;
      this.systemShader = systemShader;

      this.systems = [];
      this.systemProjections = {};
      this.systemVertices = [];
      this.systemColors = [];

      this.jumpVertices = [];
      this.jumpColors = [];

      this.routeVertices = [];
      this.routeColors = [];
      this.routeSegments = [];

      this.dynamicJumpSegments = {};

      this.ready = false;
      this.visible = false;
   },

   setOrientationModified: function($super, value)
   {
      $super(value);

      if (value)
      {
         delete this.systemProjections;
         this.systemProjections = {};
      }
   },

   addSolarSystem: function(solarSystem)
   {
      var galaxy = solarSystem.galaxy;
      var systemScale = galaxy.scale;
      var center = galaxy.position;

      this.systemVertices.push((solarSystem.position[0] - center[0]) / systemScale,
            (solarSystem.position[1] - center[1]) / systemScale, (solarSystem.position[2] - center[2]) / systemScale);
      this.systemColors.push(solarSystem.security, 0.0, 0.0);

      this.systems.push(solarSystem);
   },

   addJumpCorridor: function(jumpCorridor)
   {
      var color = [ 1.0, 1.0, 1.0 ];

      if (jumpCorridor.getJumpType() == upro.nav.JumpType.JumpGate)
      {
         if (jumpCorridor.system1.constellationId == jumpCorridor.system2.constellationId)
         {
            color = [ 0.0, 0.0, 1.0 ];
         }
         else if (jumpCorridor.system1.regionId == jumpCorridor.system2.regionId)
         {
            color = [ 1.0, 0.0, 0.0 ];
         }
         else if (jumpCorridor.system1.galaxy == jumpCorridor.system2.galaxy)
         {
            color = [ 1.0, 0.0, 1.0 ];
         }
         this.addEdge(jumpCorridor.system1, jumpCorridor.system2, this.jumpVertices, this.jumpColors, color);
      }
      else
      {
         var vertices = [], colors = [];
         var segment = new upro.scene.VertexBufferSegment();
         var scene = this.scene;

         this.addEdge(jumpCorridor.system1, jumpCorridor.system2, vertices, colors, color);

         segment.create(scene.gl);
         segment.update(scene.gl, vertices, colors, 0, vertices.length / 3);
         this.dynamicJumpSegments[jumpCorridor.id] = segment;
      }

   },

   addRouteEdge: function(system1, system2, valid)
   {
      var color = valid ? [ 1.0, 1.0, 0.0, 2.0 ] : [ 1.0, 0.0, 0.0, 2.0 ];

      this.addEdge(system1, system2, this.routeVertices, this.routeColors, color);
      this.updateRouteSegments();
   },

   clearRoute: function()
   {
      this.routeVertices.clear();
      this.routeColors.clear();
      this.updateRouteSegments();
   },

   addEdge: function(system1, system2, vertices, colors, color)
   {
      var galaxy = system1.galaxy;
      var systemScale = galaxy.scale;
      var center = galaxy.position;
      var pos1 = vec3.scale(vec3.subtract(system1.position, center, vec3.create()), 1 / systemScale);
      var pos2 = vec3.scale(vec3.subtract(system2.position, center, vec3.create()), 1 / systemScale);
      var diffVec = vec3.subtract(pos2, pos1, vec3.create());
      var distance = vec3.length(diffVec);
      var fadeInLength = distance / 5.0, fadeInLimit = 1.0;
      var baseAlpha = (color.length > 3) ? color[3] : 1.0;

      vec3.normalize(diffVec);
      if (fadeInLength > fadeInLimit)
      {
         fadeInLength = fadeInLimit;
      }
      vec3.scale(diffVec, fadeInLength);

      // fade in from system 1 to line
      vertices.push(pos1[0], pos1[1], pos1[2]);
      colors.push(color[0], color[1], color[2], baseAlpha * 0.0);
      vec3.add(pos1, diffVec);
      vertices.push(pos1[0], pos1[1], pos1[2]);
      colors.push(color[0], color[1], color[2], baseAlpha * 0.3);

      // fade in from system 2 to line
      vertices.push(pos2[0], pos2[1], pos2[2]);
      colors.push(color[0], color[1], color[2], baseAlpha * 0.0);
      vec3.subtract(pos2, diffVec);
      vertices.push(pos2[0], pos2[1], pos2[2]);
      colors.push(color[0], color[1], color[2], baseAlpha * 0.3);

      // actual line
      vertices.push(pos1[0], pos1[1], pos1[2]);
      colors.push(color[0], color[1], color[2], baseAlpha * 0.3);
      vertices.push(pos2[0], pos2[1], pos2[2]);
      colors.push(color[0], color[1], color[2], baseAlpha * 0.3);
   },

   addToScene: function($super, scene)
   {
      this.systemVertexBuffer = scene.gl.createBuffer();
      scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, this.systemVertexBuffer);
      scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(this.systemVertices), scene.gl.STATIC_DRAW);

      this.systemColorBuffer = scene.gl.createBuffer();
      scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, this.systemColorBuffer);
      scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(this.systemColors), scene.gl.STATIC_DRAW);

      this.jumpSegments = [];
      var amount = this.jumpVertices.length / 3, limit = 1024 * 4, remaining = amount, start = 0;

      while (remaining > 0)
      {
         var copy = (limit > remaining) ? remaining : limit;
         var segment = new upro.scene.VertexBufferSegment();

         segment.create(scene.gl);
         segment.update(scene.gl, this.jumpVertices, this.jumpColors, start, start + copy);
         this.jumpSegments.push(segment);
         remaining -= copy;
         start += copy;
      }

      {
         var segment = new upro.scene.VertexBufferSegment();

         segment.create(scene.gl);
         this.routeSegments.push(segment);
      }

      $super(scene);

      this.updateRouteSegments();

      this.loadTexture();
   },

   updateRouteSegments: function()
   {
      if (this.routeSegments.length > 0)
      {
         var scene = this.scene;
         var segment = this.routeSegments[0];

         segment.update(scene.gl, this.routeVertices, this.routeColors, 0, this.routeVertices.length / 3);
      }
   },

   loadTexture: function()
   {
      var scene = this.scene;
      var gl = scene.gl;
      var texture = gl.createTexture();
      var obj = this;

      texture.image = new Image();
      texture.image.onload = function()
      {
         // gl.activeTexture(gl.TEXTURE0);
         gl.bindTexture(gl.TEXTURE_2D, texture);

         // gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
         gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);

         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
         gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);

         gl.generateMipmap(gl.TEXTURE_2D);

         gl.uniform1i(gl.getUniformLocation(obj.systemShader.getHandle(), "texture"), 0);
         obj.ready = true;
      };

      texture.image.src = 'data:image/png;base64,'
            + 'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8'
            + 'YQUAAAAJcEhZcwAADsIAAA7CARUoSoAAAACPSURBVDhPxVNBCgAhCMzYZ9Wtj/WvbvWv3UYQ2t2soEOC'
            + 'IDiOoyLd1YxipRTOOOc0iKERARFx4aCHsSr1YkIlEPngaeMv728EAaeUXtgQQncf2yNcbRt0l84xRnUL'
            + '7VUsirBtuPd+ujpgBI/a7REs5ODO8JzzVAEwgkft+StATteqVPwIO2LNzv/CUMHKOz+xL4uwLi0r5QAA' + 'AABJRU5ErkJggg==';
   },

   setVisible: function(visible)
   {
      this.visible = visible;
      if (!this.visible)
      {
         this.resetProjectionTrackers(true);
      }
   },

   render: function(timeDiffMSec)
   {
      if (this.ready && this.visible)
      {
         var scene = this.scene;

         scene.pushMatrix();
         mat4.translate(scene.mvMatrix, this.position);

         { // systems
            var shader = this.systemShader;

            shader.use();

            scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, this.systemVertexBuffer);
            scene.gl.vertexAttribPointer(shader.positionAttribute, 3, scene.gl.FLOAT, false, 0, 0);

            scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, this.systemColorBuffer);
            scene.gl.vertexAttribPointer(shader.colorAttribute, 3, scene.gl.FLOAT, false, 0, 0);

            scene.gl.uniformMatrix4fv(shader.mvMatrixUniform, false, scene.mvMatrix);
            scene.gl.uniformMatrix4fv(shader.pMatrixUniform, false, scene.pMatrix);

            scene.gl.drawArrays(scene.gl.POINTS, 0, this.systemVertices.length / 3);
            scene.gl.flush();
         }
         { // edges
            var shader = this.basicShader;
            var i, segment;

            shader.use();

            scene.gl.uniformMatrix4fv(shader.mvMatrixUniform, false, scene.mvMatrix);
            scene.gl.uniformMatrix4fv(shader.pMatrixUniform, false, scene.pMatrix);

            for (i = 0; i < this.jumpSegments.length; i++)
            { // jumps
               segment = this.jumpSegments[i];

               segment.select(scene.gl, shader);
               scene.gl.drawArrays(scene.gl.LINES, 0, segment.size);
               scene.gl.flush();
            }
            for (dynId in this.dynamicJumpSegments)
            { // dynamic jumps
               segment = this.dynamicJumpSegments[dynId];
               segment.select(scene.gl, shader);
               scene.gl.drawArrays(scene.gl.LINES, 0, segment.size);
               scene.gl.flush();
            }
            for (i = 0; i < this.routeSegments.length; i++)
            { // route
               segment = this.routeSegments[i];

               if (segment.size > 0)
               {
                  segment.select(scene.gl, shader);
                  scene.gl.drawArrays(scene.gl.LINES, 0, segment.size);
                  scene.gl.flush();
               }
            }
         }

         scene.popMatrix();

         this.updateProjectionTrackers();
      }
   },

   pick: function(viewPosition)
   {
      var result = null;

      if (this.visible)
      {
         var tempVec = vec3.create();
         var systems = this.systems;
         var solarSystem;
         var projection;

         for ( var i = 0; ((result == null) || (result.getDistance() > 0.0001)) && (i < systems.length); i++)
         {
            solarSystem = systems[i];

            projection = this.projectSolarSystem(solarSystem, tempVec);

            if (projection != null) // ignore systems behind the view
            {
               var dx = projection.x - viewPosition.x;
               var dy = projection.y - viewPosition.y;

               {
                  var dist = Math.sqrt((dx * dx) + (dy * dy));

                  if ((dist < 0.05) && ((result == null) || (dist < result.getDistance())))
                  {
                     result = new upro.scene.PickResult(solarSystem, projection, dist);
                  }
               }
            }
         }
      }

      return result;
   },

   projectSolarSystem: function(solarSystem, temp)
   {
      var entry = this.systemProjections[solarSystem.id];
      var result = null;

      if (!entry || (entry.confirmed < 5))
      {
         vec3.subtract(solarSystem.position, solarSystem.galaxy.position, temp);
         vec3.scale(temp, 1 / solarSystem.galaxy.scale);
         vec3.add(temp, this.position);
         // rotate if necessary

         var tempResult = this.scene.project(temp);

         if (!entry)
         {
            entry =
            {
               "result": tempResult,
               "confirmed": 1
            };
            this.systemProjections[solarSystem.id] = entry;
         }
         if ((entry.result == null) && (tempResult == null))
         { // projection stays behind camera
            entry.confirmed++;
         }
         else if ((entry.result == null) || (tempResult == null) || (tempResult.x != entry.result.x)
               || (tempResult.y != entry.result.y))
         {
            /*
             * this is some nasty hack; apparently, shortly, after finishing a mouse operation, a projection result is
             * simply wrong. I have no idea why this is happening; Perhaps the code is querying not-yet verified
             * mvMatrix values - i.e., some that were based on an old mouse data.
             */
            entry.result = tempResult;
            entry.confirmed = 1;
         }
         else
         { // result stays the same
            entry.confirmed++;
         }
         result = tempResult;
      }
      else
      {
         result = entry.result;
      }

      return result;
   }

});

/**
 * A vertex buffer segment is the storage of vertex and color
 * data using GL arrays.
 * It is present to help segmenting large buffers as WebGL has some
 * limits regarding array sizes.
 *
 * See http://stackoverflow.com/questions/6527791/webgl-buffer-size-limit et al.
 */
upro.scene.VertexBufferSegment = Class.create(
{
   initialize: function()
   {
      this.vertexBuffer = null;
      this.colorBuffer = null;
   },

   create: function(gl)
   {
      this.destroy(gl);
      this.vertexBuffer = gl.createBuffer();
      this.colorBuffer = gl.createBuffer();
   },

   update: function(gl, vertices, colors, from, to)
   {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.slice(from * 3, to * 3)), gl.STATIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors.slice(from * 4, to * 4)), gl.STATIC_DRAW);

      this.size = to - from;
   },

   destroy: function(gl)
   {
      if (this.vertexBuffer)
      {
         gl.deleteBuffer(this.vertexBuffer);
         this.vertexBuffer = null;
      }
      if (this.colorBuffer)
      {
         gl.deleteBuffer(this.colorBuffer);
         this.colorBuffer = null;
      }
   },

   select: function(gl, shader)
   {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.vertexAttribPointer(shader.positionAttribute, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
      gl.vertexAttribPointer(shader.colorAttribute, 4, gl.FLOAT, false, 0, 0);
   }
});

/**
 * A tracked projection is for having software-tracked positions in a scene
 *
 * The projection keeps a confirmation counter. This appears to be a nasty hack:
 * Apparently, shortly, after finishing a mouse operation, a projection result
 * is simply wrong. I have no idea why this is happening;
 * Perhaps the code is querying not-yet verified mvMatrix values - i.e., some that
 * were based on an old mouse data.
 */
upro.scene.TrackedProjection = Class.create(
{
   /**
    * Initializes the object
    * @param id to identify the tracking with
    * @param position to project
    * @param callback to call on confirmation changes. Parameters: this and isConfirmed
    */
   initialize: function(id, position, callback)
   {
      this.id = id;
      this.position = position;
      this.callback = callback;

      this.projectedPositon = null;
      this.confirmed = 0;
   },

   /**
    * Returns the id
    * @return the id
    */
   getId: function()
   {
      return this.id;
   },

   /**
    * Returns the position
    * @return the position
    */
   getPosition: function()
   {
      return this.position;
   },

   /**
    * Returns the projected position. May be null.
    * @return the projected position. May be null.
    */
   getProjectedPosition: function()
   {
      return this.projectedPosition;
   },

   /**
    * Returns true if the projection has been confirmed
    * @return true if the projection has been confirmed
    */
   isProjectionConfirmed: function()
   {
      return this.confirmed == upro.scene.TrackedProjection.CONFIRMATION_LIMIT;
   },

   /**
    * Resets the projection
    * @param doCallback whether the callback should be invoked if becoming unconfirmed
    */
   reset: function(doCallback)
   {
      var wasConfirmed = this.isProjectionConfirmed();

      this.projectedPosition = null;
      this.confirmed = 0;
      if (wasConfirmed && doCallback)
      {
         this.callback(this);
      }
   },

   /**
    * Sets the projected position. If the projection is set with identical
    * values enough times, the callback will be called.
    * If the projection changes, the callback is called as well the first time.
    * @param realPos a structure with 'x' and 'y' members
    */
   setProjectedPosition: function(realPos)
   {
      var wasConfirmed = this.isProjectionConfirmed();

      if (!this.projectedPosition && !realPos)
      {  // item stays unprojected
         if (!wasConfirmed)
         {
            this.onConfirmation();
         }
      }
      else if (!this.projectedPosition || !realPos ||
         (this.projectedPosition.x != realPos.x) || (this.projectedPosition.y != realPos.y))
      {  // change of values
         this.projectedPosition = !realPos ? null :
         {
            "x": realPos.x,
            "y": realPos.y
         };
         this.confirmed = 1;
//         if (wasConfirmed)
         {
            this.callback(this, false); // false here assumes the limit is greater than 1
         }
      }
      else if (!wasConfirmed)
      {  // values stayed identical
         this.onConfirmation();
      }
   },

   /**
    * Internal helper for handling a confirmed situation. Adds one to the
    * confirmation counter and calls the callback if satisfied.
    */
   onConfirmation: function()
   {
      this.confirmed++;

      var isConfirmed = this.isProjectionConfirmed();
//      if (isConfirmed)
      {
         this.callback(this, isConfirmed);
      }
   }
});

/** How many times a projection must be done until it is confirmed. */
upro.scene.TrackedProjection.CONFIRMATION_LIMIT = 5;

/**
 * The HUD namespace contains all (typially) 2D elements the graphical
 * user interface (the view) is based on.
 * Calling it GUI or similar didn't quite match it as the 3D stuff
 * is some graphical user interface as well.
 */
upro.hud = {};

/**
 * A command adapter is a generic interface for commands that can
 * be executed by request on a GUI action.
 * Apart from the execute() callback, this adapter provides
 * information on whether the command is currently being executed
 * and/or possible to be executed.
 */
upro.hud.CommandAdapter = Class.create(
{
   initialize: function()
   {

   },

   /**
    * Returns whether the command is currently active
    * @return whether the command is currently active
    */
   isCommandActive: function()
   {
      return false;
   },

   /**
    * Returns whether the command is currently possible
    * @return whether the command is currently possible
    */
   isCommandPossible: function()
   {
      return true;
   },

   /**
    * Returns the label for the command
    * @return the label for the command
    */
   getLabel: function()
   {
      return "";
   },

   /**
    * Registers a listener for any state changes
    * @param callback to call if the command state changes
    */
   registerListener: function(callback)
   {

   },

   /**
    * Unregisters a listener for any state changes
    * @param callback to remove
    */
   unregisterListener: function(callback)
   {

   },

   /**
    * Requests to execute the command
    */
   execute: function()
   {

   }

});

/**
 * A simple command adapter is the simple implementation of a command adapter,
 * with setters for Active and Possible and a list of registered listeners.
 */
upro.hud.SimpleCommandAdapter = Class.create(upro.hud.CommandAdapter,
{
   initialize: function(callback, label)
   {
      this.callback = callback;
      this.listeners = [];

      this.active = false;
      this.possible = true;
      this.label = label || "";
   },

   /**
    * Sets the active state of the command and notifies listeners if changed
    * @param value the value to set
    */
   setActive: function(value)
   {
      var newValue = !!value;

      if (newValue != this.active)
      {
         this.active = newValue;
         this.notifyListeners();
      }
   },

   /** {@inheritDoc} */
   isCommandActive: function()
   {
      return this.active;
   },

   /**
    * Sets the possible state of the command and notifies listeners if changed
    * @param value the value to set
    */
   setPossible: function(value)
   {
      var newValue = !!value;

      if (newValue != this.possible)
      {
         this.possible = newValue;
         this.notifyListeners();
      }
   },

   /** {@inheritDoc} */
   isCommandPossible: function()
   {
      return this.possible;
   },

   /** {@inheritDoc} */
   getLabel: function()
   {
      return this.label;
   },

   /**
    * Sets the label to use
    * @param text to set
    */
   setLabel: function(text)
   {
      if (text != this.label)
      {
         this.label = text;
         this.notifyListeners();
      }
   },


   /** {@inheritDoc} */
   registerListener: function(callback)
   {
      var index = this.listeners.indexOf(callback);

      if (index < 0)
      {
         this.listeners.push(callback);
      }
   },

   /** {@inheritDoc} */
   unregisterListener: function(callback)
   {
      var index = this.listeners.indexOf(callback);

      if (index >= 0)
      {
         this.listeners.splice(index, 1);
      }
   },

   /** {@inheritDoc} */
   execute: function()
   {
      this.callback();
   },

   /**
    * Notifies all the current listeners. Ensures that those removed meanwhile are not called
    */
   notifyListeners: function()
   {
      var temp = this.listeners.slice(0), listener;

      for (var i = 0; i < temp.length; i++)
      {
         listener = temp[i];

         if (this.listeners.indexOf(listener) >= 0)
         {
            listener();
         }
      }
   }

});

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


upro.hud.HudSystem = Class.create(
{
   /**
    * Initializes the HUD.
    * @param resizableContext the context that will hold the Raphael paper;
    * @param width expected standard width - default: screen.width
    * @param height expected standard height - default: screen.height
    */
   initialize: function(resizableContext, width, height)
   {
      var temp = ScaleRaphael(resizableContext.getHolderName(), width ? width : screen.width, height ? height : screen.height);

      this.context = resizableContext;
      this.paper = temp;
      {  // initial resize setup
         this.context.getFrame().addEventListener("resize", this.onResize.bind(this), false);
         // call resize now - twice, as one call sometimes doesn't help (?)
         this.onResize();
         this.onResize();
      }

      this.activeContextMenu = null;

      this.debugMessageTexts = [];
      this.debugMessageElements = [];
      for (var i = 0; i < 10; i++)
      {
         var elem = temp.text(10, 10 + (20 * (i + 1)), "");

         elem.attr( { "fill": "#FFF", "font-size": 20, "text-anchor": "start" });
         this.debugMessageElements.push(elem);
         this.debugMessageTexts.push("");
      }

      this.keyDispatcher = new upro.sys.KeyboardDispatcher();
      this.keyFocus = null;

      // debugging
      //temp.rect(0, 0, temp.w, temp.h).attr("stroke", "#FF0000");
   },

   /**
    * Returns the keyboard handler for the HUD System
    * @return the keyboard handler for the HUD System
    */
   getKeyboardHandler: function()
   {
      return this.keyDispatcher;
   },

   /**
    * This method calculates a screen space pixel to a real value with 0,0 at the center
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
    * This method calculates an offset in real values to absolute pixel values
    * _of the original scale_ internal Raphael uses. So, the returned x/y pair
    * are not pixel coordinates, but internal view coordinates.
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
      var frame = this.context.getFrame();

      this.paper.changeSize(frame.innerWidth, frame.innerHeight, true, false);
   },

   debugMessage: function(text)
   {
      var temp;

      for (var i = this.debugMessageTexts.length - 1; i > 0; i--)
      {
         this.debugMessageTexts[i] = temp = this.debugMessageTexts[i - 1];
         this.debugMessageElements[i].attr("text", temp);
      }
      this.debugMessageTexts[0] = (new Date().toISOString()) + " - " + text;
      this.debugMessageElements[0].attr("text", this.debugMessageTexts[0]);
   },

   createHexagon: function(scale)
   {
      var diagFactor = upro.hud.HudSystem.HexagonDiagFactor;
      var basePath =
         "M0,-" + (2 * scale) +
         "L" + (diagFactor * scale) + ",-" + scale +
         "V" + scale +
         "L0," + (2 * scale) +
         "L-" + (diagFactor * scale) + "," + scale +
         "V-" + scale +
         "Z";
/* This one has 'edges' on the left and right sides
      var basePath =
         "M-" + (2 * scale) + ",0" +
         "L-" + scale + ",-" + (diagFactor * scale) +
         "H" + scale +
         "L" + (2 * scale) + ",0" +
         "L" + scale + "," + (diagFactor * scale) +
         "H-" + scale +
         "Z";
*/
      var hexagon = this.paper.path(basePath);

      hexagon.attr({fill: "#423f22", "fill-opacity": 0.5, stroke: "#741", "stroke-width": 2, "stroke-opacity": 0.8});

      return hexagon;
   }

});

/**
 * The factor for the diagonals to create a hexagon;
 * Result of sqrt(3) of side length 1.
 */
upro.hud.HudSystem.HexagonDiagFactor = 1.732050808;

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

/**
 * A menu entry creates and destroys a button on request
 * and binds the button to a command adapter.
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

   show: function(hudSystem, x, y)
   {
      var icon = null;

      this.hide();
      if (this.iconCreator)
      {
         icon = this.iconCreator();
      }
      this.button = new upro.hud.Button(hudSystem, x, y, icon,
         this.commandAdapter.isCommandPossible(), this.commandAdapter.isCommandActive());
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

/**
 * A table element displays structured data in rows and columns.
 * The data is stored in a TableModel, which can (and must) be set externally.
 */
upro.hud.Table = Class.create(
{
   initialize: function(hudSystem, x, y, maxRows, colData)
   {
      var i;

      this.hudSystem = hudSystem;
      this.x = x;
      this.y = y;
      this.maxRows = maxRows;
      this.colData = colData;

      this.viewIndex = 0;
      this.model = new upro.hud.TableModel(this);
      this.keyHandler = new upro.hud.TableModelKeyboardHandler(this.model);

      this.width = 0;
      for (i = 0; i < colData.length; i++)
      {
         this.width += colData[i].width;
      }

      this.background = this.hudSystem.paper.rect(x, y, this.width, upro.hud.Table.ROW_HEIGHT);
      this.background.attr(
      {
         "fill": "#423f22",
         "fill-opacity": 0.5,
         "stroke": "#000000",
         "stroke-opacity": 0.0,
         "stroke-width": 0
      });
      this.editground = this.hudSystem.paper.rect(x, y, 0, upro.hud.Table.ROW_HEIGHT).hide();
      this.editground.attr(
      {
         "stroke-width": 0,
         "stroke-opacity": 0.0,
         "fill": "#FFFFFF",
         "fill-opacity": 0.2
      });
      this.foreground = this.hudSystem.paper.rect(x, y, this.width, upro.hud.Table.ROW_HEIGHT);
      this.foreground.attr(
      {
         "fill": "#000000",
         "fill-opacity": 0.1,
         "stroke": "#741",
         "stroke-opacity": 0.8,
         "stroke-width": 1
      });
      {  // set up pointer handler
         var pointerHandler = new upro.sys.PointerHandler();
         var realThis = this;
         var extended = Element.extend(this.foreground[0]);

         pointerHandler.onRotate = function(position, buttonStates, rotation)
         {
            if (rotation[1] != 0)
            {
               realThis.setViewIndex(realThis.viewIndex + (rotation[1] / -120));
            }
         };
         pointerHandler.onMove = this.onPointerMove.bind(this);
         pointerHandler.onDown = this.onPointerDown.bind(this);
         new upro.sys.MouseListener(pointerHandler, extended);
      }
      {  // set up keyboard handler
         var keyboardHandler = null;

         new upro.sys.KeyboardListener(keyboardHandler, extended);
      }

      this.viewRows = [];
   },

   destroy: function()
   {
      this.hudSystem.removeKeyFocus(this.keyHandler);
      this.cleanViewRows(0);
      this.background.remove();
      this.foreground.remove();
   },

   getModel: function()
   {
      return this.model;
   },

   setModel: function(model)
   {
      this.model = model;
      this.keyHandler.setModel(model);
      this.onModelChanged(0);
   },

   /**
    * Callback from model to notify of a change in the row constellation.
    * @param startIndex the first index that may have changed data
    */
   onModelChanged: function(startIndex)
   {
      {  // ensure the current edit index is visible
         var editIndex = this.model.getEditCellIndex();

         if (editIndex >= 0)
         {
            this.hudSystem.setKeyFocus(this.keyHandler);
            if (editIndex < this.viewIndex)
            {
               this.viewIndex = editIndex;
            }
            else if (editIndex >= (this.viewIndex + this.maxRows))
            {
               this.viewIndex += editIndex - (this.viewIndex + this.maxRows) + 1;
            }
         }
         else
         {
            this.hudSystem.removeKeyFocus(this.keyHandler);
         }
      }

      if ((startIndex >= this.viewIndex) && (startIndex < (this.viewIndex + this.maxRows)))
      {  // change is visible
         var rowCount = this.model.getRowCount(), viewAmount = rowCount;

         if (viewAmount > this.maxRows)
         {
            viewAmount = this.maxRows;
         }
         this.cleanViewRows(viewAmount); // remove rows not visible anymore

         if (viewAmount == 0)
         {
            viewAmount = 1;
         }
         this.background.attr({"height": viewAmount * upro.hud.Table.ROW_HEIGHT});
         this.foreground.attr({"height": viewAmount * upro.hud.Table.ROW_HEIGHT});

         if (this.viewIndex > (rowCount - this.maxRows))
         {  // one of the last entries was removed, have to scroll up
            startIndex = this.viewIndex = (rowCount - this.maxRows);
            if (startIndex < 0)
            {
               startIndex = this.viewIndex = 0;
            }
         }

         this.updateCells(startIndex);
      }
   },

   /**
    * Updates the visible cells starting with given model row index
    * @param startIndex index into model rows to start with
    */
   updateCells: function(startIndex)
   {
      var viewRowOffset = 0, colData, viewRow, i, cell, x, y,
         endIndex = this.model.getRowCount() - this.viewIndex, editSeen = false;

      if (endIndex > this.maxRows)
      {
         endIndex = this.maxRows;
      }
      y = this.y + (upro.hud.Table.ROW_HEIGHT * viewRowOffset);
      while (viewRowOffset < endIndex)
      {
         if (viewRowOffset >= this.viewRows.length)
         {
            viewRow = [];
            this.viewRows.push(viewRow);
         }
         else
         {
            viewRow = this.viewRows[viewRowOffset];
         }
         x = this.x;
         for (i = 0; i < this.colData.length; i++)
         {
            colData = this.colData[i];

            if (i < viewRow.length)
            {
               cell = viewRow[i];
            }
            else
            {
               cell = new upro.hud.Label(this.hudSystem, x, y, colData.width, upro.hud.Table.ROW_HEIGHT);
               cell.setElementsBefore(this.foreground);
               viewRow.push(cell);
            }
            this.model.updateCell(this.viewIndex + viewRowOffset, colData.name, cell);
            if (this.model.isEditCell(this.viewIndex + viewRowOffset, colData.name))
            {
               this.editground.attr({ "x": x, "y": y, "width": colData.width });
               this.editground.show();
               editSeen = true;
            }

            x += colData.width;
         }
         y += upro.hud.Table.ROW_HEIGHT;
         viewRowOffset++;
      }
      if (!editSeen)
      {
         this.editground.hide();
      }
   },

   /**
    * Cleans up view rows until a given target amount is reached.
    * @param targetAmount Not more than this given amount of rows shall exist.
    */
   cleanViewRows: function(targetAmount)
   {
      var viewRow = null, i, j;

      for (i = this.viewRows.length - 1; i >= targetAmount; i--)
      {
         viewRow = this.viewRows[i];
         this.viewRows.pop();
         for (j = 0; j < viewRow.length; j++)
         {
            viewRow[j].destroy();
         }
      }
   },

   /**
    * Returns the view index
    * @return the view index
    */
   getViewIndex: function()
   {
      return this.viewIndex;
   },

   /**
    * Sets the new view index. The function clips internally.
    * @param value to set to
    */
   setViewIndex: function(value)
   {
      var rowCount = this.model.getRowCount();

      this.viewIndex = value;
      if (this.viewIndex > (rowCount - this.maxRows))
      {  // clip at end
         this.viewIndex = rowCount - this.maxRows;
      }
      if (this.viewIndex < 0)
      {  // clip at beginning
         this.viewIndex = 0;
      }
      this.updateCells(this.viewIndex);
   },

   onPointerMove: function(position, buttonStates)
   {
      // TODO: model highlighting
   },

   onPointerDown: function(position, buttonStates)
   {
      var realPos = this.hudSystem.pixelToReal(position.x, position.y);
      var viewPos = this.hudSystem.realToViewCoordinates(realPos);
      var offset = Math.floor((viewPos.y - this.y) / upro.hud.Table.ROW_HEIGHT);
      var columnKey = null, x = this.x;

      for (var i = 0; (columnKey == null) && (i < this.colData.length); i++)
      {
         var colData = this.colData[i];

         if ((viewPos.x >= x) && (viewPos.x < (x + colData.width)))
         {
            columnKey = colData.name;
         }
         x += colData.width;
      }

      this.model.setEditCell(this.viewIndex + offset, columnKey);
   }

});

upro.hud.Table.ROW_HEIGHT = 20;

/**
 * A table model is the actual data backing a table display.
 */
upro.hud.TableModel = Class.create(
{
   initialize: function(table)
   {

   },

   /**
    * Returns the number of rows existing in the model
    * @return the number of rows
    */
   getRowCount: function()
   {
      return 0;
   },

   /**
    * Requests to update the contents of a cell, identified by
    * index and column key.
    * @param index 0 based index into the rows
    * @param columnKey key of the column
    * @param cell a upro.hud.Label instance for display
    */
   updateCell: function(index, columnKey, cell)
   {

   },

   /**
    * Returns the row index of the currently selected edit cell
    * @return the row index of the currently selected edit cell
    */
   getEditCellIndex: function()
   {
      return -1;
   },

   /**
    * Request to set an edit cell
    * @param index row index
    * @param columnKey column key
    */
   setEditCell: function(index, columnKey)
   {

   },

   /**
    * Returns true if the given cell key identifies the edit cell
    * @return true if the given cell key identifies the edit cell
    */
   isEditCell: function(index, columnKey)
   {
      return false;
   },

   /**
    * Requests to set the edit cell to the previous row
    */
   setEditCellPrevRow: function()
   {

   },

   /**
    * Requests to set the edit cell to the next row
    */
   setEditCellNextRow: function()
   {

   },

   editCellRemoveCharacter: function()
   {

   },

   editCellAddCharacter: function(charCode)
   {

   }

});

/** A NULL object that contains no data and ignores any edit requests */
upro.hud.TableModel.NULL = new upro.hud.TableModel();

/**
 * A simple table model is a linear list of rows containing
 * structures whose column keys are members.
 * 'Edit' cells are simple focus cells
 */
upro.hud.SimpleTableModel = Class.create(
{
   initialize: function(table)
   {
      this.table = table;

      this.rows = [];

      this.editIndex = -1;
      this.editColumnKey = null;
   },

   getRowCount: function()
   {
      return this.rows.length;
   },

   addRow: function(data)
   {
      this.rows.push(data);
      this.table.onModelChanged(this.rows.length - 1);
   },

   removeRow: function(index)
   {
      if ((index >= 0) && (index < this.rows.length))
      {
         this.rows.splice(index, 1);
         this.table.onModelChanged(index);
      }
   },

   updateCell: function(index, columnKey, cell)
   {
      cell.setText(this.rows[index][columnKey]);
   },

   getEditCellIndex: function()
   {
      return this.editIndex;
   },

   setEditCell: function(index, columnKey)
   {
      if ((this.editIndex != index) || (this.editColumnKey != columnKey))
      {
         var oldIndex = this.editIndex;

         this.editIndex = -1;
         this.editColumnKey = null;
         if (oldIndex >= 0)
         {  // notify of lost status
            this.table.onModelChanged(oldIndex);
         }
         this.editIndex = index;
         this.editColumnKey = columnKey;
         if (this.editIndex >= 0)
         {  // notify of new status
            this.table.onModelChanged(this.editIndex);
         }
      }
   },

   isEditCell: function(index, columnKey)
   {
      return (this.editIndex == index) && (this.editColumnKey == columnKey);
   },

   setEditCellPrevRow: function()
   {
      if (this.editIndex > 0)
      {
         this.editIndex--;
         this.table.onModelChanged(this.editIndex);
      }
   },

   setEditCellNextRow: function()
   {
      if (this.editIndex < (this.rows.length - 1))
      {
         this.editIndex++;
         this.table.onModelChanged(this.editIndex - 1);
      }
   }

});


/**
 * This is a keyboard handler for table models
 * It converts key strokes to specific table model commands
 *
 * TODO: This is actually a HudSystemKeyboardFocusHandler, because of the additional onFocusLost()
 */
upro.hud.TableModelKeyboardHandler = Class.create(upro.sys.KeyboardHandler,
{
   initialize: function(model)
   {
      this.model = model;
   },

   setModel: function(model)
   {
      this.model = model;
   },

   onFocusLost: function()
   {
      this.model.setEditCell(-1, null);
   },

   /** {@inheritDoc} */
   onDown: function(keyCode)
   {
      if (keyCode == Event.KEY_RETURN)
      {
         this.model.setEditCell(-1, null);
      }
      else if (keyCode == Event.KEY_UP)
      {
         this.model.setEditCellPrevRow();
      }
      else if (keyCode == Event.KEY_DOWN)
      {
         this.model.setEditCellNextRow();
      }
      else if (keyCode == Event.KEY_BACKSPACE)
      {
         this.model.editCellRemoveCharacter();
      }

      return true;
   },

   /** {@inheritDoc} */
   onUp: function(keyCode)
   {
      return true;
   },

   /** {@inheritDoc} */
   onPress: function(charCode)
   {
      this.model.editCellAddCharacter(charCode);

      return true;
   }

});

/** */
upro.data = {};

/**
 * An info id is the key for any information structure
 */
upro.data.InfoId = Class.create(
{
   /**
    * Constructor
    * @param type a string identification of the type
    * @param id an optional parameter. If omitted, a new UUID value is created
    */
   initialize: function(type, id)
   {
      this.type = type;
      this.id = id ? id : upro.Uuid.newV4();
   },

   /**
    * Returns string presentation
    * @return string presentation
    */
   toString: function()
   {
      return "" + this.type + "[" + this.id + "]";
   },

   /**
    * Returns the type
    * @return the type
    */
   getType: function()
   {
      return this.type;
   },

   /**
    * Returns the id
    * @return the id
    */
   getId: function()
   {
      return this.id;
   }
});

/** The 'System' entry is the root object for everything */
upro.data.InfoId.System = new upro.data.InfoId("System", upro.Uuid.Empty);

/**
 * This registry maps info types to their factory function
 */
upro.data.InfoTypeFactory = Class.create(
{
   initialize: function()
   {
      this.factoryByType = {};
   },

   /**
    * This registers a factory function
    * 
    * @param type type string to register for
    * @param a function to register, returns a new object for type
    */
   register: function(type, factory)
   {
      this.factoryByType[type] = factory;
   },

   /**
    * This creates an object for given type
    * 
    * @param infoId to create an object for
    * @param dataStore the dataStore querying the object
    * @return A DataStoreInfo object for given type
    */
   create: function(infoId, dataStore)
   {
      var factory = this.factoryByType[infoId.getType()];
      var info = null;

      if (factory !== undefined)
      {
         info = factory(infoId, dataStore);
      }

      return info;
   }
});

/** Singleton instance */
upro.data.InfoTypeFactory.Instance = new upro.data.InfoTypeFactory();

/**
 * A data store info is the interface to the user (listener) of a data store
 */
upro.data.DataStoreInfo = Class.create(
{
   initialize: function(infoId)
   {
      this.infoId = infoId;
   },

   /**
    * Returns string presentation
    * @return string presentation
    */
   toString: function()
   {
      return "DataStoreInfo:" + this.infoId.toString();
   },

   /**
    * Returns the info id
    * @return the info id
    */
   getInfoId: function()
   {
      return this.infoId;
   },

   /**
    * Decodes a boolean value and sets a member with the same name
    * @param properties property map that was used for update
    * @param propertyName of the property and the member
    * @return true if a value was decoded
    */
   decodeBooleanMember: function(properties, propertyName)
   {
      var value = properties[propertyName];
      var rCode = false;

      if (value !== undefined)
      {
         this[propertyName] = ("" + value) != "0";
         rCode = true;
      }

      return rCode;
   },

   /**
    * Decodes a number value and sets a member with the same name
    * @param properties property map that was used for update
    * @param propertyName of the property and the member
    * @return true if a value was decoded
    */
   decodeNumberMember: function(properties, propertyName)
   {
      var value = properties[propertyName];
      var rCode = false;

      if (value !== undefined)
      {
         this[propertyName] = new Number(value);
         rCode = true;
      }

      return rCode;
   },

   /**
    * Decodes a string value and sets a member with the same name
    * @param properties property map that was used for update
    * @param propertyName of the property and the member
    * @return true if a value was decoded
    */
   decodeStringMember: function(properties, propertyName)
   {
      var value = properties[propertyName];
      var rCode = false;

      if (value !== undefined)
      {
         this[propertyName] = ("" + value);
         rCode = true;
      }

      return rCode;
   },

   /**
    * Called when this info became deleted. Either explicitly, or as the
    * result of removing the last owning parent reference.
    */
   onDeleted: function()
   {

   },

   /**
    * Called whenever this info became its properties updated. The passed
    * map of properties lists the requested changes.
    * @param properties map of properties to update
    */
   onUpdated: function(properties)
   {

   },

   /**
    * Called when this info became referenced to another.
    * The child is notified of its parent first.
    * @param info the referenced info
    */
   onReferenceAdded: function(info)
   {

   },

   /**
    * Called when this info lost its reference to another.
    * The parent is notified first.
    * @param info the referenced info
    */
   onReferenceRemoved: function(info)
   {

   }
});

/**
 *
 */
upro.data.DataStore = Class.create(
{
   initialize: function()
   {

   },

   /**
    * This creates a transaction for this store with which
    * data can be modified after commit.
    * @return A DataStoreWriteTransaction object
    */
   createWriteTransaction: function()
   {
      return null;
   }
});

/**
 * A data store modifier is used behind a transaction
 */
upro.data.DataStoreModifier = Class.create(
{
   initialize: function()
   {

   },

   /**
    * Creates an information structure.
    * @param parentId the first (owning) reference this info is hooked under
    * @param infoId the id of the info to create
    * @param properties a map of initial properties to set
    * @return true if was OK
    */
   createInfo: function(parentId, infoId, properties)
   {
      return false;
   },

   /**
    * Modifies an information structure.
    * @param infoId the id of the info to modify
    * @param properties a map of properties to set
    * @return true if was OK
    */
   updateInfo: function(infoId, properties)
   {
      return false;
   },

   /**
    * Deletes an information.
    * @param infoId the id of the info to delete
    * @return true if was OK
    */
   deleteInfo: function(infoId)
   {
      return false;
   },

   /**
    * Adds a reference from infoId to parentId, either owning or informative.
    * An info can have more than one parent and more than one of them can be owning.
    * @param infoId the id of the info to receive an additional parent
    * @param parentId the id of the referenced parent
    * @param owning whether this new reference is an owning one
    * @return true if was OK
    */
   addReference: function(infoId, parentId, owning)
   {
      return false;
   },

   /**
    * Removes a reference from infoId to parentId.
    * If the reference is the last owning reference of this info, it is deleted.
    * @param infoId the id of the info to modify
    * @param parentId the id of the referenced parent
    * @return true if was OK
    */
   removeReference: function(infoId, parentId)
   {
      return false;
   }
});

/**
 * A write transaction is the basis for any modification
 * within a data store
 */
upro.data.DataStoreWriteTransaction = Class.create(
{
   initialize: function()
   {

   },

   /**
    * This function commits the transaction. Only then the previously
    * entered modifications are executed.
    */
   commit: function()
   {

   },

   /**
    * Creates an information structure.
    * Fails during commit if parent does not exist or 'new' info already exists.
    * @param parentId the first (owning) reference this info is hooked under
    * @param infoId the id of the info to create
    * @param properties a map of initial properties to set
    */
   createInfo: function(parentId, infoId, properties)
   {

   },

   /**
    * Modifies an information structure.
    * Fails during commit if info does not exist.
    * @param infoId the id of the info to modify
    * @param properties a map of properties to set
    */
   updateInfo: function(infoId, properties)
   {

   },

   /**
    * Deletes an information.
    * Action is ignored if info is already deleted.
    * @param infoId the id of the info to delete
    */
   deleteInfo: function(infoId)
   {

   },

   /**
    * Adds a reference from infoId to parentId, either owning or informative.
    * An info can have more than one parent and more than one of them can be owning.
    * Fails if either info or parent do not exist.
    * @param infoId the id of the info to receive an additional parent
    * @param parentId the id of the referenced parent
    * @param owning whether this new reference is an owning one
    */
   addReference: function(infoId, parentId, owning)
   {

   },

   /**
    * Removes a reference from infoId to parentId.
    * If the reference is the last owning reference of this info, it is deleted.
    * If either info objects or the reference do not exist, this action is ignored.
    * @param infoId the id of the info to modify
    * @param parentId the id of the referenced parent
    */
   removeReference: function(infoId, parentId)
   {

   }
});

/**
 * The memory data store holds the data in memory
 */
upro.data.MemoryDataStore = Class.create(upro.data.DataStore,
{
   initialize: function()
   {
      this.store = {};
      this.pendingActions = [];

      this.initializeStore();
   },

   /**
    * This creates a transaction for this store with which data can be modified after commit.
    * 
    * @return A DataStoreWriteTransaction object
    */
   createWriteTransaction: function()
   {
      return new upro.data.MemoryDataStoreWriteTransaction(this);
   },

   /**
    * Returns the entry for given id
    * 
    * @return the entry for given id
    */
   getEntry: function(infoId)
   {
      var typeMap = this.store[infoId.getType()];
      var entry = undefined;

      if (typeMap != undefined)
      {
         entry = typeMap[infoId.getId()];
      }

      return entry;
   },

   /**
    * Returns the reference between the given two entries
    * 
    * @return the reference between the given two entries { undefined, false, true }
    */
   getReference: function(infoId, parentId)
   {
      var entry = this.getEntry(infoId);
      var ref = undefined;

      if (entry !== undefined)
      {
         ref = entry.getReference(parentId);
      }

      return ref;
   },

   /**
    * Returns true if the info with given id exists
    * 
    * @param infoId the id to look for
    * @return true if the info with given id exists
    */
   containsEntry: function(infoId)
   {
      return this.getEntry(infoId) != undefined;
   },

   /**
    * Creates an entry for given id
    * 
    * @param infoId key to use
    * @return a registered entry object
    */
   createEntry: function(infoId)
   {
      var typeMap = this.store[infoId.getType()];
      var entry = new upro.data.MemoryDataStoreEntry(infoId, this);

      if (typeMap === undefined)
      {
         this.store[infoId.getType()] = typeMap = {};
      }
      typeMap[infoId.getId()] = entry;

      return entry;
   },

   /**
    * Deletes entry with given key
    * 
    * @param infoId key to look for
    */
   deleteEntry: function(infoId)
   {
      var entry = this.getEntry(infoId);

      if (entry !== undefined)
      {
         delete this.store[infoId.getType()][infoId.getId()];

         for ( var childIdString in entry.children)
         { // un-own all children (deletes them if orphaned)
            var child = entry.children[childIdString];

            this.setReference(child, entry, undefined);
         }
         for ( var parentIdString in entry.references)
         { // remove all parent references
            var parent = entry.references[parentIdString].entry;

            this.setReference(entry, parent, undefined);
         }

         entry.destruct();
      }
   },

   /**
    * Sets the reference between given entry and a parent Notifies the bound objects (if existing). If the reference is
    * removed and the entry has no owner, it is deleted
    * 
    * @param entry child entry
    * @param parent parent entry
    * @param owning true, false or undefined (which removes the reference)
    */
   setReference: function(entry, parent, owning)
   {
      var exists = parent.children[entry.infoId.toString()];

      if (owning === undefined)
      {
         if (exists)
         {
            delete parent.children[entry.infoId.toString()];
            delete entry.references[parent.infoId.toString()];
            parent.notifyReferenceRemoved(entry);
            entry.notifyReferenceRemoved(parent);
         }
      }
      else
      {
         parent.children[entry.infoId.toString()] = entry;
         entry.references[parent.infoId.toString()] =
         {
            "entry": parent,
            "owning": owning
         };
         if (!exists)
         {
            entry.notifyReferenceAdded(parent);
            parent.notifyReferenceAdded(entry);
         }
      }
      if (!entry.isOwned())
      {
         this.deleteEntry(entry.infoId);
      }
   },

   initializeStore: function()
   {
      // this.createEntry(upro.data.InfoId.System);
   },

   /**
    * Commits given list of actions (called from Transaction)
    * 
    * @param actions array of functions accepting a modifier as parameter
    */
   commit: function(actions)
   {
      this.pendingActions.push(actions);
      this.deferProcessPendingActions();
   },

   /**
    * Defers the processing of pending actions
    */
   deferProcessPendingActions: function()
   {
      this.processPendingActions.bind(this).defer();
   },

   /**
    * Processes the oldest entry of pending actions
    */
   processPendingActions: function()
   {
      if (this.pendingActions.length > 0)
      {
         var actions = this.pendingActions.pop();

         this.processActions(actions);
      }
   },

   /**
    * Processes the given list of actions
    * 
    * @param actions array of functions accepting a modifier as parameter
    */
   processActions: function(actions)
   {
      if (this.areActionsOk(actions))
      {
         var executor = new upro.data.MemoryDataStoreModifyExecutor(this);

         for ( var i = 0; i < actions.length; i++)
         {
            var action = actions[i];

            action(executor);
         }
      }
   },

   /**
    * Returns true if given list of actions (as part of a transactions) are OK
    * 
    * @return true if given list of actions (as part of a transactions) are OK
    */
   areActionsOk: function(actions)
   {
      var tester = new upro.data.MemoryDataStoreModifyTester(this);
      var ok = true;

      for ( var i = 0; ok && (i < actions.length); i++)
      {
         var action = actions[i];

         ok = action(tester);
      }

      return ok;
   }
});

/**
 * This entry is the memory-internal storage for one info of a data store
 */
upro.data.MemoryDataStoreEntry = Class.create(
{
   initialize: function(infoId, dataStore)
   {
      this.infoId = infoId;
      this.properties = {};
      this.references = {};
      this.children = {};

      this.boundObject = upro.data.InfoTypeFactory.Instance.create(this.infoId, dataStore);
   },

   /**
    * Called when this entry becomes destroyed
    */
   destruct: function()
   {
      if (this.boundObject)
      {
         this.boundObject.onDeleted();
         this.boundObject = null;
      }
   },

   /**
    * Returns string presentation
    * @return string presentation
    */
   toString: function()
   {
      return "DataStoreEntry:" + this.infoId.toString();
   },

   /**
    * Returns true if this entry is owned by at least one other
    * @return true if this entry is owned by at least one other
    */
   isOwned: function()
   {
      var rCode = false;

      for (var ref in this.references)
      {
         if (this.references[ref].owning)
         {
            rCode = true;
         }
      }

      return rCode;
   },

   /**
    * Returns the reference to given parent id
    * @param parentId to query
    * @return the reference to given parent id { undefined, false, true }
    */
   getReference: function(parentId)
   {
      var ref = this.references[parentId];
      var owning = undefined;

      if (ref !== undefined)
      {
         owning = ref.owning;
      }

      return owning;
   },

   /**
    * Sets the properties from given map
    * @param properties to set
    */
   setProperties: function(properties)
   {
      for (var name in properties)
      {
         var value = properties[name];

         this.properties[name] = value;
      }
      if (this.boundObject)
      {
         this.boundObject.onUpdated(properties);
      }
   },

   /**
    * Notifies the bound object (if existing) of becoming referenced to another
    * @param other the referenced entry.
    */
   notifyReferenceAdded: function(other)
   {
      if (this.boundObject && other.boundObject)
      {
         this.boundObject.onReferenceAdded(other.boundObject);
      }
   },

   /**
    * Notifies the bound object (if existing) of losing a reference to another
    * @param other the referenced entry.
    */
   notifyReferenceRemoved: function(other)
   {
      if (this.boundObject && other.boundObject)
      {
         this.boundObject.onReferenceRemoved(other.boundObject);
      }
   }

});

/**
 * A write transaction is the basis for any modification
 * within a data store
 */
upro.data.MemoryDataStoreWriteTransaction = Class.create(upro.data.DataStoreWriteTransaction,
{
   initialize: function(dataStore)
   {
      this.dataStore = dataStore;
      this.actions = [];
   },

   /** {@inheritDoc} */
   commit: function()
   {
      var actions = this.actions;

      this.actions = [];
      this.dataStore.commit(actions);
   },

   /** {@inheritDoc} */
   createInfo: function(parentId, infoId, properties)
   {
      this.actions.push(function(a) { return a.createInfo(parentId, infoId, properties); });
   },

   /** {@inheritDoc} */
   updateInfo: function(infoId, properties)
   {
      this.actions.push(function(a) { return a.updateInfo(infoId, properties); });
   },

   /** {@inheritDoc} */
   deleteInfo: function(infoId)
   {
      this.actions.push(function(a) { return a.deleteInfo(infoId); });
   },

   /** {@inheritDoc} */
   addReference: function(infoId, parentId, owning)
   {
      this.actions.push(function(a) { return a.addReference(infoId, parentId, owning); });
   },

   /** {@inheritDoc} */
   removeReference: function(infoId, parentId)
   {
      this.actions.push(function(a) { return a.removeReference(infoId, parentId); });
   }
});

/**
 * This modifier tests whether the whole transaction would be OK
 */
upro.data.MemoryDataStoreModifyTester = Class.create(upro.data.DataStoreModifier,
{
   initialize: function(store)
   {
      this.store = store;
      this.objectLife = {};
   },

   /**
    * Returns true if the given info Id has been created, or still exists
    * in the store - and hasn't been deleted by a previous action.
    * @return true if the given info Id would be present
    */
   isEntryAlive: function(infoId)
   {
      var rCode = false;
      var alive = this.objectLife[infoId.toString()];

      if (alive === undefined)
      {
         rCode = this.store.containsEntry(infoId);
      }
      else if (alive === true)
      {
         rCode = true;
      }
      else if (alive === false)
      {
         rCode = false;
      }

      return rCode;
   },

   /** {@inheritDoc} */
   createInfo: function(parentId, infoId, properties)
   {
      var rCode = this.isEntryAlive(parentId) && !this.isEntryAlive(infoId);

      if (rCode)
      {
         this.objectLife[infoId.toString()] = true;
      }

      return rCode;
   },

   /** {@inheritDoc} */
   updateInfo: function(infoId, properties)
   {
      return this.isEntryAlive(infoId);
   },

   /** {@inheritDoc} */
   deleteInfo: function(infoId)
   {
      this.objectLife[infoId.toString()] = false;

      return true;
   },

   /** {@inheritDoc} */
   addReference: function(infoId, parentId, owning)
   {
      return this.isEntryAlive(parentId) && this.isEntryAlive(infoId);
   },

   /** {@inheritDoc} */
   removeReference: function(infoId, parentId)
   {
      return true;
   }
});

/**
 * This modifier does the actual work
 */
upro.data.MemoryDataStoreModifyExecutor = Class.create(upro.data.DataStoreModifier,
{
   initialize: function(store)
   {
      this.store = store;
   },

   /** {@inheritDoc} */
   createInfo: function(parentId, infoId, properties)
   {
      var parent = this.store.getEntry(parentId);
      var entry = this.store.createEntry(infoId);

      entry.setProperties(properties);
      this.store.setReference(entry, parent, true);

      return true;
   },

   /** {@inheritDoc} */
   updateInfo: function(infoId, properties)
   {
      var entry = this.store.getEntry(infoId);

      entry.setProperties(properties);

      return true;
   },

   /** {@inheritDoc} */
   deleteInfo: function(infoId)
   {
      this.store.deleteEntry(infoId);

      return true;
   },

   /** {@inheritDoc} */
   addReference: function(infoId, parentId, owning)
   {
      var parent = this.store.getEntry(parentId);
      var entry = this.store.getEntry(infoId);

      this.store.setReference(entry, parent, owning);

      return true;
   },

   /** {@inheritDoc} */
   removeReference: function(infoId, parentId)
   {
      var parent = this.store.getEntry(parentId);
      var entry = this.store.getEntry(infoId);

      if ((parent !== undefined) && (entry !== undefined))
      {
         this.store.setReference(entry, parent, undefined);
      }

      return true;
   }
});

/**
 * The model namespace contains the domain logic of the whole system.
 */
upro.model = {};

/**
 * User settings contain the basic things how a user likes his system.
 */
upro.model.AbstractProxiedDataStoreInfo = Class.create(upro.data.DataStoreInfo,
{
   initialize: function($super, infoId)
   {
      $super(infoId);

      this.deletedCallback = null;
   },

   onDeleted: function()
   {
      if (this.deletedCallback)
      {
         this.deletedCallback();
      }
   }

});

/**
 *
 */
upro.model.UserSession = Class.create(upro.model.AbstractProxiedDataStoreInfo,
{
   initialize: function($super, infoId)
   {
      $super(infoId);

      this.corridorPrepSystemId = null;
      this.corridorPrepJumpType = null;
      this.corridorPreparationChanged = null;
   },

   /**
    * Returns the prepared system id for a new corridor
    * @return the prepared system id for a new corridor
    */
   getCorridorPrepSystemId: function()
   {
      return this.corridorPrepSystemId;
   },

   /**
    * Returns the prepared jump type for a new corridor
    * @return the prepared jump type for a new corridor
    */
   getCorridorPrepJumpType: function()
   {
      return this.corridorPrepJumpType;
   },

   /** {@inheritDoc} */
   onUpdated: function(properties)
   {
      var changed = false;

      {  // corridor preparation
         changed = false;
         if (this.decodeNumberMember(properties, upro.model.UserSession.PROPERTY_CORRIDOR_PREP_SYSTEM_ID))
         {
            changed = true;
         }
         if (this.decodeStringMember(properties, upro.model.UserSession.PROPERTY_CORRIDOR_PREP_JUMP_TYPE))
         {
            changed = true;
         }
         if (changed && this.corridorPreparationChanged)
         {
            this.corridorPreparationChanged();
         }
      }
   }
});

upro.model.UserSession.TYPE = "UserSession";
upro.model.UserSession.PROPERTY_CORRIDOR_PREP_SYSTEM_ID = "corridorPrepSystemId";
upro.model.UserSession.PROPERTY_CORRIDOR_PREP_JUMP_TYPE = "corridorPrepJumpType";

/**
 * User settings contain the basic things how a user likes his system.
 */
upro.model.UserSettings = Class.create(upro.model.AbstractProxiedDataStoreInfo,
{
   initialize: function($super, infoId)
   {
      $super(infoId);

      this.activeGalaxy = null;
      this.activeGalaxyChanged = null;

      this.ignoredSolarSystems = [];
      this.ignoredSolarSystemsChanged = null;

      this.routingCapJumpGatesInUse = false;
      this.routingCapJumpDriveInUse = false;
      this.routingCapJumpDriveRange = 0;
      this.routingCapabilitiesChanged = null;

      this.routingRules = {};
      this.routingRuleChangedHandler = this.onRoutingRuleChanged.bind(this);
      this.routingRulesChanged = null;
   },

   getActiveGalaxy: function()
   {
      return this.activeGalaxy;
   },

   /**
    * Returns whether the jump gates capability is in use
    * @return whether the jump gates capability is in use
    */
   getRoutingCapJumpGatesInUse: function()
   {
      return this.routingCapJumpGatesInUse;
   },

   /**
    * Returns whether the jump drive capability is in use
    * @return whether the jump drive capability is in use
    */
   getRoutingCapJumpDriveInUse: function()
   {
      return this.routingCapJumpDriveInUse;
   },

   /**
    * Returns the range of the jump drive
    * @return the range of the jump drive
    */
   getRoutingCapJumpDriveRange: function()
   {
      return this.routingCapJumpDriveRange;
   },

   /**
    * Returns an array of UserIgnoredSolarSystem entries
    * @return an array of UserIgnoredSolarSystem entries
    */
   getIgnoredSolarSystems: function()
   {
      return this.ignoredSolarSystems.slice(0);
   },

   setActiveGalaxy: function(galaxyId)
   {
      if (this.activeGalaxy != galaxyId)
      {
         this.activeGalaxy = galaxyId;
         if (this.activeGalaxyChanged !== null)
         {
            this.activeGalaxyChanged();
         }
      }
   },

   /** {@inheritDoc} */
   onUpdated: function(properties)
   {
      {
         var activeGalaxy = properties[upro.model.UserSettings.PROPERTY_ACTIVE_GALAXY];

         if (activeGalaxy !== undefined)
         {
            this.setActiveGalaxy(activeGalaxy);
         }
      }
      {  // routing capabilities
         var capChanged = false;

         if (this.decodeBooleanMember(properties, upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_GATES_IN_USE))
         {
            capChanged = true;
         }
         if (this.decodeBooleanMember(properties, upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_DRIVE_IN_USE))
         {
            capChanged = true;
         }
         if (this.decodeNumberMember(properties, upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_DRIVE_RANGE))
         {
            capChanged = true;
         }
         if (capChanged && this.routingCapabilitiesChanged)
         {
            this.routingCapabilitiesChanged();
         }
      }
   },

   /** {@inheritDoc} */
   onReferenceAdded: function(info)
   {
      if (info.getInfoId().getType() == upro.model.UserIgnoredSolarSystem.TYPE)
      {
         this.ignoredSolarSystems.push(info);
         if (this.ignoredSolarSystemsChanged)
         {
            this.ignoredSolarSystemsChanged();
         }
      }
      else if (info.getInfoId().getType() == upro.model.UserRoutingRule.TYPE)
      {
         this.routingRules[info.getRuleType()] = info;
         info.changedCallback = this.routingRuleChangedHandler;
         this.onRoutingRuleChanged();
      }
   },

   /** {@inheritDoc} */
   onReferenceRemoved: function(info)
   {
      if (info.getInfoId().getType() == upro.model.UserIgnoredSolarSystem.TYPE)
      {
         var index = this.ignoredSolarSystems.indexOf(info);

         if (index >= 0)
         {
            this.ignoredSolarSystems.splice(index, 1);
            if (this.ignoredSolarSystemsChanged)
            {
               this.ignoredSolarSystemsChanged();
            }
         }
      }
      else if (info.getInfoId().getType() == upro.model.UserRoutingRule.TYPE)
      {
         delete this.routingRules[info.getRuleType()];
         info.changedCallback = null;
         this.onRoutingRuleChanged();
      }
   },

   /**
    * Calls the owner change callback
    */
   onRoutingRuleChanged: function()
   {
      if (this.routingRulesChanged)
      {
         this.routingRulesChanged();
      }
   },

   /**
    * Returns the routing rule by rule type
    * @return the routing rule by rule type
    */
   getRoutingRuleByType: function(ruleType)
   {
      return this.routingRules[ruleType];
   },

   /**
    * Returns an array of the assigned rules, sorted by index
    * @return an array of the assigned rules, sorted by index
    */
   getRoutingRules: function()
   {
      var result = [];

      for (var ruleType in this.routingRules)
      {
         result.push(this.routingRules[ruleType]);
      }
      result.sort(function sortByIndex(a, b)
      {
         return a.getIndex() - b.getIndex();
      });

      return result;
   }

});

upro.model.UserSettings.TYPE = "UserSettings";
upro.model.UserSettings.PROPERTY_ACTIVE_GALAXY = "activeGalaxy";
upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_GATES_IN_USE = "routingCapJumpGatesInUse";
upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_DRIVE_IN_USE = "routingCapJumpDriveInUse";
upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_DRIVE_RANGE = "routingCapJumpDriveRange";

upro.model.UserSettings.JumpDriveConstants =
{
   MinimumRange: 0.25,
   MaximumRange: 20.0,
   RangeStep: 0.25
};

/**
 * Identification of a solar system ignored by the user (for route planning)
 */
upro.model.UserIgnoredSolarSystem = Class.create(upro.data.DataStoreInfo,
{
   initialize: function($super, infoId)
   {
      $super(infoId);

      this.solarSystemId = null;
   },

   /**
    * Returns the solar system id
    * @return the solar system id
    */
   getSolarSystemId: function()
   {
      return this.solarSystemId;
   },

   /** {@inheritDoc} */
   onUpdated: function(properties)
   {
      this.solarSystemId = properties[upro.model.UserIgnoredSolarSystem.PROPERTY_SOLAR_SYSTEM_ID];
   }

});

upro.model.UserIgnoredSolarSystem.TYPE = "UserIgnoredSolarSystem";
upro.model.UserIgnoredSolarSystem.PROPERTY_SOLAR_SYSTEM_ID = "solarSystemId";

/**
 * A routing rule
 */
upro.model.UserRoutingRule = Class.create(upro.data.DataStoreInfo,
{
   initialize: function($super, infoId)
   {
      $super(infoId);

      this.index = -1;
      this.ruleType = null;
      this.inUse = false;
      this.parameter = null;

      this.changedCallback = null;
   },

   /**
    * Returns the index
    * @return the index
    */
   getIndex: function()
   {
      return this.index;
   },

   /**
    * Returns the rule type
    * @return the rule type
    */
   getRuleType: function()
   {
      return this.ruleType;
   },

   /**
    * Returns whether the rule is in use
    * @return whether the rule is in use
    */
   getInUse: function()
   {
      return this.inUse;
   },

   /**
    * Returns the parameter
    * @return the parameter
    */
   getParameter: function()
   {
      return this.parameter;
   },

   /** {@inheritDoc} */
   onUpdated: function(properties)
   {
      this.decodeNumberMember(properties, upro.model.UserRoutingRule.PROPERTY_INDEX);
      this.decodeStringMember(properties, upro.model.UserRoutingRule.PROPERTY_RULE_TYPE);
      this.decodeBooleanMember(properties, upro.model.UserRoutingRule.PROPERTY_IN_USE);
      this.decodeNumberMember(properties, upro.model.UserRoutingRule.PROPERTY_PARAMETER);
      if (this.changedCallback)
      {
         this.changedCallback(this);
      }
   }

});

upro.model.UserRoutingRule.RuleConstants = {};
upro.model.UserRoutingRule.RuleConstants["Jumps"] = { Type: "Jumps", Increment: 1, Minimum: 0, Maximum: 10, Factor: 1, Fixed: 0 };
upro.model.UserRoutingRule.RuleConstants["Jumps"].Constructor = upro.nav.finder.PathFinderCostRuleJumps;
upro.model.UserRoutingRule.RuleConstants["JumpFuel"] = { Type: "Fuel", Increment: 0.25, Minimum: 0, Maximum: 5, Factor: 1, Fixed: 2 };
upro.model.UserRoutingRule.RuleConstants["JumpFuel"].Constructor = upro.nav.finder.PathFinderCostRuleJumpFuel;
upro.model.UserRoutingRule.RuleConstants["MinSecurity"] = { Type: "MinSecurity", Increment: 1, Minimum: 0, Maximum: 5, Factor: 0.1, Fixed: 1 };
upro.model.UserRoutingRule.RuleConstants["MinSecurity"].Constructor = upro.nav.finder.PathFinderCostRuleMinSecurity;
upro.model.UserRoutingRule.RuleConstants["MaxSecurity"] = { Type: "MaxSecurity", Increment: 1, Minimum: 5, Maximum: 10, Factor: 0.1, Fixed: 1 };
upro.model.UserRoutingRule.RuleConstants["MaxSecurity"].Constructor = upro.nav.finder.PathFinderCostRuleMaxSecurity;

upro.model.UserRoutingRule.RuleLimit = 4;

upro.model.UserRoutingRule.TYPE = "UserRoutingRule";
upro.model.UserRoutingRule.PROPERTY_INDEX = "index";
upro.model.UserRoutingRule.PROPERTY_RULE_TYPE = "ruleType";
upro.model.UserRoutingRule.PROPERTY_IN_USE = "inUse";
upro.model.UserRoutingRule.PROPERTY_PARAMETER = "parameter";

/**
 * The proxies namespace contains the puremvc proxies to the model.
 */
upro.model.proxies = {};


upro.model.proxies.InfoTypeFactoryProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.InfoTypeFactoryProxy.NAME, upro.data.InfoTypeFactory.Instance);
   },

   onRegister: function()
   {
      this.registerFactories();
   },

   registerFactories: function()
   {
      var factory = this.getData();

      factory.register(upro.model.UserSession.TYPE, this.createUserSession.bind(this));
      factory.register(upro.model.UserSettings.TYPE, this.createUserSettings.bind(this));
      factory.register(upro.model.UserIgnoredSolarSystem.TYPE, this.createUserIgnoredSolarSystem.bind(this));
      factory.register(upro.model.UserRoutingRule.TYPE, this.createUserRoutingRule.bind(this));
   },

   createInfoAndProxy: function(infoId, dataStore, infoConstructor, proxyConstructor)
   {
      var info = new infoConstructor(infoId);
      var proxy = new proxyConstructor(info, dataStore);

      this.facade().registerProxy(proxy);

      return info;
   },

   createUserSession: function(infoId, dataStore)
   {
      return this.createInfoAndProxy(infoId, dataStore, upro.model.UserSession, upro.model.proxies.UserSessionProxy);
   },

   createUserSettings: function(infoId, dataStore)
   {
      return this.createInfoAndProxy(infoId, dataStore, upro.model.UserSettings, upro.model.proxies.UserSettingsProxy);
   },

   createUserIgnoredSolarSystem: function(infoId, dataStore)
   {
      return new upro.model.UserIgnoredSolarSystem(infoId);
   },

   createUserRoutingRule: function(infoId, dataStore)
   {
      return new upro.model.UserRoutingRule(infoId);
   }

});

upro.model.proxies.InfoTypeFactoryProxy.NAME = "InfoTypeFactory";


upro.model.proxies.SessionControlProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.SessionControlProxy.NAME, null);

   },

   onRegister: function()
   {

   },

   shutdown: function()
   {
      var dataStore = this.getData();

      if (dataStore)
      {
         dataStore.deleteEntry(upro.data.InfoId.System);
         this.setData(null);
      }
   },

   runUnregistered: function()
   {
      this.shutdown();

      var dataStore = new upro.data.MemoryDataStore();

      this.setData(dataStore);
      dataStore.createEntry(upro.data.InfoId.System);

      {  // create basic system data structure
         var trans = dataStore.createWriteTransaction();
         var sessionId = new upro.data.InfoId(upro.model.UserSession.TYPE);
         var settingsId = new upro.data.InfoId(upro.model.UserSettings.TYPE);

         trans.createInfo(upro.data.InfoId.System, sessionId, { });
         trans.createInfo(sessionId, settingsId,
         {
            "activeGalaxy": upro.model.proxies.UniverseProxy.GALAXY_ID_NEW_EDEN,
            "routingCapJumpGatesInUse": "1",
            "routingCapJumpDriveInUse": "0",
            "routingCapJumpDriveRange": "5.0"
         });
         {  // ignored solar systems
            var ignoredId = new upro.data.InfoId(upro.model.UserIgnoredSolarSystem.TYPE);

            trans.createInfo(settingsId, ignoredId, { "solarSystemId": 30000142 }); // Jita
         }
         // routing rules
         this.createRoutingRule(trans, settingsId, 0, "MinSecurity", true, 5);
         this.createRoutingRule(trans, settingsId, 1, "MaxSecurity", false, 10);
         this.createRoutingRule(trans, settingsId, 2, "Jumps", true, 0);
         this.createRoutingRule(trans, settingsId, 3, "JumpFuel", false, 0);
         trans.commit();
      }
   },

   createRoutingRule: function(trans, settingsId, index, ruleType, inUse, parameter)
   {
      var ruleId = new upro.data.InfoId(upro.model.UserRoutingRule.TYPE);
      var properties = {};

      properties[upro.model.UserRoutingRule.PROPERTY_INDEX] = index;
      properties[upro.model.UserRoutingRule.PROPERTY_RULE_TYPE] = ruleType;
      properties[upro.model.UserRoutingRule.PROPERTY_IN_USE] = inUse ? 1 : 0;
      properties[upro.model.UserRoutingRule.PROPERTY_PARAMETER] = parameter;
      trans.createInfo(settingsId, ruleId, properties);
   },

   login: function(userName, password)
   {

   }

});

upro.model.proxies.SessionControlProxy.NAME = "SessionControl";

/**
 * This proxy is one that has an AbstractProxiedDataStoreInfo object as data.
 * It registers the deletedCallback to a method that removes the proxy from
 * the model.
 */
upro.model.proxies.AbstractDataStoreInfoProxy = Class.create(Proxy,
{
   initialize: function($super, name, data, dataStore)
   {
      $super(name, data);

      this.dataStore = dataStore;
      data.deletedCallback = this.onDataDeleted.bind();
   },

   /**
    * String presentation
    * @return string presentation
    */
   toString: function()
   {
      return this.getName() + " for " + this.getData().toString();
   },

   /**
    * Returns the data store responsible for this proxy
    * @return the data store responsible for this proxy
    */
   getDataStore: function()
   {
      return this.dataStore;
   },

   /**
    * Called when the contained data became deleted.
    * Removes this proxy from the model.
    */
   onDataDeleted: function()
   {
      this.facade().removeProxy(this.getName());
   },

   /**
    * Encodes a boolean value (mirroring DataStoreInfo.decodeBooleanMember())
    * @param value the boolean to encode
    * @return an encoded string
    */
   encodeBoolean: function(value)
   {
      return value ? "1" : "0";
   },

   updateProperties: function(properties)
   {
      var transaction = this.getDataStore().createWriteTransaction();

      transaction.updateInfo(this.getData().infoId, properties);
      transaction.commit();
   }

});

/**
 * This proxy is the primary entry point for anything the user does currently. The same session stays active as long as
 * at least one client is bound to it.
 */
upro.model.proxies.UserSessionProxy = Class.create(upro.model.proxies.AbstractDataStoreInfoProxy,
{
   initialize: function($super, data, dataStore)
   {
      $super(upro.model.proxies.UserSessionProxy.NAME, data, dataStore);

      data.corridorPreparationChanged = this.onCorridorPreparationChanged.bind(this);

   },

   onRegister: function()
   {
      this.facade().sendNotification(upro.app.Notifications.SessionLoggedIn, null);
   },

   setCorridorPreparation: function(solarSystem, jumpType)
   {
      var properties = {};

      properties[upro.model.UserSession.PROPERTY_CORRIDOR_PREP_SYSTEM_ID] = solarSystem ? solarSystem.id : "";
      properties[upro.model.UserSession.PROPERTY_CORRIDOR_PREP_JUMP_TYPE] = jumpType ? jumpType : "";

      this.updateProperties(properties);
   },

   /**
    * Returns the prepared jump type for a new corridor
    * 
    * @return the prepared jump type for a new corridor
    */
   getCorridorPreparationJumpType: function()
   {
      var temp = this.getData().getCorridorPrepJumpType();

      return (temp && (temp.length > 0)) ? temp : upro.nav.JumpType.None;
   },

   /**
    * Returns the prepared solar system for a new corridor or null
    * 
    * @return the prepared solar system for a new corridor or null
    */
   getCorridorPreparationSolarSystem: function()
   {
      var id = this.getData().getCorridorPrepSystemId();
      var universeProxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME);

      return id ? universeProxy.findSolarSystemById(id) : null;
   },

   onCorridorPreparationChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.NewCorridorPreparationChanged, null);
   }

});

upro.model.proxies.UserSessionProxy.NAME = "UserSession";

upro.model.proxies.UserSettingsProxy = Class.create(upro.model.proxies.AbstractDataStoreInfoProxy,
{
   initialize: function($super, data, dataStore)
   {
      $super(upro.model.proxies.UserSettingsProxy.NAME, data, dataStore);

      data.activeGalaxyChanged = this.onActiveGalaxyChanged.bind(this);
      data.routingCapabilitiesChanged = this.onRoutingCapabilitiesChanged.bind(this);
      data.ignoredSolarSystemsChanged = this.onIgnoredSolarSystemsChanged.bind(this);
      data.routingRulesChanged = this.onRoutingRulesChanged.bind(this);
   },

   onRemove: function()
   {
      this.notifyActiveGalaxyChanged(undefined);
   },

   onActiveGalaxyChanged: function()
   {
      this.notifyActiveGalaxyChanged(this.getData().getActiveGalaxy());
   },

   notifyActiveGalaxyChanged: function(galaxyId)
   {
      this.facade().sendNotification(upro.app.Notifications.ActiveGalaxyChanged, galaxyId);
   },

   setActiveGalaxy: function(galaxyId)
   {
      var properties = {};

      properties[upro.model.UserSettings.PROPERTY_ACTIVE_GALAXY] = galaxyId;

      this.updateProperties(properties);
   },

   onRoutingCapabilitiesChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.UserRoutingCapabilitiesChanged);
   },

   getRoutingCapJumpGatesInUse: function()
   {
      return this.getData().getRoutingCapJumpGatesInUse();
   },

   toggleRoutingCapJumpGates: function()
   {
      var properties = {};

      properties[upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_GATES_IN_USE] = this.encodeBoolean(!this
            .getRoutingCapJumpGatesInUse());

      this.updateProperties(properties);
   },

   getRoutingCapJumpDriveInUse: function()
   {
      return this.getData().getRoutingCapJumpDriveInUse();
   },

   toggleRoutingCapJumpDrive: function()
   {
      var properties = {};

      properties[upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_DRIVE_IN_USE] = this.encodeBoolean(!this
            .getRoutingCapJumpDriveInUse());

      this.updateProperties(properties);
   },

   getRoutingCapJumpDriveRange: function()
   {
      return this.getData().getRoutingCapJumpDriveRange();
   },

   /**
    * Steps the range of the jump drive capability
    * 
    * @param increment whether to increment
    */
   stepRoutingCapJumpDriveRange: function(increment)
   {
      var value = this.getRoutingCapJumpDriveRange()
            + (increment ? upro.model.UserSettings.JumpDriveConstants.RangeStep
                  : -upro.model.UserSettings.JumpDriveConstants.RangeStep);

      if ((value >= upro.model.UserSettings.JumpDriveConstants.MinimumRange)
            && (value <= upro.model.UserSettings.JumpDriveConstants.MaximumRange))
      {
         var properties = {};

         properties[upro.model.UserSettings.PROPERTY_ROUTING_CAP_JUMP_DRIVE_RANGE] = value;

         this.updateProperties(properties);
      }
   },

   onIgnoredSolarSystemsChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.UserIgnoredSolarSystemsChanged,
            this.getIgnoredSolarSystemIds());
   },

   toggleIgnoredSolarSystem: function(solarSystemId)
   {
      var transaction = this.getDataStore().createWriteTransaction();
      var data = this.getData();
      var entries = data.getIgnoredSolarSystems();
      var found = false;

      for ( var i = 0; i < entries.length; i++)
      {
         var entry = entries[i];

         if (entry.getSolarSystemId() == solarSystemId)
         {
            transaction.deleteInfo(entry.getInfoId());
            found = true;
         }
      }
      if (!found)
      {
         var ignoredId = new upro.data.InfoId(upro.model.UserIgnoredSolarSystem.TYPE);

         transaction.createInfo(data.getInfoId(), ignoredId,
         {
            "solarSystemId": solarSystemId
         });
      }
      transaction.commit();
   },

   /**
    * Returns an array of solar system id entries that should be ignored
    * 
    * @return an array of solar system id entries
    */
   getIgnoredSolarSystemIds: function()
   {
      var entries = this.getData().getIgnoredSolarSystems();
      var result = [];

      for ( var i = 0; i < entries.length; i++)
      {
         var entry = entries[i];

         result.push(entry.getSolarSystemId());
      }

      return result;
   },

   /**
    * Callback on changed routing rules
    */
   onRoutingRulesChanged: function()
   {
      this.facade().sendNotification(upro.app.Notifications.UserRoutingRulesChanged, this.getRoutingRules());
   },

   /**
    * Returns the routing rules
    * 
    * @return the routing rules
    */
   getRoutingRules: function()
   {
      return this.getData().getRoutingRules();
   },

   /**
    * Toggles the InUse parameter of the routing rule identified by ruleType
    * 
    * @param ruleType to modify
    */
   toggleRoutingRule: function(ruleType)
   {
      var rule = this.getData().getRoutingRuleByType(ruleType);

      if (rule)
      {
         var transaction = this.getDataStore().createWriteTransaction();
         var properties = {};

         properties[upro.model.UserRoutingRule.PROPERTY_IN_USE] = rule.getInUse() ? 0 : 1;
         transaction.updateInfo(rule.getInfoId(), properties);
         transaction.commit();
      }
   },

   /**
    * Steps the parameter value of the routing rule identified by ruleType
    * 
    * @param ruleType to modify
    * @param increment whether to increment
    */
   stepRoutingRuleParameter: function(ruleType, increment)
   {
      var rule = this.getData().getRoutingRuleByType(ruleType);

      if (rule)
      {
         var template = upro.model.UserRoutingRule.RuleConstants[rule.getRuleType()];
         var transaction = this.getDataStore().createWriteTransaction();
         var properties = {};

         properties[upro.model.UserRoutingRule.PROPERTY_PARAMETER] = rule.getParameter()
               + (increment ? template.Increment : -template.Increment);
         transaction.updateInfo(rule.getInfoId(), properties);
         transaction.commit();
      }
   },

   /**
    * Moves the routing rule identified by ruleType
    * 
    * @param ruleType to modify
    * @param up whether it should be ordered up
    */
   moveRoutingRule: function(ruleType, up)
   {
      var rule = this.getData().getRoutingRuleByType(ruleType);

      if (rule)
      {
         var oldIndex = rule.getIndex();
         var newIndex = oldIndex + (up ? -1 : 1);

         if ((newIndex >= 0) && (newIndex < upro.model.UserRoutingRule.RuleLimit))
         {
            var rules = this.getRoutingRules();
            var transaction = this.getDataStore().createWriteTransaction();
            var properties = {};

            // update the specified rule
            properties[upro.model.UserRoutingRule.PROPERTY_INDEX] = newIndex;
            transaction.updateInfo(rule.getInfoId(), properties);
            for ( var i = 0; i < rules.length; i++)
            { // go through other rules and swapt their index
               rule = rules[i];
               if (rule.getIndex() == newIndex)
               {
                  properties = {};
                  properties[upro.model.UserRoutingRule.PROPERTY_INDEX] = oldIndex;
                  transaction.updateInfo(rule.getInfoId(), properties);
               }
            }
            transaction.commit();
         }
      }
   }

});

upro.model.proxies.UserSettingsProxy.NAME = "UserSettings";

/**
 * Proxy for the universe data - filling the map information
 * 
 * Note that the Y components are all inverted from the data. It was either a) handle the inversion at every point in
 * the view b) handle it once at the source
 */
upro.model.proxies.UniverseProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.UniverseProxy.NAME, new upro.nav.Universe());

      this.loadTimer = null;
      this.loaded = 0;
   },

   onRegister: function()
   {
      this.createGalaxies();
   },

   /**
    * Returns the universe reference
    * 
    * @return the universe reference
    */
   getUniverse: function()
   {
      return this.getData();
   },

   /**
    * Returns the galaxy of given id
    * 
    * @return the galaxy of given id
    */
   getGalaxy: function(galaxyId)
   {
      return this.getUniverse().galaxies.get(galaxyId);
   },

   /**
    * Tries to find a solar system by its id. Assumes IDs are unique across galaxies.
    * 
    * @param solarSystemId Id to look for
    * @return SolarSystem matching the given id
    */
   findSolarSystemById: function(solarSystemId)
   {
      var solarSystem = null;
      var universe = this.getUniverse();
      var galaxy = null;

      // Do a blunt approach - no loops or anything.
      galaxy = universe.galaxies.get(upro.model.proxies.UniverseProxy.GALAXY_ID_NEW_EDEN);
      solarSystem = galaxy.solarSystems.get(solarSystemId);
      if (!solarSystem)
      {
         galaxy = universe.galaxies.get(upro.model.proxies.UniverseProxy.GALAXY_ID_W_SPACE);
         solarSystem = galaxy.solarSystems.get(solarSystemId);
      }

      return solarSystem;
   },

   /**
    * Creates the galaxies known within the EVE universe. Currently: New Eden and W-Space.
    */
   createGalaxies: function()
   {
      var universe = this.getUniverse();

      // The values have been extracted from the database. They shouldn't change that often.
      {
         var galaxy = upro.nav.Galaxy.create(upro.model.proxies.UniverseProxy.GALAXY_ID_NEW_EDEN, "New Eden", -78415,
               -40007, 18791, 25000.0);

         universe.galaxies.add(galaxy);
         this.fillGalaxy(galaxy, upro.nav.JumpType.JumpGate);
      }
      {
         var galaxy = upro.nav.Galaxy.create(upro.model.proxies.UniverseProxy.GALAXY_ID_W_SPACE, "W-Space", 7704164,
               -15393, 9519056, 25000.0);

         universe.galaxies.add(galaxy);
         this.fillGalaxy(galaxy, upro.nav.JumpType.StaticWormhole);
      }
   },

   /**
    * Fills given galaxy with all known map data
    * 
    * @param galaxy to fill
    * @param staticJumpType type of static jumps in this galaxy
    */
   fillGalaxy: function(galaxy, staticJumpType)
   {
      var mapData = upro.res.eve.MapData[galaxy.id];

      /*
       * Initially it was planned to load the whole map data based on a timer to allow the app to be responsive and have
       * some sort-of-cool gathering effect to see (as the systems flash up over time). It turned out to be not only
       * slow, but very CPU demanding as well. In contrast, downloading the whole map data in bulk takes less than a
       * second (on my machine - field tests will show how this works out).
       */
      if (mapData != undefined)
      {
         this.loadRegions(galaxy, mapData);
         this.loadConstellations(galaxy, mapData);
         this.loadSolarSystems(galaxy, mapData);
         this.loadSolarSystemJumps(galaxy, mapData, staticJumpType);
         /*
          * this.facade().sendNotification(upro.app.Notifications.DebugMessage, galaxy.toString() + ": " +
          * mapData.regionData.length + " Regions, " + mapData.constellationData.length + " Constellations, " +
          * mapData.solarSystemData.length + " Solar Systems, " + mapData.solarSystemJumpData.length + " Static Jumps");
          */
      }
   },

   /**
    * Loads the regions into given galaxy
    * 
    * @param galaxy to fill
    * @param mapData to extract data from
    */
   loadRegions: function(galaxy, mapData)
   {
      var regionData = mapData.regionData;
      var entry, region;

      for ( var i = 0; i < regionData.length; i++)
      {
         entry = regionData[i];
         region = upro.nav.Region.create(entry[0], entry[1], entry[2], -entry[3], entry[4]);
         galaxy.regions.add(region);
      }
   },

   /**
    * Loads the constellations into given galaxy
    * 
    * @param galaxy to fill
    * @param mapData to extract data from
    */
   loadConstellations: function(galaxy, mapData)
   {
      var constellationData = mapData.constellationData;
      var entry, constellation;

      for ( var i = 0; i < constellationData.length; i++)
      {
         entry = constellationData[i];
         constellation = upro.nav.Constellation.create(entry[1], entry[2], entry[3], -entry[4], entry[5], entry[0]);
         galaxy.constellations.add(constellation);
      }
   },

   /**
    * Loads the solar systems into given galaxy
    * 
    * @param galaxy to fill
    * @param mapData to extract data from
    */
   loadSolarSystems: function(galaxy, mapData)
   {
      var solarSystemData = mapData.solarSystemData;
      var entry, system;

      for ( var i = 0; i < solarSystemData.length; i++)
      {
         entry = solarSystemData[i];
         system = upro.nav.SolarSystem.create(entry[0], entry[3], entry[4], -entry[5], entry[6], entry[7], entry[1],
               entry[2]);
         galaxy.solarSystems.add(system);
      }
   },

   /**
    * Loads the static solar system jumps into given galaxy
    * 
    * @param galaxy to fill
    * @param mapData to extract data from
    * @param staticJumpType type of static jumps in this galaxy
    */
   loadSolarSystemJumps: function(galaxy, mapData, staticJumpType)
   {
      var jumpData = mapData.solarSystemJumpData;
      var entry;

      for ( var i = 0; i < jumpData.length; i++)
      {
         entry = jumpData[i];
         galaxy.addStaticJumpCorridor(entry[0], entry[1], staticJumpType);
      }
   }

});

upro.model.proxies.UniverseProxy.NAME = "Universe";

upro.model.proxies.UniverseProxy.GALAXY_ID_NEW_EDEN = 9;
upro.model.proxies.UniverseProxy.GALAXY_ID_W_SPACE = 9000001;


upro.model.proxies.UserViewDataProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.UserViewDataProxy.NAME);

      this.highlightedObject = undefined;
   },

   onRemove: function()
   {
      if (this.highlightedObject !== undefined)
      {
         this.notifyHighlightedObjectChanged(undefined);
      }
   },

   notifyHighlightedObjectChanged: function(object)
   {
      this.facade().sendNotification(upro.app.Notifications.HighlightedObjectChanged, object);
   },

   setHighlightedObject: function(object)
   {
      if (this.highlightedObject !== object)
      {
         this.highlightedObject = object;
         this.notifyHighlightedObjectChanged(object);
      }
   }

});

upro.model.proxies.UserViewDataProxy.NAME = "UserViewData";

/**
 * 
 */
upro.model.proxies.ActiveRouteProxy = Class.create(Proxy,
{
   initialize: function($super)
   {
      $super(upro.model.proxies.ActiveRouteProxy.NAME, null);

      this.routeEntries = [];
      this.optimizersByIndex = {};
      this.timer = null;

      this.filterSolarSystems = [];
      this.routingCapabilities = [];
      this.routingRules = [];
   },

   /** {@inheritDoc} */
   onRegister: function()
   {
      this.timer = new upro.sys.Timer.getIntervalTimer(this.runOptimizers.bind(this));
      this.timer.start(10);
   },

   /** {@inheritDoc} */
   onRemove: function()
   {
      if (this.timer)
      {
         this.timer.stop();
         this.timer = null;
      }
   },

   notify: function(event)
   {
      this.facade().sendNotification(event);
   },

   /**
    * Sets the list of ignored solar systems by their ID
    * 
    * @param solarSystemIds an array of IDs
    */
   setIgnoredSolarSystemIds: function(solarSystemIds)
   {
      this.filterSolarSystems = [];
      for ( var i = 0; i < solarSystemIds.length; i++)
      {
         var id = solarSystemIds[i];

         this.filterSolarSystems.push(new upro.nav.finder.PathFinderFilterSystem(id));
      }
      this.optimizeAll();
   },

   /**
    * Sets the routing capabilities
    * 
    * @param capabilities an array of PathFinderCapability objects
    */
   setRoutingCapabilities: function(capabilities)
   {
      this.routingCapabilities = capabilities;
      this.optimizeAll();
   },

   /**
    * Sets the routing rules
    * 
    * @param rules an array of PathFinderCostRule objects
    */
   setRoutingRules: function(rules)
   {
      this.routingRules = rules;
      this.optimizeAll();
   },

   /**
    * Returns true if the route is currently empty
    * 
    * @return true if the route is currently empty
    */
   isEmpty: function()
   {
      return this.routeEntries.length == 0;
   },

   /**
    * Resets the route
    */
   resetRoute: function()
   {
      if (this.routeEntries.length > 0)
      {
         this.stopOptimizer(0, this.routeEntries.length - 1);
         this.routeEntries = [];

         this.notify(upro.app.Notifications.ActiveRoutePathChanged);
      }
   },

   /**
    * Queries whether the given solar system is present as an entry
    * 
    * @param solarSystem to check
    * @return true if the given solar system is either a waypoint or checkpoint
    */
   containsSolarSystemAsEntry: function(solarSystem)
   {
      var rCode = false;

      for ( var i = 0; !rCode && (i < this.routeEntries.length); i++)
      {
         var routeEntry = this.routeEntries[i];

         if (routeEntry.systemEntry.getSolarSystem().id == solarSystem.id)
         {
            rCode = true;
         }
      }

      return rCode;
   },

   /**
    * Verifies whether the given solar sytem can be added as given type. The following rules exist: - Checkpoints can
    * always be added - Otherwise, the system added must not be in the current segment
    * 
    * @param solarSystem to test
    * @param entryType as which type to be added (upro.nav.SystemRouteEntry.EntryType)
    */
   canEntryBeAdded: function(solarSystem, entryType)
   {
      var length = this.routeEntries.length;
      var isEmpty = length == 0;
      var rCode = false;

      if ((entryType == upro.nav.SystemRouteEntry.EntryType.Checkpoint)
            || (!isEmpty && (this.findSystemInSegmentOf(length - 1, solarSystem) < 0)))
      {
         rCode = true;
      }

      return rCode;
   },

   /**
    * Adds given solar system as given entry to the end of the route
    * 
    * @param solarSystem to add
    * @param entryType as which type to be added (upro.nav.SystemRouteEntry.EntryType)
    */
   addEntry: function(solarSystem, entryType)
   {
      if (this.canEntryBeAdded(solarSystem, entryType))
      {
         var isCheckpoint = entryType == upro.nav.SystemRouteEntry.EntryType.Checkpoint;

         { // create and add new entry
            var systemEntry = new upro.nav.SystemRouteEntry(solarSystem, entryType);
            var routeEntry = this.createRouteEntry(systemEntry);

            if (this.routeEntries.length == 0)
            { // the first entry is always reachable
               routeEntry.isReachable = true;
            }
            this.routeEntries.push(routeEntry);
         }
         { // run optimization
            var endPos = this.routeEntries.length - ((isCheckpoint && (this.routeEntries.length > 1)) ? 2 : 1);
            var startPos = this.findSegmentStart(endPos);

            this.optimizeSegment(startPos, endPos);
         }
         this.notify(upro.app.Notifications.ActiveRoutePathChanged);
      }
   },

   /**
    * Removes all occurrences of given solar system
    * 
    * @param solarSystem to remove
    */
   removeEntry: function(solarSystem)
   {
      var searchStart = 0;

      while (searchStart < this.routeEntries.length)
      {
         var index = this.findSystemInSegmentOf(searchStart, solarSystem);

         if (index >= 0)
         {
            var routeEntry = this.routeEntries[index];
            var entryType = routeEntry.systemEntry.getEntryType();

            if (entryType == upro.nav.SystemRouteEntry.EntryType.Checkpoint)
            {
               if (index < (this.routeEntries.length - 1))
               { // the checkpoint was not the last entry, make the next entry a checkpoint
                  this.routeEntries[index + 1].systemEntry = this.routeEntries[index + 1].systemEntry
                        .asEntryType(upro.nav.SystemRouteEntry.EntryType.Checkpoint);
                  this.deleteEntry(index);
               }
               else
               { // was last entry, simply reoptimize
                  this.deleteEntry(index);
                  startIndex = index;
               }
            }
            else
            { // a waypoint in between
               this.deleteEntry(index);
            }
         }
         else
         {
            if (searchStart == 0)
            {
               searchStart = 1;
            }
            else
            {
               searchStart = this.findSegmentEnd(searchStart) + 1;
            }
         }
      }

      this.notify(upro.app.Notifications.ActiveRoutePathChanged);
   },

   /**
    * Deletes the entry at given index. Removes any trace of its existence and starts an optimization for the
    * corresponding segment.
    * 
    * @param index to remove at
    */
   deleteEntry: function(index)
   {
      this.stopOptimizer(index, index);
      this.routeEntries.splice(index, 1);

      if (this.routeEntries.length > 0)
      {
         var segmentEnd = this.findSegmentEnd((index > 0) ? index - 1 : 0);

         for ( var i = segmentEnd + 1; i <= this.routeEntries.length; i++)
         { // deleting an entry also requires all further running optimizers must be moved
            var finder = this.optimizersByIndex[i];

            if (finder)
            {
               this.optimizersByIndex[i - 1] = finder;
               delete this.optimizersByIndex[i];
            }
         }
         this.optimizeSegment(this.findSegmentStart(segmentEnd), segmentEnd);
      }
   },

   /**
    * Starts an optimization for all segments. Typically needed if some parameters changed
    */
   optimizeAll: function()
   {
      var startSystem = 0;

      while (startSystem < this.routeEntries.length)
      {
         var end = this.findSegmentEnd(startSystem);
         var start = this.findSegmentStart(end);

         this.optimizeSegment(start, end);
         startSystem = end + 1;
      }
      this.notify(upro.app.Notifications.ActiveRoutePathChanged);
   },

   /**
    * Requests to optimize the segment between given start and end indices
    * 
    * @param startIndex inclusive start index (source system)
    * @param endIndex inclusive end index
    */
   optimizeSegment: function(startIndex, endIndex)
   {
      var routeEntry;
      var i;

      this.stopOptimizer(startIndex, endIndex + 1);
      for (i = startIndex; i <= endIndex; i++)
      { // reset previous results
         routeEntry = this.routeEntries[i];
         routeEntry.transits = [];
         if (i > startIndex)
         { // don't reset the starting checkpoint
            routeEntry.isReachable = false;
         }
      }
      {
         var waypoints = [];
         var sourceSystem = null;
         var destinationSystem = null;
         var finder = null;

         sourceSystem = this.routeEntries[startIndex].systemEntry.getSolarSystem();
         if (endIndex < (this.routeEntries.length - 1))
         { // got a checkpoint beyond the end
            routeEntry = this.routeEntries[endIndex + 1];
            var systemEntry = routeEntry.systemEntry;

            routeEntry.isReachable = false;
            destinationSystem = systemEntry.getSolarSystem();
         }
         for (i = startIndex + 1; i <= endIndex; i++)
         {
            var solarSystem = this.routeEntries[i].systemEntry.getSolarSystem();

            if (destinationSystem && (destinationSystem.id == solarSystem.id))
            { // no need to run a system both as waypoint and destination - make it fix a destination
               this.routeEntries.splice(i, 1);
               endIndex--;
               i--;
            }
            else
            {
               waypoints.push(solarSystem);
            }
         }
         finder = new upro.nav.finder.RouteFinderGeneticTSP(this.routingCapabilities, this.routingRules,
               this.filterSolarSystems, sourceSystem, waypoints, destinationSystem);

         this.optimizersByIndex[endIndex] = finder;
      }
   },

   /**
    * Runs all current optimizers for one cycle.
    * 
    * @return true if all are currently completed
    */
   runOptimizers: function()
   {
      var key = null;
      var keys = [];
      var someCompleted = false;
      var allCompleted = true;

      for (key in this.optimizersByIndex)
      {
         keys.push(key);
      }
      for ( var i = 0; i < keys.length; i++)
      {
         key = new Number(keys[i]);
         var finder = this.optimizersByIndex[key];

         if (this.runFinderBulk(finder))
         {
            this.onOptimizerCompleted(key);
            someCompleted = true;
         }
         else
         {
            allCompleted = false;
         }
      }
      if (someCompleted)
      {
         this.notify(upro.app.Notifications.ActiveRoutePathChanged);
      }

      return allCompleted;
   },

   /**
    * Runs given finder in bulk. Returns true if finder completed
    * 
    * @return true if finder completed
    */
   runFinderBulk: function(finder)
   {
      var rCode = false;

      for ( var i = 0; !rCode && (i < 100); i++)
      {
         rCode = finder.continueSearch();
      }

      return rCode;
   },

   stopOptimizer: function(startIndex, endIndex)
   {
      for ( var i = startIndex + 1; i <= endIndex; i++)
      {
         if (this.optimizersByIndex[i])
         {
            delete this.optimizersByIndex[i];
         }
      }
   },

   onOptimizerCompleted: function(endIndex)
   {
      var startIndex = this.findSegmentStart(endIndex);
      var finder = this.optimizersByIndex[endIndex];
      var foundRoute = finder.getRouteEntries();
      var lastRouteEntry = this.routeEntries[startIndex];
      var systemEntry;
      var i;

      delete this.optimizersByIndex[endIndex];
      if (foundRoute.length > 0)
      { // found a complete route
         // rewrite the start system, as it might have a different way of reaching the next system (jump type)
         this.routeEntries[startIndex].systemEntry = foundRoute[0]
               .asEntryType(upro.nav.SystemRouteEntry.EntryType.Checkpoint);
         if (endIndex < (this.routeEntries.length - 1))
         { // mark next checkpoint reachable
            this.routeEntries[1 + endIndex].isReachable = true;
         }
      }
      startIndex++; // already skip the first entry (is the starting checkpoint)
      for (i = 1; i < foundRoute.length; i++)
      {
         systemEntry = foundRoute[i];
         if (systemEntry.getEntryType() == upro.nav.SystemRouteEntry.EntryType.Waypoint)
         {
            lastRouteEntry = this.createRouteEntry(systemEntry);
            lastRouteEntry.isReachable = true;
            this.routeEntries.splice(startIndex, 1, lastRouteEntry);
            startIndex++;
         }
         else
         {
            lastRouteEntry.transits.push(systemEntry);
         }
      }
   },

   /**
    * Returns the end of the segment given index into routeEntries is part of
    * 
    * @return the end of the segment
    */
   findSegmentEnd: function(index)
   {
      var end = index + 1;
      var limit = this.routeEntries.length;

      while ((end < limit)
            && (this.routeEntries[end].systemEntry.getEntryType() != upro.nav.SystemRouteEntry.EntryType.Checkpoint))
      {
         end++;
      }

      return end - 1;
   },

   /**
    * Returns the start of the segment given index into routeEntries is part of
    * 
    * @return the start of the segment
    */
   findSegmentStart: function(index)
   {
      var start = index;

      while ((start >= 0)
            && (this.routeEntries[start].systemEntry.getEntryType() != upro.nav.SystemRouteEntry.EntryType.Checkpoint))
      {
         start--;
      }

      return (start >= 0) ? start : 0;
   },

   findSystemInSegmentOf: function(index, solarSystem)
   {
      var endIndex = this.findSegmentEnd(index);
      var startIndex = this.findSegmentStart(endIndex);
      var foundIndex = -1;
      var routeEntry;

      for ( var i = startIndex; (foundIndex < 0) && (i < (endIndex + 1)); i++)
      {
         routeEntry = this.routeEntries[i];

         if (routeEntry.systemEntry.getSolarSystem() == solarSystem)
         {
            foundIndex = i;
         }
      }

      return foundIndex;
   },

   createRouteEntry: function(systemEntry)
   {
      var routeEntry =
      {
         "systemEntry": systemEntry,
         "transits": [],
         "isReachable": false
      };

      return routeEntry;
   }

});

upro.model.proxies.ActiveRouteProxy.NAME = "ActiveRoute";

/**
 * The control namespace contains the business domain
 */
upro.ctrl = {};

/**
 * The command namespace contains all the puremvc commands
 */
upro.ctrl.cmd = {};

/** A class that has this suffix in its name is a command */
upro.ctrl.cmd.NAME_SUFFIX = "Command";

/** A command that has this prefix in its name is notification based */
upro.ctrl.cmd.NOTIFIED_NAME_PREFIX = "Notified";

/**
 * This function returns all commands known to be notified
 * @return map of notification name to class
 */
upro.ctrl.cmd.getAllNotified = function()
{
   var result = {};
   var prefix = upro.ctrl.cmd.NOTIFIED_NAME_PREFIX;
   var suffix = upro.ctrl.cmd.NAME_SUFFIX;

   for (var entryName in upro.ctrl.cmd)
   {
      if ((entryName.length > suffix.length) && (entryName.substr(entryName.length - suffix.length) == suffix) &&
         (entryName.length > prefix.length) && (entryName.substr(0, prefix.length) == prefix))
      {
         result[entryName.substr(prefix.length, entryName.length - (suffix.length + prefix.length))] = upro.ctrl.cmd[entryName];
      }
   }

   return result;
};


upro.ctrl.cmd.NotifiedStartupCommand = Class.create(MacroCommand,
{
   initializeMacroCommand: function()
   {
      upro.res.text.Lang.setCurrentLanguage(upro.res.text.Lang.defaultLang);

      this.addSubCommand(upro.ctrl.cmd.SetupModelCommand);
      this.addSubCommand(upro.ctrl.cmd.SetupViewCommand);

      this.addSubCommand(upro.ctrl.cmd.InitApplicationCommand);
   }
});


upro.ctrl.cmd.SetupModelCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      this.facade().registerProxy(new upro.model.proxies.InfoTypeFactoryProxy());
      this.facade().registerProxy(new upro.model.proxies.SessionControlProxy());
   }

});


upro.ctrl.cmd.SetupViewCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      this.facade().registerMediator(new upro.view.mediators.DocumentMouseMediator());
      this.facade().registerMediator(new upro.view.mediators.HudMediator());

      if (upro.scene.SceneSystem.SUPPORTED)
      {
         this.facade().registerMediator(new upro.view.mediators.SceneMediator());
      }
   }
});

/**
 * This command initializes the application - lets it enter its
 * initial state. The model and view have been set up before.
 */
upro.ctrl.cmd.InitApplicationCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var sessionControl = this.facade().retrieveProxy(upro.model.proxies.SessionControlProxy.NAME);

      sessionControl.runUnregistered();
   }

});


upro.ctrl.cmd.NotifiedSessionLoggedInCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      this.facade().registerProxy(new upro.model.proxies.UniverseProxy());
      this.facade().registerProxy(new upro.model.proxies.UserViewDataProxy());

      this.facade().registerProxy(new upro.model.proxies.ActiveRouteProxy());

      this.facade().registerMediator(new upro.view.mediators.MainContextMenuMediator());
      this.facade().registerMediator(new upro.view.mediators.SolarSystemHighlightMediator());
      this.facade().registerMediator(new upro.view.mediators.SolarSystemContextMenuMediator());
      this.facade().registerMediator(new upro.view.mediators.ActiveRouteOverlayMediator());
      if (upro.scene.SceneSystem.SUPPORTED)
      {
         var scene = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);

         scene.createGalaxies();
      }
   }

});


upro.ctrl.cmd.NotifiedSetActiveGalaxyCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settings = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

      if (settings !== null)
      {
         settings.setActiveGalaxy(notification.getBody());
      }
   }

});


upro.ctrl.cmd.NotifiedSetHighlightedObjectCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var proxy = this.facade().retrieveProxy(upro.model.proxies.UserViewDataProxy.NAME);

      proxy.setHighlightedObject(notification.getBody());
   }

});


upro.ctrl.cmd.NotifiedHighlightedObjectChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var object = notification.getBody();
      var highlightMediator = this.facade().retrieveMediator(upro.view.mediators.SolarSystemHighlightMediator.NAME);
      var sceneMediator = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);

      if (object instanceof upro.nav.SolarSystem)
      {
         var realPos = sceneMediator.projectSolarSystem(object);

         if (realPos)
         {
            highlightMediator.setHighlight(object, realPos);
         }
         else
         {
            highlightMediator.clearHighlight();
         }
      }
      else
      {
         highlightMediator.clearHighlight();
      }
   }

});


upro.ctrl.cmd.NotifiedScenePointerActivationCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
      var scene = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);
      var mainMenuMediator = this.facade().retrieveMediator(upro.view.mediators.MainContextMenuMediator.NAME);
      var realPos = notification.getBody();
      var pickResult = scene.pick(realPos);
      var mainMenuWasVisible = mainMenuMediator.isVisible();

      hudSystem.setActiveContextMenu(null);
      if (pickResult)
      {
         var pickedObject = pickResult.getRefObject();

         if (pickedObject instanceof upro.nav.SolarSystem)
         {
            var menuMediator = this.facade().retrieveMediator(upro.view.mediators.SolarSystemContextMenuMediator.NAME);

            menuMediator.show(pickResult.getViewPosition(), pickedObject);
         }
      }
      else
      {  // clicked into void

         if (!mainMenuWasVisible)
         {
            mainMenuMediator.show(realPos, null);
         }
      }
   }

});


upro.ctrl.cmd.NotifiedUserIgnoredSolarSystemsChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var ignored = notification.getBody();

      activeRouteProxy.setIgnoredSolarSystemIds(ignored);
   }
});


upro.ctrl.cmd.NotifiedUserIgnoredSolarSystemIgnoreToggleCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);
      var solarSystem = notification.getBody();

      settingsProxy.toggleIgnoredSolarSystem(solarSystem.id);
   }
});


upro.ctrl.cmd.NotifiedActiveRouteResetCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);

      activeRouteProxy.resetRoute();
   }
});


upro.ctrl.cmd.NotifiedActiveRouteRemoveEntryCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var solarSystem = notification.getBody();

      activeRouteProxy.removeEntry(solarSystem);
   }
});


upro.ctrl.cmd.NotifiedActiveRouteAddWaypointCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var solarSystem = notification.getBody();

      activeRouteProxy.addEntry(solarSystem, upro.nav.SystemRouteEntry.EntryType.Waypoint);
   }
});


upro.ctrl.cmd.NotifiedActiveRouteAddCheckpointCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var solarSystem = notification.getBody();

      activeRouteProxy.addEntry(solarSystem, upro.nav.SystemRouteEntry.EntryType.Checkpoint);
   }
});

upro.ctrl.cmd.NotifiedActiveRoutePathChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var sceneMediator = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);
      var overlayMediator = this.facade().retrieveMediator(upro.view.mediators.ActiveRouteOverlayMediator.NAME);
      var routeEntry, isReachable;
      var lastSystem = null, temp = null;
      var waypointCounter = 1;

      sceneMediator.clearRoute();
      overlayMediator.clear();

      for ( var i = 0; i < activeRouteProxy.routeEntries.length; i++)
      {
         routeEntry = activeRouteProxy.routeEntries[i];
         isReachable = routeEntry.isReachable;

         if (lastSystem)
         {
            sceneMediator.addRouteEdge(lastSystem, routeEntry.systemEntry.getSolarSystem(), isReachable);
         }
         overlayMediator.setSystemOverlay(routeEntry.systemEntry.getSolarSystem(), waypointCounter, isReachable);
         waypointCounter++;

         lastSystem = routeEntry.systemEntry.getSolarSystem();
         for ( var j = 0; j < routeEntry.transits.length; j++)
         {
            temp = routeEntry.transits[j].getSolarSystem();
            sceneMediator.addRouteEdge(lastSystem, temp, true);
            lastSystem = temp;
         }
      }
   }
});


upro.ctrl.cmd.NotifiedUserRoutingRulesChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var rules = notification.getBody();
      var finderRules = [];

      for (var i = 0; i < rules.length; i++)
      {
         var rule = rules[i];
         var template = upro.model.UserRoutingRule.RuleConstants[rule.getRuleType()];

         if (rule.getInUse() && template)
         {
            var finderRule = new template.Constructor((rule.getParameter() * template.Factor).toFixed(template.Fixed));

            finderRules.push(finderRule);
         }
      }

      activeRouteProxy.setRoutingRules(finderRules);
   }
});


upro.ctrl.cmd.NotifiedUserRoutingRuleToggleCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

      settingsProxy.toggleRoutingRule(notification.getBody());
   }
});


upro.ctrl.cmd.NotifiedUserRoutingRuleMoreCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

      settingsProxy.stepRoutingRuleParameter(notification.getBody(), true);
   }
});


upro.ctrl.cmd.NotifiedUserRoutingRuleLessCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

      settingsProxy.stepRoutingRuleParameter(notification.getBody(), false);
   }
});


upro.ctrl.cmd.NotifiedUserRoutingRuleUpCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

      settingsProxy.moveRoutingRule(notification.getBody(), true);
   }
});


upro.ctrl.cmd.NotifiedUserRoutingRuleDownCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

      settingsProxy.moveRoutingRule(notification.getBody(), false);
   }
});


upro.ctrl.cmd.NotifiedUserRoutingCapabilitiesChangedCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);
      var capabilities = [];

      if (settingsProxy.getRoutingCapJumpGatesInUse())
      {
         capabilities.push(new upro.nav.finder.PathFinderCapabilityJumpGates());
      }
      if (settingsProxy.getRoutingCapJumpDriveInUse())
      {
         capabilities.push(new upro.nav.finder.PathFinderCapabilityJumpDrive(settingsProxy.getRoutingCapJumpDriveRange()));
      }

      activeRouteProxy.setRoutingCapabilities(capabilities);
   }
});


upro.ctrl.cmd.NotifiedUserRoutingCapJumpGatesToggleCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

      settingsProxy.toggleRoutingCapJumpGates();
   }
});


upro.ctrl.cmd.NotifiedUserRoutingCapJumpDriveToggleCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

      settingsProxy.toggleRoutingCapJumpDrive();
   }
});


upro.ctrl.cmd.NotifiedUserRoutingCapJumpDriveRangeStepCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

      settingsProxy.stepRoutingCapJumpDriveRange(notification.getBody());
   }
});

upro.ctrl.cmd.NotifiedNewCorridorSetExitCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      /*
       * var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.UserSessionProxy.NAME); var solarSystemEntry =
       * sessionProxy.getCorridorPreparationSolarSystem(); var solarSystemExit = notification.getBody(); var jumpType =
       * sessionProxy.getCorridorPreparationJumpType();
       */
      // TODO: do it!
      sessionProxy.setCorridorPreparation(null, null);
   }
});


upro.ctrl.cmd.NotifiedNewCorridorPrepareWormholeCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.UserSessionProxy.NAME);
      var solarSystem = notification.getBody();

      sessionProxy.setCorridorPreparation(solarSystem, upro.nav.JumpType.DynamicWormhole);
   }
});


upro.ctrl.cmd.NotifiedNewCorridorPrepareJumpBridgeCommand = Class.create(SimpleCommand,
{
   execute: function(notification)
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.UserSessionProxy.NAME);
      var solarSystem = notification.getBody();

      sessionProxy.setCorridorPreparation(solarSystem, upro.nav.JumpType.JumpBridge);
   }
});

/**
 * The view namespace contains the user interface components
 */
upro.view = {};

/**
 * This pointer operation rotates a scene object - typically bound to a camera
 */
upro.view.SceneObjectRotationOperation = Class.create(upro.sys.PointerOperation,
{
   initialize: function(sceneSystem, object)
   {
      this.sceneSystem = sceneSystem;
      this.obj = object;

      this.lastPos = vec3.create();
      this.temp = vec3.create();
   },

   /** {@inheritDoc} */
   onDown: function(position, buttonStates, changeMask)
   {

   },

   /** {@inheritDoc} */
   onUp: function(position, buttonStates, changeMask)
   {

   },

   /** {@inheritDoc} */
   onMove: function(position, buttonStates)
   {
      var realPos = this.sceneSystem.pixelToReal(position.x, position.y);
      var temp = vec3.set([-realPos.y, realPos.x, 0], this.temp);
      var diff = vec3.subtract(this.lastPos, temp);

      vec3.scale(diff, 5);

      vec3.add(this.obj.rotation, diff);

      this.obj.rotation[0] = this.rotateValue(this.obj.rotation[0]);
      this.obj.rotation[0] = this.limitValueMax(this.obj.rotation[0], 0);
      this.obj.rotation[0] = this.limitValueMin(this.obj.rotation[0], Math.PI / -2);
      this.obj.rotation[1] = this.rotateValue(this.obj.rotation[1]);
      this.obj.rotation[2] = this.rotateValue(this.obj.rotation[2]);
      this.obj.setOrientationModified(true);

      vec3.set(temp, this.lastPos);
   },

   /** {@inheritDoc} */
   onRotate: function(position, buttonStates, rotation)
   {

   },

   /** {@inheritDoc} */
   onStart: function(position, buttonStates)
   {
      var realPos = this.sceneSystem.pixelToReal(position.x, position.y);

      this.lastPos[0] = -realPos.y;
      this.lastPos[1] = realPos.x;
   },

   /** {@inheritDoc} */
   onStop: function(position)
   {

   },

   /**
    * Rotates a circular value and ensures it's between -2PI and +2PI
    * @param value to rotate
    * @return the rotated value
    */
   rotateValue: function(value)
   {
      var limit = Math.PI * 2;

      while (value > limit)
      {
         value -= limit;
      }
      while (value < -limit)
      {
         value += limit;
      }

      return value;
   },

   /**
    * This method limits a given value
    * @param value to limit
    * @param limit to use
    * @return the value if below limit, limit otherwise
    */
   limitValueMax: function(value, limit)
   {
      if (value > limit)
      {
         value = limit;
      }

      return value;
   },

   /**
    * This method limits a given value
    * @param value to limit
    * @param limit to use
    * @return the value if above limit, limit otherwise
    */
   limitValueMin: function(value, limit)
   {
      if (value < limit)
      {
         value = limit;
      }

      return value;
   }

});

/**
 * This oriented move operation translates relative to a
 * foreign orientation (rotation)
 */
upro.view.OrientedMoveOperation = Class.create(upro.sys.PointerOperation,
{
   initialize: function(sceneSystem, rotationBuffer, moveCallback)
   {
      this.sceneSystem = sceneSystem;
      this.buffer = rotationBuffer;
      this.moveCallback = moveCallback;

      this.lastPos = vec3.create();
      this.temp = vec3.create();
   },

   onDown: function(position, buttonStates, changeMask)
   {

   },

   onUp: function(position, buttonStates, changeMask)
   {

   },

   onMove: function(position, buttonStates)
   {
      var realPos = this.sceneSystem.pixelToReal(-position.x, -position.y);
      var temp = vec3.set([realPos.x, realPos.y, 0], this.temp);

      var diff = vec3.subtract(this.lastPos, temp);
      this.moveByVector(diff);
      // store for next call
      vec3.set(temp, this.lastPos);
   },

   onRotate: function(position, buttonStates, rotation)
   {
      var temp = vec3.set([0, 0, rotation[1] / -1000.0], this.temp);

      this.moveByVector(temp);
   },

   onStart: function(position, buttonStates)
   {
      var realPos = this.sceneSystem.pixelToReal(-position.x, -position.y);

      this.lastPos[0] = realPos.x;
      this.lastPos[1] = realPos.y;
   },

   onStop: function(position)
   {

   },

   moveByVector: function(temp)
   {
      // rotate movement around reference
      this.buffer.rotateVector(temp);
      // callback
      this.moveCallback(temp);
   }

});

/**
 * The idle pointer operation is for the mouse actions while no button is pressed.
 * Tightly bound to the SceneMediator.
 */
upro.view.IdlePointerOperation = Class.create(upro.sys.PointerOperation,
{
   initialize: function(sceneMediator)
   {
      this.sceneMediator = sceneMediator;
   },

   /** {@inheritDoc} */
   onDown: function(position, buttonStates, changeMask)
   {
      if (changeMask[2] && buttonStates[2])
      {
         this.sceneMediator.onIdleTertiaryClick();
      }
   },

   /** {@inheritDoc} */
   onUp: function(position, buttonStates, changeMask)
   {
      var sceneSystem = this.sceneMediator.getViewComponent();
      var realPos = sceneSystem.pixelToReal(position.x, position.y);

      if (changeMask[0] && !buttonStates[0])
      {
         this.sceneMediator.onIdlePrimaryClick(realPos);
      }
   },

   /** {@inheritDoc} */
   onMove: function(position, buttonStates)
   {
      var sceneSystem = this.sceneMediator.getViewComponent();
      var realPos = sceneSystem.pixelToReal(position.x, position.y);

      this.sceneMediator.onHover(realPos);
   },

   /** {@inheritDoc} */
   onRotate: function(position, buttonStates, rotation)
   {

   },

   /** {@inheritDoc} */
   onStart: function(position, buttonStates)
   {
      var sceneSystem = this.sceneMediator.getViewComponent();
      var realPos = sceneSystem.pixelToReal(position.x, position.y);

      this.sceneMediator.onHover(realPos);
   },

   /** {@inheritDoc} */
   onStop: function(position)
   {
      this.sceneMediator.stopHover();
   }

});

/**
 * The mediators namespace contains puremvc mediators to the view components.
 */
upro.view.mediators = {};

/**
 * Abstract mediator class that provides some automated reflection
 * functionality regarding notifications.
 */
upro.view.mediators.AbstractMediator = Class.create(Mediator,
{
   /**
    * Lists the notifications this mediator is interested in.
    * The method iterates through the objects' methods and returns the stripped
    * name if it has the HANDLER_NAME_PREFIX.
    * @return an array of notification names
    */
   listNotificationInterests: function()
   {
      var names = [];
      var prefix = upro.view.mediators.AbstractMediator.HANDLER_NAME_PREFIX;

      for (var memberName in this)
      {
         if ((memberName.length > prefix.length) && (memberName.substr(0, prefix.length) == prefix))
         {
            names.push(memberName.substr(prefix.length));
         }
      }

      return names;
   },

   /**
    * Tries to handle given notification.
    */
   handleNotification: function(note)
   {
      var name = upro.view.mediators.AbstractMediator.HANDLER_NAME_PREFIX + note.getName();

      if (this[name] != undefined)
      {
         this[name](note.getBody());
      }
   }
});

/** Name prefix for a notification handler */
upro.view.mediators.AbstractMediator.HANDLER_NAME_PREFIX = "onNotify";

/**
 * A mediator that handles the mouse on document level.
 * It holds a PointerOperationRegistry bound to a mouse listener on the document.
 */
upro.view.mediators.DocumentMouseMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.DocumentMouseMediator.NAME, null);
   },

   onRegister: function()
   {
      var opRegistry = new upro.sys.PointerOperationRegistry();

      this.mouseListener = new upro.sys.MouseListener(opRegistry);

      this.setViewComponent(opRegistry);
   }

});

upro.view.mediators.DocumentMouseMediator.NAME = "DocumentMouse";


upro.view.mediators.HudMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.HudMediator.NAME, null);
   },

   onRegister: function()
   {
      var context = new upro.sys.ResizableContextWindow("hud");
      var system = new upro.hud.HudSystem(context);

      this.setViewComponent(system);
   },

   onNotifyDebugMessage: function(text)
   {
      this.getViewComponent().debugMessage(text);
   },
/*
   onNotifyActiveGalaxyChanged: function(galaxyId)
   {
      var galaxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME).getGalaxy(galaxyId);

      this.getViewComponent().debugMessage("ActiveGalaxy: " + (galaxy ? galaxy.name : "<none>"));
   },
*/
   onNotifySessionLoggedIn: function()
   {
      this.getViewComponent().debugMessage("Online!");
   }

});

upro.view.mediators.HudMediator.NAME = "HUD";


upro.view.mediators.SceneMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.SceneMediator.NAME, null);

      this.galaxies = {};
      this.visibleGalaxyId = null;
   },

   onRegister: function()
   {
      var context = new upro.sys.ResizableContextWindow("scene");
      var sceneSystem = new upro.scene.SceneSystem(context);

      this.basicShader = sceneSystem.loadShaderProgram(upro.scene.ShaderProgram,
         [ $('basic-vertex-shader'), $('basic-fragment-shader') ]);
      this.systemShader = sceneSystem.loadShaderProgram(upro.scene.ShaderProgram,
         [ $('system-vertex-shader'), $('system-fragment-shader') ]);

      this.setViewComponent(sceneSystem);
   },

   resetCamera: function()
   {
      var sceneSystem = this.getViewComponent();

      // start with a top down view
      vec3.set([0, 0, 0], sceneSystem.camera.position);
      vec3.set([Math.PI / -2, 0, 0], sceneSystem.camera.rotation);
   },

   createGalaxies: function()
   {
      this.resetCamera();

      this.createGalaxy(upro.model.proxies.UniverseProxy.GALAXY_ID_NEW_EDEN);
      this.createGalaxy(upro.model.proxies.UniverseProxy.GALAXY_ID_W_SPACE);

      this.registerPointerOperations();
   },

   createGalaxy: function(galaxyId)
   {
      var sceneSystem = this.getViewComponent();
      var galaxyRender = new upro.scene.GalaxyRenderObject(this.basicShader, this.systemShader);
      var galaxy = this.facade().retrieveProxy(upro.model.proxies.UniverseProxy.NAME).getGalaxy(galaxyId);

      this.galaxies[galaxyId] = galaxyRender;
      vec3.set([0, -20, 0], galaxyRender.position);
      for (var systemId in galaxy.solarSystems.objects)
      {
         var solarSystem = galaxy.solarSystems.get(systemId);

         galaxyRender.addSolarSystem(solarSystem);
      }
      for (var i = 0; i < galaxy.jumpCorridors.length; i++)
      {
         var jumpCorridor = galaxy.jumpCorridors[i];

         galaxyRender.addJumpCorridor(jumpCorridor);
      }
      galaxyRender.addToScene(sceneSystem);
   },

   pick: function(realPos)
   {
      var result = null;

      if (this.visibleGalaxyId)
      {
         var galaxyRender = this.galaxies[this.visibleGalaxyId];

         result = galaxyRender.pick(realPos);
      }

      return result;
   },

   projectSolarSystem: function(solarSystem)
   {
      var result = null;

      if (this.visibleGalaxyId == solarSystem.galaxy.id)
      {
         var galaxyRender = this.galaxies[this.visibleGalaxyId];

         result = galaxyRender.projectSolarSystem(solarSystem, vec3.create());
      }

      return result;
   },

   addRouteEdge: function(system1, system2, valid)
   {
      this.addRouteEdgeBySystem1(system1, system2, valid);
      if (system1.galaxy.id != system2.galaxy.id)
      {
         this.addRouteEdgeBySystem1(system2, system1, valid);
      }
   },

   addRouteEdgeBySystem1: function(system1, system2, valid)
   {
      var galaxyRender = this.galaxies[system1.galaxy.id];

      galaxyRender.addRouteEdge(system1, system2, valid);
   },

   clearRoute: function()
   {
      for (var id in this.galaxies)
      {
         var galaxyRender = this.galaxies[id];

         galaxyRender.clearRoute();
      }
   },

   /**
    * Adds a TrackedProjection for given solar system
    * @param key to register the tracker for
    * @param solarSystem for which solar system it should be registered
    * @param callback to call for changes in projection
    */
   addSolarSystemTrack: function(key, solarSystem, callback)
   {
      var galaxyRender = this.galaxies[solarSystem.galaxy.id];
      var temp = vec3.create();

      vec3.subtract(solarSystem.position, solarSystem.galaxy.position, temp);
      vec3.scale(temp, 1 / solarSystem.galaxy.scale);

      galaxyRender.addProjectionTracker(new upro.scene.TrackedProjection(key, temp, callback));
   },

   /**
    * Removes a tracked projection
    * @param key that was used for addSolarSystemTrack
    * @param solarSystem that was used for addSolarSystemTrack
    */
   removeSolarSystemTrack: function(key, solarSystem)
   {
      var galaxyRender = this.galaxies[solarSystem.galaxy.id];

      galaxyRender.removeProjectionTracker(key);
   },

   /**
    * Registers the pointer operations this mediator handles
    */
   registerPointerOperations: function()
   {
      var registry = this.facade().retrieveMediator(upro.view.mediators.DocumentMouseMediator.NAME).getViewComponent();
      var sceneSystem = this.getViewComponent();

      {
         var rotOp = new upro.view.SceneObjectRotationOperation(sceneSystem, sceneSystem.camera);

         registry.registerOperation([true, false, false], rotOp);
      }
      {
         var moveOp = new upro.view.OrientedMoveOperation(sceneSystem, sceneSystem.getCameraRotationBuffer(),
            this.onMove.bind(this));

         registry.registerOperation([false, true, false], moveOp);
      }
      {
         var idleOp = new upro.view.IdlePointerOperation(this);

         registry.registerOperation([false, false, false], idleOp);
      }
   },

   onIdlePrimaryClick: function(realPos)
   {
      this.facade().sendNotification(upro.app.Notifications.ScenePointerActivation, realPos);
   },

   onIdleTertiaryClick: function()
   {
      var nextId = this.visibleGalaxyId ? this.visibleGalaxyId : 0;
      var lowestId = null;
      var nextHigherId = null;

      for (var galaxyId in this.galaxies)
      {
         if ((lowestId == null) || (lowestId > galaxyId))
         {
            lowestId = galaxyId;
         }
         if ((galaxyId > nextId) && ((nextHigherId == null) || (nextHigherId > galaxyId)))
         {
            nextHigherId = galaxyId;
         }
      }
      nextId = nextHigherId ? nextHigherId : lowestId;
      this.facade().sendNotification(upro.app.Notifications.SetActiveGalaxy, nextId);
   },

   onHover: function(realPos)
   {
      var sceneSystem = this.getViewComponent();
      var result = sceneSystem.pickAt(realPos);

      if (result)
      {
         this.facade().sendNotification(upro.app.Notifications.SetHighlightedObject, result.getRefObject());
      }
      else
      {
         this.facade().sendNotification(upro.app.Notifications.SetHighlightedObject, null);
      }
   },

   stopHover: function()
   {
      this.facade().sendNotification(upro.app.Notifications.SetHighlightedObject, null);
   },

   onMove: function(vec)
   {
      if (this.visibleGalaxyId)
      {
         var galaxyRender = this.galaxies[this.visibleGalaxyId];
         // scale the movement according to distance to center - faster if farther out
         var scale = vec3.length(galaxyRender.position) / 1.5;

         if (scale < 5)
         {
            scale = 5;
         }
         var translation = vec3.scale(vec, scale, vec3.create());
         vec3.add(galaxyRender.position, translation);

         var distance = vec3.length(galaxyRender.position);

         if (galaxyRender.position[1] > 2)
         {
            galaxyRender.position[1] = 2;
         }
         if (galaxyRender.position[1] < -20)
         {
            galaxyRender.position[1] = -20;
         }

         if (distance > 30)
         {
            vec3.normalize(galaxyRender.position);
            vec3.scale(galaxyRender.position, 30);
         }
         galaxyRender.setOrientationModified(true);
      }
   },

   onNotifyActiveGalaxyChanged: function(galaxyId)
   {
      var galaxyRender = this.galaxies[galaxyId];

      if ((this.visibleGalaxyId != null) && (this.visibleGalaxyId != galaxyId))
      {
         var oldRender = this.galaxies[this.visibleGalaxyId];

         oldRender.setVisible(false);
         this.visibleGalaxyId = null;
      }
      if (galaxyRender)
      {
         this.visibleGalaxyId = galaxyId;
         galaxyRender.setVisible(true);
      }
   }

});

upro.view.mediators.SceneMediator.NAME = "Scene";


upro.view.mediators.SolarSystemHighlightMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.SolarSystemHighlightMediator.NAME, null);
   },

   onRegister: function()
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();

      this.bracket = hudSystem.createHexagon(upro.hud.Button.Scale).hide();

      this.info = hudSystem.paper.text(0, 0, "");
      this.info.attr({"fill": "#FFF", "font-size": upro.view.mediators.SolarSystemHighlightMediator.TEXT_HEIGHT, "text-anchor": "end"});

      this.clearHighlight();
   },

   setHighlight: function(solarSystem, realPos)
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
      var pixel = hudSystem.realToViewCoordinates(realPos);
      var offset = upro.hud.Button.getOffset[5](0);

      this.bracket.stop();
      this.bracket.animate({"transform": "T" + pixel.x + "," + pixel.y, "fill-opacity": 0.2, "stroke-opacity": 0.3}, 50);

      this.info.attr({"text": solarSystem.name});
      this.info.attr({"x": pixel.x + offset.x, "y": pixel.y + offset.y});

      this.bracket.show();
      this.info.show();
   },

   clearHighlight: function()
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
      var pixel = hudSystem.realToViewCoordinates({ x: 0, y: 0 });

      this.bracket.hide();
      this.info.hide();

      this.bracket.attr({"transform": "T" + pixel.x + "," + pixel.y, "fill-opacity": 0.0, "stroke-opacity": 0.0});
      this.info.attr({"text": "", "x": pixel.x, "y": pixel.y});
   }

});

upro.view.mediators.SolarSystemHighlightMediator.NAME = "SolarSystemHighlight";
upro.view.mediators.SolarSystemHighlightMediator.TEXT_HEIGHT = 20;

/**
 * This abstract mediator provides support for a context menu and
 * handes the common operations; First and foremost, creating
 * the base menu and handling its removal.
 *
 * The stored ViewComponent is the base menu.
 */
upro.view.mediators.AbstractContextMenuMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super, name, iconCreator)
   {
      $super(name, new upro.hud.RadialMenu(iconCreator, this.onMenuCancel.bind(this)));

      this.activeContext = null;
      this.notifyBody = null;
   },

   /**
    * Returns the notification body set during show()
    * @return the notification body
    */
   getNotifyBody: function()
   {
      return this.notifyBody;
   },

   /**
    * Returns true if the context menu is currently shown
    * @return true if the context menu is currently shown
    */
   isVisible: function()
   {
      return this.activeContext != null;
   },

   /**
    * Requests to show the context menu at given position. If the context menu
    * is already shown, it will be cancelled first.
    * @param realPos the position to display the menu at
    * @param notifyBody the body to use for notifications
    */
   show: function(realPos, notifyBody)
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
      var menu = this.getViewComponent();
      var context = new upro.hud.RadialMenuContext(menu, hudSystem, realPos);

      this.cancel();
      this.activeContext = context;
      this.notifyBody = notifyBody;

      this.updateCommands();
      hudSystem.setActiveContextMenu(context);
      context.show();
   },

   /**
    * Cancels the context menu - if it is shown
    */
   cancel: function()
   {
      if (this.activeContext)
      {
         this.activeContext.cancel();
      }
   },

   /**
    * Creates a vector icon from given path data. Meant to be bound as icon creators
    * @param pathData the path data for the icon
    * @return a path object from the hud system
    */
   createVectorIcon: function(pathData)
   {
      var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
      var path = hudSystem.paper.path(pathData);

      path.attr("fill", "#FFF");

      return path;
   },

   /**
    * Sends a notification of given event, passing the currently stored notify body
    * @param event to send
    * @param body optional body that overwrites getNotifyBody()
    */
   notify: function(event, body)
   {
      this.facade().sendNotification(event, (body !== undefined) ? body : this.getNotifyBody());
   },

   /**
    * Handler when the context menu gets closed.
    */
   onMenuCancel: function()
   {
      if (this.activeContext)
      {
         var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();

         hudSystem.setActiveContextMenu(null);
         this.activeContext = null;
      }
   },

   /**
    * Called if the entire menu should be updated - typically shortly before being shown.
    */
   updateCommands: function()
   {

   }
});

/**
 * Context menu mediator for solar systems. Expects the solar system as notification body at show()
 */
upro.view.mediators.SolarSystemContextMenuMediator = Class.create(upro.view.mediators.AbstractContextMenuMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.SolarSystemContextMenuMediator.NAME, this.createVectorIcon.bind(this,
            upro.res.menu.IconData.SolarSystem));
   },

   onRegister: function()
   {
      var menu = this.getViewComponent();
      var mediator = this;

      { // routing
         var subMenu = menu.setSubMenu(0, this.createVectorIcon.bind(this, upro.res.menu.IconData.Routing),
               upro.res.text.Lang.format("routing.menuLabel"));

         this.commandActiveRouteAddCheckpoint = new upro.hud.SimpleCommandAdapter(function()
         {
            mediator.notify(upro.app.Notifications.ActiveRouteAddCheckpoint);
            mediator.cancel();
         }, upro.res.text.Lang.format("solarSystem.routing.addCheckpoint"));
         subMenu.setCommand(0, this.createVectorIcon.bind(this, upro.res.menu.IconData.Checkpoint),
               this.commandActiveRouteAddCheckpoint);

         this.commandActiveRouteAddWaypoint = new upro.hud.SimpleCommandAdapter(function()
         {
            mediator.notify(upro.app.Notifications.ActiveRouteAddWaypoint);
            mediator.cancel();
         }, upro.res.text.Lang.format("solarSystem.routing.addWaypoint"));
         subMenu.setCommand(5, this.createVectorIcon.bind(this, upro.res.menu.IconData.Waypoint),
               this.commandActiveRouteAddWaypoint);

         this.commandActiveRouteRemoveEntry = new upro.hud.SimpleCommandAdapter(function()
         {
            mediator.notify(upro.app.Notifications.ActiveRouteRemoveEntry);
            mediator.cancel();
         }, upro.res.text.Lang.format("solarSystem.routing.remove"));
         subMenu.setCommand(3, this.createVectorIcon.bind(this, upro.res.menu.IconData.Delete),
               this.commandActiveRouteRemoveEntry);

         this.commandActiveRouteIgnoreSystem = new upro.hud.SimpleCommandAdapter(function()
         {
            mediator.notify(upro.app.Notifications.UserIgnoredSolarSystemIgnoreToggle);
            mediator.cancel();
         }, upro.res.text.Lang.format("solarSystem.routing.toggleIgnore"));
         subMenu.setCommand(4, this.createVectorIcon.bind(this, upro.res.menu.IconData.Denied),
               this.commandActiveRouteIgnoreSystem);
      }
      { // jump corridor control
         var corridorMenu = menu.setSubMenu(5, this.createVectorIcon.bind(this, upro.res.menu.IconData.JumpCorridor),
               upro.res.text.Lang.format("corridor.menuLabel"));

         this.commandCorridorExit = new upro.hud.SimpleCommandAdapter(function()
         {
            mediator.notify(upro.app.Notifications.NewCorridorSetExit);
            mediator.cancel();
         }, upro.res.text.Lang.format("corridor.exit"));
         corridorMenu.setCommand(4, this.createVectorIcon.bind(this, upro.res.menu.IconData.WormholeOut),
               this.commandCorridorExit);

         this.commandCorridorPrepWormhole = new upro.hud.SimpleCommandAdapter(function()
         {
            mediator.notify(upro.app.Notifications.NewCorridorPrepareWormhole);
            mediator.cancel();
         }, upro.res.text.Lang.format("corridor.entry.wormhole"));
         corridorMenu.setCommand(0, this.createVectorIcon.bind(this, upro.res.menu.IconData.Wormhole),
               this.commandCorridorPrepWormhole);
         this.commandCorridorPrepJumpBridge = new upro.hud.SimpleCommandAdapter(function()
         {
            mediator.notify(upro.app.Notifications.NewCorridorPrepareJumpBridge);
            mediator.cancel();
         }, upro.res.text.Lang.format("corridor.entry.jumpBridge"));
         corridorMenu.setCommand(1, this.createVectorIcon.bind(this, upro.res.menu.IconData.Bridge),
               this.commandCorridorPrepJumpBridge);

      }
   },

   /** {@inheritDoc} */
   updateCommands: function()
   {
      this.updateCommandActiveRoute();
      this.updateCommandIgnored();
      this.updateCommandCorridor();
   },

   /**
    * Updates the commands for the active route
    */
   updateCommandActiveRoute: function()
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);
      var solarSystem = this.getNotifyBody();

      this.commandActiveRouteAddCheckpoint.setPossible(solarSystem
            && activeRouteProxy.canEntryBeAdded(solarSystem, upro.nav.SystemRouteEntry.EntryType.Checkpoint));
      this.commandActiveRouteAddWaypoint.setPossible(solarSystem
            && activeRouteProxy.canEntryBeAdded(solarSystem, upro.nav.SystemRouteEntry.EntryType.Waypoint));
      this.commandActiveRouteRemoveEntry.setPossible(solarSystem
            && activeRouteProxy.containsSolarSystemAsEntry(solarSystem));
   },

   updateCommandIgnored: function(list)
   {
      var solarSystem = this.getNotifyBody();

      if (!list)
      {
         var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

         list = settingsProxy.getIgnoredSolarSystemIds();
      }
      this.commandActiveRouteIgnoreSystem.setActive(solarSystem && (list.indexOf(solarSystem.id) >= 0));
   },

   updateCommandCorridor: function()
   {
      var sessionProxy = this.facade().retrieveProxy(upro.model.proxies.UserSessionProxy.NAME);
      var solarSystem = this.getNotifyBody();
      var prepJumpType = sessionProxy.getCorridorPreparationJumpType();
      var isSystemNullSec = solarSystem
            && (solarSystem.galaxy.id == upro.model.proxies.UniverseProxy.GALAXY_ID_NEW_EDEN)
            && (solarSystem.security == 0.0);
      var isCorridorPossible = false;

      if (prepJumpType == upro.nav.JumpType.DynamicWormhole)
      { // wormholes are possible always and anywhere
         isCorridorPossible = true;
      }
      else if (prepJumpType == upro.nav.JumpType.JumpBridge)
      { // jump bridges are only possible in NewEdens null sec and within 5ly
         // TODO: fetch other, get distance
         isCorridorPossible = isSystemNullSec; // && distance <= 5ly
      }

      this.commandCorridorExit.setPossible(isCorridorPossible);

      this.commandCorridorPrepJumpBridge.setPossible(isSystemNullSec);
   },

   /**
    * Notification handler
    */
   onNotifyActiveRoutePathChanged: function()
   {
      this.updateCommandActiveRoute();
   },

   onNotifyUserIgnoredSolarSystemsChanged: function(list)
   {
      this.updateCommandIgnored(list);
   }

});

upro.view.mediators.SolarSystemContextMenuMediator.NAME = "SolarSystemContextMenu";

/**
 * This mediator is responsible of showing the highlights of route waypoints,
 * using sw-projections from the scene.
 */
upro.view.mediators.ActiveRouteOverlayMediator = Class.create(upro.view.mediators.AbstractMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.ActiveRouteOverlayMediator.NAME, null);

      this.systems = {};
   },

   /**
    * Removes all system overlays
    */
   clear: function()
   {
      for (var key in this.systems)
      {
         this.removeSystemOverlay(key);
      }
   },

   /**
    * Sets an overlay for given system and information
    */
   setSystemOverlay: function(solarSystem, index, valid)
   {
      var key = this.createKey(solarSystem);
      var entry = this.systems[key];

      if (!entry)
      {
         var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
         var sceneMediator = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);
         var textColor = valid ? "#FFFF00" : "#FF0000";
         var bracketColor = valid ? "#808000" : "800000";

         entry =
         {
            "solarSystem": solarSystem,
            "bracket": null,
            "info": null,
            "text": "" + index + ": " + solarSystem.name
         };
         entry.bracket = hudSystem.createHexagon(5).hide();
         entry.bracket.attr({ "stroke": bracketColor, "fill": bracketColor, "fill-opacity": 0.1, "stroke-opacity": 0.8});
         entry.info = hudSystem.paper.text(0, 0, "").hide();
         entry.info.attr({"fill": textColor, "font-size": upro.view.mediators.ActiveRouteOverlayMediator.TEXT_HEIGHT, "text-anchor": "start"});
         entry.info.attr({"text": entry.text});
         this.systems[key] = entry;

         sceneMediator.addSolarSystemTrack(key, solarSystem, this.onProjectionChanged.bind(this, key));
      }
      else
      {
         entry.text += "\r\n" + index + ": " + solarSystem.name;
         entry.info.attr({"text": entry.text});
      }
   },

   /**
    * Key creation helper for the projection tracker
    * @param solarSystem for which the key shall be created
    */
   createKey: function(solarSystem)
   {
      return "RouteOverlay:" + solarSystem.id;
   },

   /**
    * Removes the system overlay with given key
    * @param key to remove
    */
   removeSystemOverlay: function(key)
   {
      var sceneMediator = this.facade().retrieveMediator(upro.view.mediators.SceneMediator.NAME);
      var entry = this.systems[key];

      if (entry)
      {
         delete this.systems[key];
         sceneMediator.removeSolarSystemTrack(key, entry.solarSystem);

         entry.bracket.remove();
         entry.info.remove();
      }
   },

   /**
    * Callback for a change in a projection
    * @param key for which the callback is
    * @param tracker running the projection
    * @param valid whether the projection is confirmed
    */
   onProjectionChanged: function(key, tracker, confirmed)
   {
      var entry = this.systems[key];
      var realPos = tracker.getProjectedPosition();

      if (realPos)
      {
         var hudSystem = this.facade().retrieveMediator(upro.view.mediators.HudMediator.NAME).getViewComponent();
         var pixel = hudSystem.realToViewCoordinates(realPos);
         var offset = upro.hud.Button.getOffset[2](0);

         entry.bracket.attr({"transform": "T" + pixel.x + "," + pixel.y});
         entry.bracket.show();
         entry.info.attr({"x": pixel.x + offset.x, "y": pixel.y + offset.y});
         entry.info.show();
      }
      else
      {
         entry.bracket.hide();
         entry.info.hide();
      }
   }
});

upro.view.mediators.ActiveRouteOverlayMediator.NAME = "ActiveRouteOverlay";
upro.view.mediators.ActiveRouteOverlayMediator.TEXT_HEIGHT = 15;

/**
 * Context menu mediator for master.
 */
upro.view.mediators.MainContextMenuMediator = Class.create(upro.view.mediators.AbstractContextMenuMediator,
{
   initialize: function($super)
   {
      $super(upro.view.mediators.MainContextMenuMediator.NAME, null);
   },

   onRegister: function()
   {
      var menu = this.getViewComponent();
      var mediator = this;

      {  // routing
         var routingMenu = menu.setSubMenu(0, this.createVectorIcon.bind(this, upro.res.menu.IconData.Routing),
            upro.res.text.Lang.format("routing.menuLabel"));

         this.commandActiveRouteReset = new upro.hud.SimpleCommandAdapter( function()
            { mediator.notify(upro.app.Notifications.ActiveRouteReset); mediator.cancel(); },
            upro.res.text.Lang.format("routing.clearRoute"));
         routingMenu.setCommand(3, this.createVectorIcon.bind(this, upro.res.menu.IconData.Delete), this.commandActiveRouteReset);

         {  // rules
            var rulesMenu = routingMenu.setSubMenu(5, this.createVectorIcon.bind(this, upro.res.menu.IconData.List),
               upro.res.text.Lang.format("routing.rules.menuLabel"));

            this.ruleCommands = {};
            this.createRoutingRuleCommandSet(rulesMenu, 0, "MinSecurity", upro.res.menu.IconData.MinSecurity);
            this.createRoutingRuleCommandSet(rulesMenu, 1, "MaxSecurity", upro.res.menu.IconData.MaxSecurity);
            this.createRoutingRuleCommandSet(rulesMenu, 2, "Jumps", upro.res.menu.IconData.Hash);
            this.createRoutingRuleCommandSet(rulesMenu, 5, "JumpFuel", upro.res.menu.IconData.Fuel);
         }
         {  // capabilities
            var capMenu = routingMenu.setSubMenu(0, this.createVectorIcon.bind(this, upro.res.menu.IconData.Capabilities),
               upro.res.text.Lang.format("routing.capabilities.menuLabel"));

            this.commandRoutingCapJumpGates = new upro.hud.SimpleCommandAdapter( function()
               { mediator.notify(upro.app.Notifications.UserRoutingCapJumpGatesToggle); });
            capMenu.setCommand(0, this.createVectorIcon.bind(this, upro.res.menu.IconData.JumpGate), this.commandRoutingCapJumpGates);

            var driveMenu = capMenu.setSubMenu(1, this.createVectorIcon.bind(this, upro.res.menu.IconData.JumpDrive),
               upro.res.text.Lang.format("routing.caps.jumpDrive.menuLabel"));

            this.commandRoutingCapJumpDrive = new upro.hud.SimpleCommandAdapter( function()
               { mediator.notify(upro.app.Notifications.UserRoutingCapJumpDriveToggle); });
            driveMenu.setCommand(3, this.createVectorIcon.bind(this, upro.res.menu.IconData.Power), this.commandRoutingCapJumpDrive);
            this.commandRoutingCapJumpDriveMore = new upro.hud.SimpleCommandAdapter( function()
               { mediator.notify(upro.app.Notifications.UserRoutingCapJumpDriveRangeStep, true); });
            driveMenu.setCommand(0, this.createVectorIcon.bind(this, upro.res.menu.IconData.Higher), this.commandRoutingCapJumpDriveMore);
            this.commandRoutingCapJumpDriveLess = new upro.hud.SimpleCommandAdapter( function()
               { mediator.notify(upro.app.Notifications.UserRoutingCapJumpDriveRangeStep, false); });
            driveMenu.setCommand(1, this.createVectorIcon.bind(this, upro.res.menu.IconData.Lower), this.commandRoutingCapJumpDriveLess);
         }
      }
   },

   /**
    * Creates the command set for a routing rule. This expects that all rules have the same commands.
    * @param rulesMenu the menu to insert the submenu in
    * @param rulesMenuIndex at which index to insert
    * @param ruleType the rule type according to upro.model.UserRoutingRule.RuleConstants
    * @param mainIcon icon to use for this rule menu
    */
   createRoutingRuleCommandSet: function(rulesMenu, rulesMenuIndex, ruleType, mainIcon)
   {
      var menuLabel = upro.res.text.Lang.format("routing.rules.rule[" + ruleType + "].menuLabel");
      var subMenu = rulesMenu.setSubMenu(rulesMenuIndex, this.createVectorIcon.bind(this, mainIcon), menuLabel);
      var mediator = this;

      this.ruleCommands[ruleType] = {};

      this.ruleCommands[ruleType].more = new upro.hud.SimpleCommandAdapter( function()
         { mediator.notify(upro.app.Notifications.UserRoutingRuleMore, ruleType); });
      subMenu.setCommand(0, this.createVectorIcon.bind(this, upro.res.menu.IconData.Higher), this.ruleCommands[ruleType].more);
      this.ruleCommands[ruleType].less = new upro.hud.SimpleCommandAdapter( function()
         { mediator.notify(upro.app.Notifications.UserRoutingRuleLess, ruleType); });
      subMenu.setCommand(1, this.createVectorIcon.bind(this, upro.res.menu.IconData.Lower), this.ruleCommands[ruleType].less);

      this.ruleCommands[ruleType].toggle = new upro.hud.SimpleCommandAdapter( function()
         { mediator.notify(upro.app.Notifications.UserRoutingRuleToggle, ruleType); });
      subMenu.setCommand(3, this.createVectorIcon.bind(this, upro.res.menu.IconData.Power), this.ruleCommands[ruleType].toggle);

      this.ruleCommands[ruleType].up = new upro.hud.SimpleCommandAdapter( function()
         { mediator.notify(upro.app.Notifications.UserRoutingRuleUp, ruleType); },
         upro.res.text.Lang.format("routing.rules.up"));
      subMenu.setCommand(5, this.createVectorIcon.bind(this, upro.res.menu.IconData.Up), this.ruleCommands[ruleType].up);
      this.ruleCommands[ruleType].down = new upro.hud.SimpleCommandAdapter( function()
         { mediator.notify(upro.app.Notifications.UserRoutingRuleDown, ruleType); },
         upro.res.text.Lang.format("routing.rules.down"));
      subMenu.setCommand(4, this.createVectorIcon.bind(this, upro.res.menu.IconData.Down), this.ruleCommands[ruleType].down);
   },

   /** {@inheritDoc} */
   updateCommands: function()
   {
      this.updateCommandActiveRoute();
      this.updateCommandRoutingCapabilities();
      this.updateCommandRoutingRules();
   },

   /**
    * Updates the commands for the active route
    */
   updateCommandActiveRoute: function()
   {
      var activeRouteProxy = this.facade().retrieveProxy(upro.model.proxies.ActiveRouteProxy.NAME);

      this.commandActiveRouteReset.setPossible(!activeRouteProxy.isEmpty());
   },

   updateCommandRoutingCapabilities: function()
   {
      var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);
      var inUse;
      var onText = upro.res.text.Lang.format("general.on");
      var offText = upro.res.text.Lang.format("general.off");

      {  // jump gates
         inUse = settingsProxy.getRoutingCapJumpGatesInUse();

         this.commandRoutingCapJumpGates.setActive(inUse);
         this.commandRoutingCapJumpGates.setLabel(upro.res.text.Lang.format("routing.caps.jumpGates.toggle", inUse ? offText : onText));
      }
      {  // jump drive
         var range = settingsProxy.getRoutingCapJumpDriveRange();
         var belowMaximum = range < upro.model.UserSettings.JumpDriveConstants.MaximumRange;
         var aboveMinimum = range > upro.model.UserSettings.JumpDriveConstants.MinimumRange;
         inUse = settingsProxy.getRoutingCapJumpDriveInUse();

         this.commandRoutingCapJumpDrive.setActive(inUse);
         this.commandRoutingCapJumpDrive.setLabel(upro.res.text.Lang.format("routing.caps.jumpDrive.toggle", inUse ? offText : onText));

         this.commandRoutingCapJumpDriveMore.setPossible(belowMaximum);
         this.commandRoutingCapJumpDriveMore.setLabel(
            belowMaximum
               ? upro.res.text.Lang.format("routing.caps.jumpDrive.rangeSet", range, range + upro.model.UserSettings.JumpDriveConstants.RangeStep)
               : upro.res.text.Lang.format("routing.caps.jumpDrive.rangeLimit", range));
         this.commandRoutingCapJumpDriveLess.setPossible(aboveMinimum);
         this.commandRoutingCapJumpDriveLess.setLabel(
            aboveMinimum
               ? upro.res.text.Lang.format("routing.caps.jumpDrive.rangeSet", range, range - upro.model.UserSettings.JumpDriveConstants.RangeStep)
               : upro.res.text.Lang.format("routing.caps.jumpDrive.rangeLimit", range));
      }
   },

   /**
    * Updates the commands for the routing rules
    */
   updateCommandRoutingRules: function(rules)
   {
      if (!rules)
      {
         var settingsProxy = this.facade().retrieveProxy(upro.model.proxies.UserSettingsProxy.NAME);

         rules = settingsProxy.getRoutingRules();
      }

      for (var i = 0; i < rules.length; i++)
      {
         var rule = rules[i];
         var commandEntry = this.ruleCommands[rule.getRuleType()];
         var template = upro.model.UserRoutingRule.RuleConstants[rule.getRuleType()];

         if (commandEntry && template)
         {
            var menuLabel = upro.res.text.Lang.format("routing.rules.rule[" + rule.getRuleType() + "].menuLabel");
            var parameter = rule.getParameter();
            var belowMaximum = parameter < template.Maximum;
            var aboveMinimum = parameter > template.Minimum;

            commandEntry.toggle.setActive(rule.getInUse());
            commandEntry.toggle.setLabel(upro.res.text.Lang.format("routing.rules.toggle",
               menuLabel, upro.res.text.Lang.format(rule.getInUse() ? "general.off" : "general.on")));
            commandEntry.more.setPossible(belowMaximum);
            commandEntry.more.setLabel(belowMaximum
               ? upro.res.text.Lang.format("routing.rules.rule[" + rule.getRuleType() + "].paramSet",
                  (parameter * template.Factor).toFixed(template.Fixed), ((parameter + template.Increment) * template.Factor).toFixed(template.Fixed))
               : upro.res.text.Lang.format("routing.rules.rule[" + rule.getRuleType() + "].paramLimit",
                  (parameter * template.Factor).toFixed(template.Fixed)));
            commandEntry.less.setPossible(aboveMinimum);
            commandEntry.less.setLabel(aboveMinimum
               ? upro.res.text.Lang.format("routing.rules.rule[" + rule.getRuleType() + "].paramSet",
                  (parameter * template.Factor).toFixed(template.Fixed), ((parameter - template.Increment) * template.Factor).toFixed(template.Fixed))
               : upro.res.text.Lang.format("routing.rules.rule[" + rule.getRuleType() + "].paramLimit",
                  (parameter * template.Factor).toFixed(template.Fixed)));
            commandEntry.up.setPossible(i > 0);
            commandEntry.down.setPossible(i < (rules.length - 1));
         }
      }
   },

   /** Notification handler */
   onNotifyActiveRoutePathChanged: function()
   {
      this.updateCommandActiveRoute();
   },

   /** Notification handler */
   onNotifyUserRoutingCapabilitiesChanged: function()
   {
      this.updateCommandRoutingCapabilities();
   },

   /** Notification handler */
   onNotifyUserRoutingRulesChanged: function(rules)
   {
      this.updateCommandRoutingRules(rules);
   }
});

upro.view.mediators.MainContextMenuMediator.NAME = "MainContextMenu";

/**
 * The app namespace contains the application startup code
 */
upro.app = {};

/**
 * An enumeration containing all the notification constants. Note: they are initialized with 0, but will be set to their
 * own name by the function below.
 */
upro.app.Notifications =
{
   /** First notification. */
   Startup: 0,
   /** Some debuggin message. Param: text */
   DebugMessage: 0,

   SessionLogInRequest: 0,
   /** A session has been successfully created. Param: null */
   SessionLoggedIn: 0,
   /** The session has been dropped. Param: null */
   SessionLoggedOut: 0,

   /** Requests to set the active galaxy. Param: galaxyId */
   SetActiveGalaxy: 0,
   /** The active galaxy has changed. Param: galaxyId */
   ActiveGalaxyChanged: 0,

   /** Requests to highlight an object */
   SetHighlightedObject: 0,
   /** Highlighted object has changed */
   HighlightedObjectChanged: 0,

   /** pointer activation in 3D scene. Param: realPos */
   ScenePointerActivation: 0,

   /** Resets the active route */
   ActiveRouteReset: 0,
   /** Removes an entry from the active route. Param: SolarSystem */
   ActiveRouteRemoveEntry: 0,
   /** Add a checkpoint to the active route. Param: SolarSystem */
   ActiveRouteAddCheckpoint: 0,
   /** Add a waypoint to the active route. Param: SolarSystem */
   ActiveRouteAddWaypoint: 0,
   /** The set-up of the active route has changed. */
   ActiveRoutePathChanged: 0,

   /** Notified when the list of ignored solar systems changed. Param: Id[] */
   UserIgnoredSolarSystemsChanged: 0,
   /** Have a system change its ignored status. Param: SolarSystem */
   UserIgnoredSolarSystemIgnoreToggle: 0,

   /** Notified when the routing rules have been changed */
   UserRoutingRulesChanged: 0,
   /** User routing rules: Toggle. Param: RuleType */
   UserRoutingRuleToggle: 0,
   /** User routing rules: More. Param: RuleType */
   UserRoutingRuleMore: 0,
   /** User routing rules: Less. Param: RuleType */
   UserRoutingRuleLess: 0,
   /** User routing rules: order up. Param: RuleType */
   UserRoutingRuleUp: 0,
   /** User routing rules: order down. Param: RuleType */
   UserRoutingRuleDown: 0,

   /** User routing capabilities changed */
   UserRoutingCapabilitiesChanged: 0,
   /** User routing capability jump gate toggle */
   UserRoutingCapJumpGatesToggle: 0,
   /** User routing capability jump drive toggle */
   UserRoutingCapJumpDriveToggle: 0,
   /** User routing capability jump drive range step. Param: Boolean whether to increment */
   UserRoutingCapJumpDriveRangeStep: 0,

   /** Event when the entry system for a new corridor has been set */
   NewCorridorPreparationChanged: 0,
   /** Sets the exit system for a new corridor. Param: SolarSystem */
   NewCorridorSetExit: 0,
   /** Prepares a new corridor of type wormhole. Param: SolarSystem */
   NewCorridorPrepareWormhole: 0,
   /** Prepares a new corridor of type jump bridge. Param: SolarSystem */
   NewCorridorPrepareJumpBridge: 0
};

/**
 * Iterate through all entries in the enumeration and set the value to the id itself. That way, the values can be
 * initialized with just one char, but will have a human readable string during runtime.
 */
(function()
{
   for ( var notifyName in upro.app.Notifications)
   {
      upro.app.Notifications[notifyName] = notifyName;
   }
})();

/**
 * The application facade is the main entry point for the whole
 * application.
 */
upro.app.ApplicationFacade = Class.create(Facade,
{
   initialize: function($super)
   {
      $super(upro.app.ApplicationFacade.NAME);

      var notifiedCommands = upro.ctrl.cmd.getAllNotified();

      for (var notificationName in notifiedCommands)
      {
         this.registerCommand(notificationName, notifiedCommands[notificationName]);
      }
   },

   /**
    * Sends the Startup notification to start the application logic.
    */
   start: function()
   {
      /*
       * To the interested programmer who tries to figure out how this all
       * works: You'll need some knowledge about puremvc but you should be
       * able to continue using these pointers:
       * - Notifications result in view actions (mediators listen to them)
       *   and/or commands are executed.
       * - Instead of manually registering every command, commands are bound
       *   to notifications if they have the name pattern
       *   "Notified" (notification-name) "Command" - So, to continue,
       *   look at the NotifiedStartupCommand class.
       */
      this.sendNotification(upro.app.Notifications.Startup);
   }
});

upro.app.ApplicationFacade.NAME = "upro";

/**
 * The res namespace contains static resources, which typically are created
 * before the whole JavaScript source package is built.
 */
upro.res = {};

/**
 * The text namespace has resources for texts
 */
upro.res.text = {};

/**
 * The Util container has a few text utilities
 */
upro.res.text.Util =
{
   /**
    * Formats a text and replaces placeholders with additional parameters.
    * Placeholder: "{" (index) "}" -- index: 0 based starting with the first after text
    * @param text: The text to format.
    * @return a formatted text
    */
   format: function(text)
   {
      var originalArg = arguments;
      var result = text;
      var replacer = function(index)
      {
         return originalArg[new Number(index.substr(1, index.length - 2)) + 1];
      };

      return result.replace(/[{]\d+[}]/g, replacer);
   }
};

/**
 * The Language container provides helper for localisation
 */
upro.res.text.Lang =
{
   /** The default language upro uses */
   defaultLang: "en",

   /** Internal map for all currently available texts */
   texts: {},

   /**
    * Sets the current language.
    * @param langId an identifier available in the text templates
    */
   setCurrentLanguage: function(langId)
   {
      var templates = upro.res.text.templates;
      var rCode = true;

      upro.sys.log("Setting language to: [" + langId + "]");
      upro.res.text.Lang.texts = {}; // reset
      if (!upro.res.text.Lang.copyMissingTextsFrom(templates[langId], false))
      {
         rCode = false;
      }
      {  // copy from base set if existing
         var delim = langId.indexOf("-");

         if (delim > 0)
         {
            if (!upro.res.text.Lang.copyMissingTextsFrom(templates[langId.substr(0, delim)], false))
            {
               rCode = false;
            }
         }
      }
      if (!upro.res.text.Lang.copyMissingTextsFrom(templates[upro.res.text.Lang.defaultLang], true))
      {  // fill and check with default language
         rCode = false;
      }
      if (!rCode)
      {
         upro.sys.log("Some errors occured while setting language");
      }

      return rCode;
   },

   /**
    * Copies missing text strings into the main container and performs some error checks
    * @param source source template to copy from
    * @param errIfMissing whether an error should be logged if an entry was missing
    */
   copyMissingTextsFrom: function(source, errIfMissing)
   {
      var defaultTexts = upro.res.text.templates[upro.res.text.Lang.defaultLang];
      var rCode = false;

      if (source)
      {  // check whether the template exists at all
         var dest = upro.res.text.Lang.texts;

         rCode = true;
         for (var entry in source)
         {
            if (!defaultTexts[entry])
            {  // the template contains a key that is not in the default language.
               rCode = false;
               upro.sys.log("Container has an entry the default language has not: [" + entry + "]");
            }
            if (!dest[entry])
            {
               if (errIfMissing)
               {  // An entry had to be copied although not expected
                  rCode = false;
                  upro.sys.log("Container is missing entry for [" + entry + "]");
               }
               dest[entry] = source[entry];
            }
         }
      }

      return rCode;
   },

   /**
    * Retrieves the translated string for given key and applies a
    * upro.res.text.Util.format() on it, passing along any further
    * parameters after key. See format() for details.
    * The result is then returned.
    *
    * @param key to look for in the texts
    * @return the translated and formatted string.
    */
   format: function(key)
   {
      var result;
      var text = this.texts[key];

      if (text)
      {
         var temp = [ text ];

         for (var i = 1; i < arguments.length; i++)
         {
            temp.push(arguments[i]);
         }
         result = upro.res.text.Util.format.apply(this, temp);
      }
      else
      {
         upro.sys.log("Unknown key [" + key + "] specified for text");
         result = "ERROR: Missing Text for [" + key + "]";
      }

      return result;
   }
};

/**
 * The eve namespace resources from or about EVE Online.
 * The main entries will be the exported map data from the DB dump.
 */
upro.res.eve = {};

/*
 * Initialize the known map data with empty arrays.
 * This allows possibly exclusion of some data dump if the application
 * needs it that way.
 */
upro.res.eve.MapData = {};

upro.res.eve.MapData[9] =
{
   regionData: [],
   constellationData: [],
   solarSystemData: [],
   solarSystemJumpData: []
};

upro.res.eve.MapData[9000001] =
{
   regionData: [],
   constellationData: [],
   solarSystemData: [],
   solarSystemJumpData: []
};

upro.res.eve.IconData = {};

/*
 * The following SVG paths have been taken and extracted from http://eve.damianvila.com/logos.htm
 */

upro.res.eve.IconData.Amarr = "M30.483,34.296c2.059,4.295,5.294,8.166,9.395,11.388c9.196-3.321,19.755-5.214,30.989-5.214"
      + "c10.811,0,20.994,1.759,29.944,4.852c4.06-3.292,7.223-7.23,9.193-11.594c-11.216-4.955-24.669-7.851-39.138-7.851"
      + "C55.853,25.877,41.944,28.993,30.483,34.296 M9.715,49.222C3.55,56.216,0,64.358,0,73.053c0,9.086,3.865,17.563,10.544,24.76"
      + "c-2.673-4.653-4.148-9.691-4.148-14.962c0-8.128,3.488-15.716,9.522-22.169C13.364,57.113,11.278,53.271,9.715,49.222"
      + "M141.732,73.053c0-9.18-3.952-17.741-10.767-24.99c-1.479,4.137-3.517,8.063-6.026,11.722"
      + "c6.567,6.637,10.397,14.556,10.397,23.065c0,5.271-1.477,10.309-4.146,14.962C137.87,90.616,141.732,82.137,141.732,73.053"
      + "M125.79,31.875c0-12.304-5.61-23.5-14.79-31.875c5.847,6.568,9.294,14.598,9.294,23.279"
      + "c0,22.189-22.464,40.182-50.175,40.182c-27.713,0-50.178-17.992-50.178-40.182c0-8.681,3.448-16.711,9.294-23.279"
      + "c-9.178,8.375-14.792,19.571-14.792,31.875c0,22.837,19.318,41.861,44.915,46.092l-0.003,0.003c0,0,2.849,0.401,5.348,4.448"
      + "c3.763,6.1,5.398,11.395,5.398,11.395s1.632-5.295,5.398-11.395c2.382-3.862,5.055-4.396,5.297-4.438"
      + "C106.434,73.775,125.79,54.735,125.79,31.875";

upro.res.eve.IconData.Caldari = "M70.866,0C31.728,0,0,31.727,0,70.866c0,39.139,31.728,70.866,70.866,70.866c39.139,0,70.867-31.728,70.867-70.866"
      + "C141.732,31.727,110.005,0,70.866,0 M53.23,62.03c3.244-6.462,9.914-10.908,17.636-10.908c10.904,0,19.744,8.84,19.744,19.743"
      + "c0,10.903-8.84,19.743-19.744,19.743c-7.722,0-14.392-4.445-17.636-10.907l-14.51,4.782c5.307,12.511,17.702,21.286,32.146,21.286"
      + "c13.471,0,25.139-7.644,30.958-18.819l13.883,5.397c-8.016,16.7-25.081,28.229-44.841,28.229"
      + "c-27.455,0-49.712-22.257-49.712-49.712c0-27.455,22.257-49.712,49.712-49.712c19.76,0,36.826,11.529,44.841,28.229l-13.883,5.398"
      + "c-5.819-11.176-17.487-18.819-30.958-18.819c-14.444,0-26.839,8.775-32.146,21.286L53.23,62.03z";

upro.res.eve.IconData.Gallente = "M0,0v169.424l70.864,33.801l70.868-33.801V0H0z M111.755,80.536c3.258,3.461,6.059,4.169,6.924,4.226"
      + "c0.865,0.048-3.399,1.496-8.655-0.866c-1.017-0.459-2.496-1.581-2.496-1.581s-0.024,4.942,4.073,11.049"
      + "c4.57,6.808,7.205,7.995,8.755,8.76c1.888,0.927-4.846,0.442-10.385-2.954c-4.477-2.752-5.596-5.4-5.596-5.4"
      + "s-0.858,3.745,1.831,11.103c1.87,5.113,5.729,11.499,11.685,15.766c3.583,2.567-7.611,0.181-13.516-6.948"
      + "c-5.908-7.126-5.704-10.038-5.704-10.038s-1.989,3.737-1.779,9.694c0.149,4.315,1.488,8.323,3.436,11.149"
      + "c2.751,3.994-2.865,0.345-7.562-5.687c-3.743-4.817-4.121-8.593-4.121-8.593s-1.229,2.204-1.526,3.857"
      + "c-0.308,1.681-0.232,2.94,0.073,3.816c0.308,0.878-2.594-1.985-4.082-4.77c-1.215-2.277-1.946-5.156-1.946-5.156"
      + "s-2.76,5.173-1.986,7.29c1.22,3.361,2.287,2.903,3.815,5.501c1.526,2.595,1.526,3.815,3.055,6.413"
      + "c1.529,2.595,2.598,4.43,4.582,4.735c1.053-1.922,1.981-1.986,3.92-1.986c3.207,0,5.805,4.174,5.805,7.89"
      + "c0,0.809-0.096,1.586-0.272,2.318c-0.749-2.084-1.508-4.252-4.261-5.168c0.98,1.114,1.666,3.415,1.666,5.434"
      + "c0,2.084-0.242,3.729-2.429,5.154c0.226-0.728,0.562-1.818,0.562-2.646c0-3.656-1.582-5.699-4.891-6.457"
      + "c-1.897,0-3.434,1.983-3.434,4.432c0,0.413,0.04,0.814,0.121,1.191c-0.773-0.83-1.288-2.335-1.288-4.055"
      + "c0-1.964,0.671-3.643,1.632-4.367c0,0-2.17-3.113-4.31-4.946c-1.926-1.654-3.735-1.841-6.419-4.533"
      + "c1.065,2.233,2.25,6.131,2.225,12.369c-0.036,8.248-1.547,11.257-2.189,12.425c-0.561,1.016-0.356-2.905-0.712-5.397"
      + "c-0.304-2.139-1.733-5.241-2.601,2.138c-0.48,4.111-2.646,9.623-3.052,9.623c-0.46,0-2.137-6.413-2.594-9.623"
      + "c-0.46-3.205-0.532-6.39-1.221-5.498c-1.937,2.493,0,6.873-1.681,4.734c-1.417-1.799-1.173-7.483-0.867-13.438"
      + "c0.203-3.954,0.845-6.799,1.264-8.29c-3.206,3.657-5.188,3.661-7.324,5.491c-2.137,1.833-4.306,4.946-4.306,4.946"
      + "c0.959,0.725,1.631,2.403,1.631,4.367c0,1.72-0.518,3.225-1.289,4.055c0.08-0.377,0.123-0.778,0.123-1.191"
      + "c0-2.448-1.538-4.432-3.437-4.432c-3.309,0.758-4.888,2.801-4.888,6.457c0,0.828,0.331,1.919,0.561,2.646"
      + "c-2.19-1.425-2.428-3.07-2.428-5.154c0-2.019,0.683-4.319,1.663-5.434c-2.751,0.916-3.509,3.084-4.259,5.168"
      + "c-0.178-0.732-0.272-1.51-0.272-2.318c0-3.716,2.6-7.89,5.801-7.89c1.943,0,2.87,0.064,3.923,1.986"
      + "c1.986-0.306,3.055-2.141,4.581-4.735c1.528-2.598,1.528-3.818,3.055-6.413c1.526-2.598,2.595-2.14,3.818-5.501"
      + "c0.771-2.117-1.985-7.29-1.985-7.29s-0.732,2.879-1.949,5.156c-1.487,2.784-4.389,5.647-4.084,4.77"
      + "c0.307-0.876,0.383-2.136,0.079-3.816c-0.3-1.653-1.527-3.857-1.527-3.857s-0.379,3.775-4.125,8.593"
      + "c-4.696,6.031-10.311,9.681-7.559,5.687c1.948-2.826,3.282-6.834,3.436-11.149c0.21-5.957-1.78-9.694-1.78-9.694"
      + "s0.203,2.912-5.704,10.038c-5.905,7.129-17.099,9.516-13.517,6.948c5.956-4.267,9.814-10.652,11.683-15.766"
      + "c2.693-7.358,1.833-11.103,1.833-11.103s-1.119,2.648-5.598,5.4c-5.54,3.396-12.27,3.881-10.387,2.954"
      + "c1.552-0.765,4.185-1.952,8.756-8.76c4.1-6.107,4.074-11.049,4.074-11.049s-1.475,1.122-2.498,1.581"
      + "c-5.253,2.362-9.518,0.914-8.652,0.866c0.868-0.056,3.667-0.765,6.922-4.226c2.347-2.49,3.106-6.869,3.106-6.869"
      + "s-1.835,0.558-7.332-1.072c-5.519-1.635-6.058-4.733-5.192-3.921c0.867,0.815,3.359,1.12,9.061,0.97"
      + "c3.974-0.107,6.059-2.039,6.059-2.039s-3.855-1.833-5.842-4.086c-4.614-5.235-3.397-5.537-2.062-5.036"
      + "c1.521,0.559,4.696,0.418,4.696,0.418h11.683c4.514,0,8.172,2.494,8.172,5.577c0,1.427-0.791,2.731-2.088,3.72"
      + "c-3.166,2.402-5.86,5.025-5.86,8.656c0,5.696,5.744,10.309,12.829,10.309c5.497,0,4.979-3.589,5.403-5.911"
      + "c0.906-4.954,4.549-6.12,7.737-7.942c2.047-1.17-1.861-4.635-3.855-5.36c-1.678-0.612-3.602-2.177-3.971-6.032"
      + "c-0.331-3.489-3.208-2.519-3.208-2.519c0-1.426,2.293-3.935,5.944-3.6c3.042,0.276,6.719,4.477,10.796,6.309"
      + "c4.071,1.832,4.273,2.04,7.939,1.427c3.667-0.609-2.853,3.26-4.278,3.055c-1.423-0.201,0.05,5.616-1.159,6.44"
      + "c-0.838,0.573-2.712-1.348-2.712,5.781c0,7.125,8.688,8.353,8.688,8.353c7.083,0,12.829-4.613,12.829-10.309"
      + "c0-3.63-2.694-6.254-5.863-8.656c-1.298-0.988-2.088-2.292-2.088-3.72c0-3.083,3.66-5.577,8.173-5.577h11.684"
      + "c0,0,3.177,0.141,4.695-0.418c1.337-0.5,2.552-0.199-2.063,5.036c-1.984,2.253-5.839,4.086-5.839,4.086s2.084,1.931,6.057,2.039"
      + "c5.704,0.149,8.195-0.155,9.065-0.97c0.862-0.812,0.32,2.287-5.195,3.921c-5.499,1.63-7.334,1.072-7.334,1.072"
      + "S109.409,78.045,111.755,80.536";

upro.res.eve.IconData.Minmatar = "M112.727,14.19L82.745,69.283c-5.087-4.35-11.397-6.926-18.234-6.926c-16.848,0-30.507,15.643-30.507,34.94"
      + "c0,13.53,7.927,24.501,17.206,30.84c8.531,5.829,18.532,8.477,29.511,8.477c33.695,0,61.012-28.25,61.012-63.098"
      + "C141.732,49.158,130.313,27.568,112.727,14.19 M65.053,54.267c5.418,0,10.604,1.058,15.388,2.991l25.272-47.77"
      + "C95.424,3.448,83.533,0,70.865,0c-8.779,0-17.184,1.661-24.943,4.689l16.473,49.673C63.275,54.305,64.16,54.267,65.053,54.267"
      + "M53.351,55.982L37.629,8.576C23.297,16.487,11.891,29.351,5.541,44.971l29.92,21.715C40.469,61.717,46.576,57.998,53.351,55.982"
      + "M29.668,73.721L2.524,54.02C0.881,60.229,0,66.765,0,73.516c0,7.693,1.145,15.108,3.258,22.078h18.574"
      + "C22.662,87.491,25.446,80.021,29.668,73.721 M21.732,104.688H6.68c7.765,17.178,21.738,30.734,38.932,37.539"
      + "C32.411,135.173,23.048,121.157,21.732,104.688";

// TODO: maybe find a smaller one for 'pirates'
upro.res.eve.IconData.Guristas = "M115.156,165.424c4.61-4.099,4.61-2.689,6.403-4.482s5.507-2.689,6.66-4.227c1.153-1.536,1.024-2.305,1.921-2.305"
      + "s1.537,0.769,2.689-0.513c1.153-1.28,2.562-2.689,2.562-4.098c0-1.409,0.512-5.508,0.512-6.532s1.793-8.58,1.793-10.63"
      + "c0-2.049-0.256-5.25-1.409-5.25c-1.153,0-3.202,0.256-3.33,1.152c-0.128,0.896-2.049,6.147-2.305,8.324"
      + "c-0.256,2.177-1.409,4.867-2.945,5.507c-1.537,0.641-5.251,0-6.788-0.256c-1.537-0.256-4.227,0.256-4.611,1.537"
      + "c-0.384,1.28,0.512,2.049,0.384,2.945c-0.128,0.896-1.537,3.714-1.921,5.251c-0.384,1.536-0.896,3.714-0.896,4.866"
      + "c0,1.153,0.256,4.227-2.049,4.354c-2.305,0.128-2.817-3.073-2.817-4.098c0-1.025-0.769-2.946-2.049-2.946"
      + "c-1.281,0-3.202,1.921-3.971,2.306c-0.769,0.384-3.074,0.769-3.074,1.409c0,0.64,0.256,1.792-0.384,1.664"
      + "c-0.64-0.128-2.548-5.46-4.61-6.147c-0.384-0.128,0.769,9.478-1.195,7.771c-1.455-1.266,0.171-4.867-1.238-4.952"
      + "c-1.023-0.063-2.178,0.64-3.586,0.64c-1.409,0-2.562-1.024-3.202-1.024c-0.641,0-2.049,0.385-2.818,0.128"
      + "c-0.768-0.256-1.793-1.28-2.433-1.152c-0.641,0.128-1.025,0.256-1.665-0.256c-0.64-0.513-0.512-2.178-1.024-1.409"
      + "s-1.281,1.793-1.281,2.689s-0.128,2.05-0.512,2.817c-0.384,0.769-2.434,3.714-2.434,4.61s-1.409,2.178-1.281,3.074"
      + "s0.896,1.024,0.896,1.665c0,0.64-0.512,1.921,0.128,2.562c0.64,0.64,1.921,1.536,2.817,1.793c0.896,0.256,1.921-0.513,2.433,0.128"
      + "c0.513,0.641,1.665,1.024,4.482,3.586c2.818,2.562,3.714,3.97,4.739,4.738c1.024,0.769,2.689,0.128,3.202,0.769"
      + "s1.665,0.896,2.049,0.896s1.665-0.513,2.433-0.513s3.97,1.024,4.482,0.513c0.513-0.513,4.098-4.995,5.251-6.66"
      + "c1.153-1.664,4.354-4.482,5.379-5.25C111.57,169.651,115.156,165.424,115.156,165.424z"
      + "M141.708,99.553c-0.17-3.67-0.825-6.145-1.793-7.342c-1.793-2.22-8.709-8.965-12.039-11.441"
      + "c-3.33-2.476-9.135-6.916-10.331-6.831c-1.195,0.086-3.072,2.22-2.988,3.501c0.085,1.28,0.683,1.708,0.085,2.476"
      + "c-0.598,0.768-3.416,2.988-3.074,1.792c0.341-1.195,2.049-1.622,2.22-2.903c0.17-1.281,0.598-8.708,1.195-10.928"
      + "c0.599-2.22,1.452-9.904,2.049-14.088c0.597-4.184,1.879-14.6,2.049-18.784c0.171-4.183,0.342-11.355-0.17-14.514"
      + "s-3.416-10.501-6.746-13.832c-3.33-3.33-11.44-6.745-16.393-6.66c-4.952,0.085-21.602,2.989-26.382,5.55"
      + "c-4.781,2.562-22.882,8.965-16.649,9.392s15.966-2.049,19.21-1.963c3.245,0.085,9.136-1.281,12.209,0.256"
      + "c3.074,1.537,5.721,3.245,6.062,5.977c0.341,2.732,2.647,11.014,3.927,18.357c1.281,7.342,5.636,36.115,4.696,36.201"
      + "c-0.939,0.085-8.453,0.427-11.014,1.281c-2.562,0.854-11.44,5.123-14.344,9.477c-2.903,4.354-6.403,11.441-6.831,13.832"
      + "c-0.427,2.391-0.784,5.263-1.451,7.599c-1.025,3.586-5.236,6.082-4.867,6.574c1.024,1.366,0.704,1.857,0.96,3.138"
      + "c0.256,1.281,1.473,3.266,2.817,4.419c1.345,1.152,4.291,5.059,4.354,4.354c0.064-0.704-1.281-3.266-1.729-4.29"
      + "s-2.497-4.098-2.241-4.482c0.256-0.384-0.896-1.237-0.704-0.533c0.192,0.704,1.024,3.073,0.64,2.348"
      + "c-0.445-0.841-1.387-3.18-0.939-2.988c0.448,0.192,2.284,0.277,2.668,0.726s3.458,3.01,4.674,3.586s3.074,0.896,3.714,1.473"
      + "c0.64,0.576,3.437,1.516,2.732,2.541c-0.705,1.024-3.564,0.276-5.102,1.493c-1.537,1.217-2.604,2.711-3.564,2.903"
      + "c-0.961,0.192-3.957,2.313-3.928,3.82c0.043,2.242,2.049,5.06,3.586,6.725c1.028,1.113,3.65,3.905,2.946,2.688"
      + "s-1.857-2.882-2.498-3.714c-0.64-0.833-1.344-1.217-0.768-1.921c0.576-0.705,5.123-2.625,5.379-1.537"
      + "c0.256,1.089,0.576,2.369,0.64,4.162s0.128,4.931,0.256,6.852s-0.064,3.33,0.256,3.906c0.32,0.576,1.152,0.769,1.985,0.769"
      + "s1.088,0.128,1.088-0.192s0.256-0.832,0.705-0.832s0.896,1.665,1.024,1.985c0.128,0.319,1.473,0.256,2.177,0.256"
      + "s1.665,0,1.857-0.192c0.192-0.191,0.32-0.576,1.024-0.512c0.705,0.063,0.577,0.576,0.896,0.896c0.32,0.32,2.455,0.17,3.181,0.148"
      + "c2.306-0.066,3.671,0.257,3.671-0.341s-0.427-3.244,0.341-3.244c0.769,0,2.477-0.769,3.159-0.342"
      + "c0.683,0.427,1.537,1.792,2.049,2.902s1.556,4.558,2.049,4.014c1.622-1.793,1.366-6.063,2.22-6.745c0,0,0.956-0.766,1.793-0.598"
      + "c2.988,0.598,3.03,2.817,3.799,2.817c0,0,3.581,0.008,4.141-0.854c0.555-0.854,2.348-5.721,1.879-5.807"
      + "c-0.939-0.172-3.245,0-3.757,0.769c-0.512,0.769-3.095,2.194-3.329,1.708c-0.556-1.152,1.963-3.629,1.066-3.629"
      + "c0,0-2.774-2.049-4.183-3.244s-5.892-4.226-4.141-4.226s3.245,0.981,3.757,1.622c0.512,0.64,2.476,2.434,3.373,1.921"
      + "s2.519-3.501,3.33-3.287c0.811,0.214,0.982,1.109,2.091,1.109c1.111,0,1.281-0.938,2.135-0.938c0.854,0,7.513,0.341,8.879-0.769"
      + "c1.366-1.11,2.732-2.135,2.732-2.562s1.537-1.452,1.878-0.598c0.342,0.854,0.683,0.684,0.171,1.708s-1.556,4.873-3.586,5.549"
      + "c-2.049,0.683-3.586,1.281-5.208,1.366c0,0-3.757,0.939-2.477,0.939s2.646-0.341,4.013-0.427c1.366-0.086,4.696-0.342,5.464-1.024"
      + "c0.768-0.684,1.792-3.672,2.39-4.782c0.598-1.109,1.647-2.736,1.452-3.756c-0.427-2.22-2.39-4.439-2.39-5.806"
      + "s5.643-6.451,7.769-8.453c1.452-1.366,3.928-4.098,4.439-5.464C139.915,108.69,141.978,105.356,141.708,99.553z M82.69,131.934"
      + "c0.064,1.089,0,0.513,0,1.089s-0.649,1.487-0.769,2.369c-0.32,2.369-0.448,2.369-2.241,2.562"
      + "c-0.989,0.105-2.305-2.241-2.433-2.882c-0.128-0.64,0.672-0.926,0.832-2.049c0.256-1.793,1.409-2.689,1.857-3.33"
      + "s-0.448-0.704-0.512-1.408c-0.064-0.705,0.769-0.769,1.729-0.705c0.961,0.064,1.601,2.497,1.921,2.946"
      + "C83.394,130.973,82.618,130.719,82.69,131.934z M95.625,12.766c-3.138-3.778-9.733-3.138-15.497-3.138s15.561-1.921,18.954-1.729"
      + "c3.394,0.192,5.571,4.547,10.246,10.758c4.674,6.211,3.202,12.231,2.945,18.506s-1.665,28.111-1.985,32.273"
      + "s-0.448,10.758-1.665,11.398s-6.083-4.034-6.468-4.738c-0.384-0.705-0.646-8.138-1.216-13.96"
      + "c-0.641-6.531-0.577-5.314-0.961-9.989c-0.384-4.674,1.793,6.468,2.177,8.837s1.665,11.014,2.306,12.679"
      + "c0.64,1.665,1.409,0.705,2.561-1.665c1.153-2.37,0.769-13.64,0.705-24.206c-0.064-10.565-0.32-19.851-0.32-20.363"
      + "s-1.601-0.448-3.394-2.689C102.22,22.499,98.763,16.544,95.625,12.766z M92.872,136.417c-0.449,0.32-0.449,2.178-1.473,2.625"
      + "c-1.024,0.449-1.985,0.129-2.562-0.447c-0.576-0.577-1.601-1.217-2.625-1.922c-1.025-0.704-0.738-2.183-0.577-4.61"
      + "c0.064-0.96-0.128-1.985-0.576-2.817s-0.576-1.601,0-2.177s1.665,0.64,2.177,1.152c0.512,0.513,3.266,3.649,4.931,5.571"
      + "C93.832,135.712,93.32,136.096,92.872,136.417z M114.729,129.607c-0.513,0-6.489,0-7.001-0.17"
      + "c-0.512-0.171-3.415-0.171-4.439-0.171c-1.025,0-2.049-1.024-2.903-2.22c-0.854-1.196-3.928-2.22-6.66-3.074"
      + "c-2.732-0.854-4.952-3.073-5.635-3.244c-0.683-0.171,1.537-1.195,2.903-2.049c1.366-0.854,4.346-3.176,7.684-6.147"
      + "c3.309-2.945,1.494-1.28,2.583-2.753c1.088-1.474,1.985-3.074,3.522-4.995s4.354-4.419,6.212-4.419"
      + "c1.857,0,2.753,2.434,3.585,3.522c0.833,1.089,1.537,3.201,2.306,4.482c0.769,1.28-1.857-2.241-2.369-3.202"
      + "c-0.513-0.96-2.049-2.561-3.971-2.817c-1.921-0.256-3.97,2.049-4.695,2.839c-0.673,0.733,3.927,0.939,5.293,4.781"
      + "c0.54,1.518,1.708,3.586,2.391,4.269c0.684,0.684,0.512,4.099,0.512,4.782s0.854-0.171,1.024-1.196"
      + "c0.171-1.024,0.513,1.537,0.513,2.392c0,0.854-1.196,2.219-1.537,3.073c-0.341,0.854-1.537,4.781-2.562,5.293"
      + "c-1.024,0.513,2.049,0.172,3.244-0.341c1.195-0.513,3.757-4.61,4.269-5.465C119.51,121.923,115.241,129.607,114.729,129.607z"
      + "M72.551,60.109c-2.347-7.895-7.257-17.844-10.501-20.577s-6.489-3.159-8.708-4.61c-2.22-1.451-5.55-3.159-7.001-3.159"
      + "c-1.452,0-7.429,1.11-10.332,1.537c-2.903,0.427-7.854,1.708-11.526,2.647c-3.671,0.939-5.977,2.647-7.343,3.074"
      + "s-4.61,0.769-4.952,1.11c-0.341,0.341-1.195,1.281-2.134,1.708c-0.939,0.427-7.94,2.647-8.965,3.842s-1.708,4.184-0.256,5.038"
      + "c1.452,0.854,4.781,0.256,6.745-0.256s5.123-0.769,9.648-1.024c4.525-0.256,9.904-0.171,12.38,0.085"
      + "c2.476,0.256,7.855,0.342,11.27,1.879c3.416,1.537,7.428,5.806,10.502,9.904s7.77,9.05,10.587,12.209"
      + "c2.817,3.159,10.7,10.108,10.587,8.538c-0.085-1.195-3.897-5.065-4.696-5.891c-2.476-2.562-4.696-6.233-3.586-5.294"
      + "c1.11,0.939,3.671,3.843,4.525,4.44c0.854,0.598,2.22,0.171,1.195-1.622c-1.025-1.793-4.269-10.587-6.147-15.027"
      + "s-3.33-9.05-4.781-10.843s-3.671-4.184-4.354-3.415c-0.683,0.769-3.756,3.842-3.756,2.817s0-3.244-1.537-4.184"
      + "c-1.537-0.939-2.476-1.281-3.671-1.024s-2.305,0.341-2.903,1.195s-2.562,0.512-1.708,1.451c0.854,0.939,2.135,2.305,0.427,2.135"
      + "c-1.708-0.171-2.817-1.11-3.842-1.195c-1.025-0.085-1.878-0.769-2.562-1.024c-0.683-0.256-0.683,0.683-2.049,0.683"
      + "s-1.622-0.598-2.22-0.598s-0.769,0.769-1.708,0.769c-0.939,0-1.024-1.024-1.793-1.024s-1.452,0.939-3.074,1.11"
      + "s-5.72,0.256-7.001,1.11c-1.281,0.854-9.904,1.281-4.184-0.854c5.72-2.135,8.794-4.184,11.611-5.038s8.794-3.5,10.929-3.757"
      + "c2.135-0.256,6.403-1.366,8.879-0.683s7.599,3.33,9.989,4.611c2.391,1.281,6.489,3.927,9.819,12.039"
      + "c3.33,8.111,7.599,19.979,8.368,21.857c0.768,1.878,1.792,4.696,2.732,4.44c0.939-0.256,2.22-1.281,2.22-2.732"
      + "S74.429,66.427,72.551,60.109z";

/**
 * The menu namespace has resources for menus
 */
upro.res.menu = {};

upro.res.menu.IconData = {};

upro.res.menu.IconData.Yes =
   "M11.941,25.754L0,13.812L5.695,8.117L11.941,14.363L26.305,0L32,5.695L11.941,25.754z";

upro.res.menu.IconData.No =
   "M28,22.398L19.594,14L28,5.602L22.398,0L14,8.402L5.598,0L0,5.602L8.398,14L0,22.398L5.598,28L14,19.598L22.398,28z";

upro.res.menu.IconData.Left =
   "M15.984,32l5.672-5.672c0,0-3.18-3.18-6.312-6.312H32v-8.023H15.344l6.312-6.32L15.984,0L0,16L15.984,32z";

upro.res.menu.IconData.Right =
   "M16.016,0l-5.668,5.672c0,0,3.18,3.18,6.312,6.312H0v8.023h16.66l-6.316,6.319l5.672,5.672L32,16L16.016,0z";

upro.res.menu.IconData.Up =
   "M0,15.984l5.672,5.667c0,0,3.18-3.178,6.312-6.315v16.669h8.023V15.336l6.32,6.325L32,15.984L16,0L0,15.984z";

upro.res.menu.IconData.Down =
   "M32,16.016l-5.672-5.664c0,0-3.18,3.18-6.312,6.312V0h-8.023v16.664l-6.32-6.32L0,16.016L16,32L32,16.016z";

upro.res.menu.IconData.Minus =
   "M0,0L32,0L32,8L0,8z";

upro.res.menu.IconData.Plus =
   "M32,12L20,12L20,0L12,0L12,12L0,12L0,20L12,20L12,32L20,32L20,20L32,20z";

upro.res.menu.IconData.Denied =
   "M16,0C7.164,0,0,7.164,0,16s7.164,16,16,16s16-7.164,16-16S24.836,0,16,0z M16,4" +
   "c2.59,0,4.973,0.844,6.934,2.242L6.238,22.93C4.84,20.969,4,18.586,4,16C4,9.383,9.383,4,16,4z M16,28" +
   "c-2.59,0-4.973-0.844-6.934-2.242L25.762,9.07C27.16,11.031,28,13.414,28,16C28,22.617,22.617,28,16,28z";

// TODO: better one
// Source: www.picol.org
upro.res.menu.IconData.List =
   "m 8.25,0.5 v 2 h 20 v -2 h -20 z m 0,12 h 20 v -2 h -20 v 2 z m 0,10 h 20 v -2 h -20 v 2 z m -8,4 " +
   "h 6 v -6 h -6 v 6 z m 0,-10 h 6 v -6 h -6 v 6 z m 0,-10 h 6 v -6 h -6 v 6 z";

upro.res.menu.IconData.Power =
   "M 221.34821,488.74825 C 99.10258,488.74826 -0.1205327,389.52341 -0.1205357,267.2795 -0.1205367,206.39399 " +
   "24.592184,151.33727 64.410714,111.31075 l 0.1875,0.1875 c 8.04967,-11.1131 21.05123,-18.406266 " +
   "35.812496,-18.406246 24.44877,0 44.3125,19.832356 44.3125,44.281246 0,14.99209 -7.49714,28.20383 " +
   "-18.90625,36.21875 l 0.15625,0.15625 c -23.9259,24.09666 -38.906246,56.9975 -38.906246,93.53125 0,73.70089 " +
   "60.110436,133.53125 134.156246,133.53125 74.04582,1e-5 134.125,-59.83035 134.125,-133.53125 -10e-6,-33.34259 " +
   "-12.54037,-63.57981 -32.90625,-86.9375 -12.11468,-7.90659 -20.18749,-21.52681 -20.1875,-37.0625 0,-24.44889 " +
   "19.86373,-44.312517 44.3125,-44.312497 11.95254,0 22.74833,4.826587 30.71875,12.531247 l 0.625,-0.625 " +
   "c 40.05216,40.05678 64.87499,95.31901 64.875,156.40625 3e-5,122.2439 -99.19186,221.46876 -221.4375,221.46875 z " +
   "m -0.0312,-219.9375 c -24.5374,0 -44.28125,-20.10236 -44.28125,-45.09375 l 0,-178.656246 c 0,-24.99139 " +
   "19.74384,-45.09374939 44.28125,-45.09374939 24.5374,0 44.31251,20.10232939 44.3125,45.09374939 l 0,178.656246 " +
   "c 0,24.99139 -19.77511,45.09375 -44.3125,45.09375 z";

// TODO: better one
upro.res.menu.IconData.SolarSystem =
   "M16,8c-4.422,0-8,3.582-8,8s3.578,8,8,8c4.414,0,8-3.582,8-8S20.414,8,16,8L16,8z" +
   "M18,2c0,1.105-0.898,2-2,2c-1.109,0-2-0.895-2-2s0.891-2,2-2C17.102,0,18,0.895,18,2z" +
   "M2,13.998c1.102,0,2,0.896,2,2c0,1.108-0.898,2-2,2c-1.109,0-2-0.893-2-2C0,14.893,0.891,13.998,2,13.998z" +
   "M14,29.998c0-1.105,0.891-2,2-2c1.109,0.002,2,0.895,2,2C18,31.105,17.109,32,16,32S14,31.105,14,29.998z" +
   "M24.594,27.414c-0.781-0.781-0.781-2.045,0-2.828c0.781-0.781,2.047-0.781,2.828,0c0.789,0.783,0.789,2.047,0,2.828C26.641,28.197,25.375,28.197,24.594,27.414z" +
   "M29.995,17.998C28.898,17.998,28,17.104,28,16c0-1.109,0.898-2,2.008-2c1.097,0,2,0.893,1.987,1.998C32.008,17.105,31.104,18,29.995,17.998z" +
   "M27.422,7.417c-0.781,0.779-2.047,0.779-2.828,0c-0.781-0.786-0.781-2.047,0-2.831c0.781-0.779,2.047-0.781,2.828,0.002C28.211,5.37,28.211,6.637,27.422,7.417z";

upro.res.menu.IconData.Delete = upro.res.menu.IconData.No;

// TODO: better one
// Source: www.picol.org
upro.res.menu.IconData.Routing =
   "M28,18.07V2c0,0,0-1-1-1c-0.717,0-0.917,0.51-0.975,0.801C22.817,1.341,21.738,3,19,3c-3,0-5-1.013-5-1.013v7.821" +
   "c0,0,2,1.191,5,1.191c2.73,0,3.812-1.65,7-1.193v8.263c-1.723,0.224-3,0.999-3,1.93c0,0.164,0.051,0.32,0.125,0.473l-11.424,4.569" +
   "C10.458,24.396,8.812,24,7,24c-3.867,0-7,1.791-7,4s3.133,4,7,4s7-1.791,7-4c0-0.536-0.188-1.047-0.522-1.514l11.753-4.701" +
   "C25.766,21.918,26.361,22,27,22c2.21,0,4-0.896,4-2C31,19.069,29.723,18.294,28,18.07z";

upro.res.menu.IconData.Checkpoint =
   "M17.07,2.93c-3.906-3.906-10.234-3.906-14.141,0c-3.906,3.904-3.906,10.237,0,14.141" +
   "C2.93,17.07,10,24,10,32c0-8,7.07-14.93,7.07-14.93C20.977,13.167,20.977,6.833,17.07,2.93z M10,14.005c-2.211,0-4-1.789-4-4" +
   "s1.789-4,4-4s4,1.789,4,4S12.211,14.005,10,14.005z";

upro.res.menu.IconData.Waypoint =
   "M10,4c1.602,0,3.109,0.625,4.242,1.76C15.375,6.891,16,8.398,16,10s-0.625,3.109-1.734,4.213" +
   "c-0.164,0.166-2.234,2.224-4.266,5.441c-2.023-3.211-4.086-5.261-4.242-5.415C4.625,13.109,4,11.602,4,10s0.625-3.109,1.758-4.242" +
   "S8.398,4,10,4 M10,0C7.438,0,4.883,0.977,2.93,2.93c-3.906,3.904-3.906,10.237,0,14.141C2.93,17.07,10,24,10,32" +
   "c0-8,7.07-14.93,7.07-14.93c3.906-3.904,3.906-10.237,0-14.141C15.117,0.977,12.558,0,10,0L10,0z" +
   "M12,10c0,1.105-0.896,2-2,2c-1.109,0-2-0.895-2-2s0.891-2,2-2C11.104,8,12,8.895,12,10z";

upro.res.menu.IconData.WormholeIn =
   "M15.067,2.25c-5.979,0-11.035,3.91-12.778,9.309h3.213c1.602-3.705,5.271-6.301,9.565-6.309" +
   "c5.764,0.01,10.428,4.674,10.437,10.437c-0.009,5.764-4.673,10.428-10.437,10.438c-4.294-0.007-7.964-2.605-9.566-6.311" +
   "H2.289c1.744,5.399,6.799,9.31,12.779,9.312c7.419-0.002,13.437-6.016,13.438-13.438C28.504,8.265,22.486,2.252,15.067,2.25z" +
   "M10.918,19.813l7.15-4.126l-7.15-4.129v2.297H-0.057v3.661h10.975V19.813z";

upro.res.menu.IconData.WormholeOut =
   "m 22.474483,18.679126 c -1.805,3.113 -5.163,5.212 -9.023,5.219 -5.766,-0.01 -10.427,-4.672 -10.438,-10.435 " +
   "0.011,-5.7659998 4.672,-10.4269998 10.438,-10.4379998 3.859,0.007 7.216,2.105 9.022,5.218 l 3.962,2.2839998 " +
   "0.143,0.082 c -1.311,-6.0499998 -6.686,-10.58399976 -13.127,-10.58599976 -7.423,0.002 -13.43799997,6.01699996 " +
   "-13.43899997,13.43999976 0.002,7.42 6.01699997,13.435 13.43899997,13.437 6.442,-0.002 11.819,-4.538 " +
   "13.127,-10.589 l -0.141,0.081 -3.963,2.287 z m 4.314,-5.216 -7.15,-4.1289998 v 2.2969998 h -10.975 " +
   "v 3.661 h 10.975 v 2.297 l 7.15,-4.126 z";

upro.res.menu.IconData.View =
   "M16,0C7.164,0,0,11.844,0,11.844S7.164,24,16,24s16-12.156,16-12.156S24.836,0,16,0z M16,20c-4.418,0-8-3.583-8-8" +
   "s3.582-8,8-8s8,3.583,8,8S20.418,20,16,20z M16,8.016A4,4 0 1,0 16.01,8.016z";

upro.res.menu.IconData.Galaxy =
   "M21.174,13.98l5.689-9.664C24.008,1.659,20.209,0,16,0c-0.999,0-1.965,0.12-2.913,0.293L21.174,13.98z" +
   "M19.951,20h11.482C31.768,18.715,32,17.391,32,16c0-3.873-1.432-7.377-3.723-10.145L19.951,20z" +
   "M16.5,10l-5.408-9.152C6.592,2.307,2.953,5.646,1.188,10H16.5z" +
   "M15.633,22l5.393,9.115c4.447-1.48,8.037-4.799,9.787-9.115H15.633z" +
   "M12.105,12H0.566C0.233,13.285,0,14.609,0,16c0,3.891,1.445,7.41,3.756,10.186L12.105,12z" +
   "M10.918,17.961l-5.745,9.756C8.027,30.354,11.809,32,16,32c1.041,0,2.055-0.117,3.041-0.307L10.918,17.961z";

upro.res.menu.IconData.JumpCorridor =
   "M28,24c-0.974,0-1.833,0.391-2.523,0.964l-6.102-4.35C19.766,19.817,20,18.942,20,18c0-1.292-0.422-2.489-1.117-3.464" +
   "l7.133-7.138C26.609,7.745,27.261,8,28,8c2.211,0,4-1.789,4-4s-1.789-4-4-4s-4,1.789-4,4c0,0.739,0.25,1.391,0.602,1.984" +
   "l-7.133,7.136C16.484,12.417,15.297,12,14,12c-2.289,0-4.258,1.302-5.271,3.192l-4.815-1.609C3.719,12.683,2.953,12,2,12" +
   "c-1.109,0-2,0.896-2,2s0.891,2,2,2c0.5,0,0.953-0.203,1.305-0.511l4.789,1.597C8.047,17.386,8,17.688,8,18c0,3.312,2.688,6,6,6" +
   "c1.648,0,3.141-0.667,4.229-1.745l6.06,4.323C24.117,27.023,24,27.495,24,28c0,2.208,1.789,4,4,4s4-1.792,4-4S30.211,24,28,24z";

upro.res.menu.IconData.Bridge =
   "m171.939316,75.986969l0.270569,33.08075l97.171341,0l0.25,-60.847931c-35.989578,0.719788 -48.923935,-3.7547 -59.72081,-10.232819c-10.796875,-6.658081 -18.527039,-22.143738 -43,-31.860931c-8.996277,-3.701721 -22.251953,-6.126038 -32.125,-6.126038c-9.872803,0 -22.161469,2.468292 -30.59375,5.766144c-24.472961,9.717194 -32.203125,25.562744 -43,32.220825c-10.796875,6.478119 -25.202026,10.952606 -61.191666,10.232819l0.009628,60.847931l97.90625,0l-0.021484,-33.08075c2.620087,-17.69873 19.481354,-31.542969 37.266022,-31.183075c18.865448,-0.179932 34.318634,15.102356 36.7789,31.183075z";

upro.res.menu.IconData.Fuel =
   "m 128,0.75 c -8.48242,0 -16.9375,6.13064 -16.9375,15.9375 l -0.1875,315.25 17.4375,0 0.15625,24.9375 " +
   "160.09375,-0.0937 0.125,-24.84375 15,0.125 0,-318.625 C 303.68751,6.64142 299.75087,0.75 292.34375,0.75 " +
   "L 128,0.75 z m 26.78125,34.84375 104.90625,0 c 5.80827,0 10.37501,2.36551 10.375,10.375 l 0,82.875 " +
   "c 0,5.61371 -3.00087,9.6875 -9.40625,9.6875 L 155.0625,138.25 c -6.09827,0 -11.34375,-4.50537 " +
   "-11.34375,-11.0625 l 0.53125,-81.5 c 0,-6.5237 4.51979,-10.09375 10.53125,-10.09375 z m -42.94914,73.51416 " +
   "-16.02161,-0.0949 c -0.10388,65.19305 0.37125,193.85491 0.64277,196.05634 0.5796,4.69931 0.22912,9.56779 " +
   "-0.97746,14.00308 -25.11647,63.27313 -106.38805,34.21172 -94.84854,-27.3567 25.3448,-61.07053 60.88334,-102.39502 " +
   "78.57086,-174.42538 l 1.57455,53.54482 C 64.8545,201.81087 36.77166,256.21167 14.99276,301.68501 " +
   "13.15788,343.66887 63.10162,357.50125 78.74349,312.43723 85.71402,233.55555 78.48141,147.5723 78.35038,65.13983 " +
   "88.5149,34.92256 99.73039,32.03014 111.11247,33.46938";

upro.res.menu.IconData.MinSecurity =
   "M16,18.285 16,0 8,0 8,18.285 4,18.285 12.012,27.428 20,18.285M0,27.428h24v4.572h-24";

upro.res.menu.IconData.MaxSecurity =
   "M 16,13.715 16,32 8,32 8,13.715 4,13.715 12.012,4.572 20,13.715 M 0,4.572 H 24 V 0 H 0";

upro.res.menu.IconData.Higher =
   "m 3.5735,13.3805 6.187,-6.187 6.187,6.187 3.536,-3.536 -9.723,-9.724 -9.726,9.724 z";

upro.res.menu.IconData.Lower =
   "m 3.5735,0.1205 6.187,6.187 6.187,-6.187 3.536,3.536 -9.723,9.724 -9.726,-9.724 z";

upro.res.menu.IconData.JumpGate =
   "m 488.75443,221.34201 c 10e-6,122.24563 -99.22484,221.46875 -221.46875,221.46875 -60.88551,0 -115.94223,-24.71272 " +
   "-155.96875,-64.53125 l 0.1875,-0.1875 c -11.1131,-8.04967 -18.406265,-21.05123 -18.406245,-35.8125 0,-24.44877 " +
   "19.832355,-44.3125 44.281245,-44.3125 14.99209,0 28.20383,7.49714 36.21875,18.90625 l 0.15625,-0.15625 " +
   "c 24.09666,23.9259 56.9975,38.90625 93.53125,38.90625 73.70089,0 133.53125,-60.11044 133.53125,-134.15625 " +
   "10e-6,-74.04582 -59.83035,-134.125007 -133.53125,-134.125007 -33.34259,10e-6 -63.57981,12.54037 " +
   "-86.9375,32.906257 -7.90659,12.11468 -21.52681,20.18749 -37.0625,20.1875 -24.44889,0 -44.312517,-19.86373 " +
   "-44.312497,-44.312507 0,-11.95254 4.826587,-22.748327 12.531247,-30.718747 l -0.625,-0.625 c 40.05678,-40.05216 " +
   "95.31901,-64.87498978 156.40625,-64.87499978 122.2439,-3e-5 221.46876,99.19185678 221.46875,221.43750378 z " +
   "m -219.9375,0.0312 c 0,24.5374 -20.8151,38.3553 -45.09375,44.28125 l -196.656245,48 c -24.2786471,5.92595 " +
   "-27.09374907,-67.74384 -27.09374907,-92.28125 0,-24.5374 2.01706997,-106.0121 26.09374907,-99.3125 l 197.656245,55 " +
   "c 24.07665,6.69959 45.09375,19.77511 45.09375,44.3125 z";

upro.res.menu.IconData.Wormhole =
   "m 488.70418,221.36103 c 10e-6,122.24563 -99.22484,221.46875 -221.46875,221.46875 -60.88551,0 -115.94223,-24.71272 " +
   "-155.96875,-64.53125 l 0.1875,-0.1875 c -11.1131,-8.04967 -18.406265,-21.05123 -18.406245,-35.8125 0,-24.44877 " +
   "19.832355,-44.3125 44.281245,-44.3125 14.99209,0 28.20383,7.49714 36.21875,18.90625 l 0.15625,-0.15625 " +
   "c 24.09666,23.9259 56.9975,38.90625 93.53125,38.90625 73.70089,0 133.53125,-60.11044 133.53125,-134.15625 " +
   "10e-6,-74.04582 -59.83035,-134.125001 -133.53125,-134.125001 -33.34259,1e-5 -63.57981,12.54037 " +
   "-86.9375,32.906251 -7.90659,12.11468 -21.52681,20.18749 -37.0625,20.1875 -24.44889,0 -44.312515,-19.86373 " +
   "-44.312495,-44.312501 0,-11.95254 4.826585,-22.748326 12.531245,-30.718746 l 1.14277,-0.625 c 40.05678,-40.05216 " +
   "93.55124,-64.87498968 154.63848,-64.87499968 122.2439,-3e-5 221.46876,99.19185568 221.46875,221.43749668 z " +
   "m -219.9375,0.0312 c 0,24.5374 -20.10236,44.28125 -45.09375,44.28125 l -178.656245,0 c -24.99139,0 " +
   "-45.09375241,-19.74384 -45.09375241,-44.28125 0,-24.5374 20.10233241,-44.31251 45.09375241,-44.3125 " +
   "l 178.656245,0 c 24.99139,0 45.09375,19.77511 45.09375,44.3125 z";

upro.res.menu.IconData.JumpDrive =
   "M28,14c0-7.729-6.27-14-14-14S0,6.271,0,14C0,8.477,4.477,4,10,4s10,4.477,10,10v2h-4l8,8l8-8h-4V14z";

upro.res.menu.IconData.Hash =
   "M28,12V8h-5.004l1-8h-4l-1,8h-7.998l1-8h-4l-1,8H0v4h6.499L5.5,20H0v4h5l-1,8h4l1-8h7.998l-1,8h4l1-8H28v-4h-6.502 " +
   "l0.998-8H28z M17.498,20H9.5l0.999-8h7.998L17.498,20z";

upro.res.menu.IconData.Capabilities =
   "M9.6,30c0,1.105-0.893,2-2.001,2c-1.105,0-2-0.895-2-2s0.895-2,2-2C8.707,28,9.6,28.894,9.6,30z" +
   "M7.676,25.976c-1.336,0-2.59-0.52-3.535-1.465s-1.465-2.199-1.465-3.535s0.52-2.59,1.465-3.535l6.688-6.688" +
   "C11.586,9.999,12,8.995,12,7.925c0-1.067-0.414-2.072-1.172-2.828c-1.559-1.559-4.097-1.562-5.656,0C4.415,5.854,4,6.858,4,7.925" +
   "H0c0-2.137,0.833-4.148,2.348-5.66c3.02-3.023,8.285-3.02,11.309,0.003C15.168,3.777,16,5.787,16,7.925" +
   "c0,2.137-0.832,4.145-2.344,5.656l-6.688,6.688c-0.388,0.391-0.388,1.023,0,1.414c0.391,0.391,1.023,0.391,1.414,0" +
   "c0.254-0.255,0.293-0.555,0.293-0.708h4c0,1.336-0.52,2.591-1.465,3.536S9.012,25.976,7.676,25.976L7.676,25.976z";

/**
 * The templates namespace contains the language specific texts
 * Templates are identified using a tag, based on the IETF language tag system
 * See: http://en.wikipedia.org/wiki/IETF_language_tag
 *
 * Templates can be specified in two ways:
 * a) language generic ones, these are registered with the basic code
 *    e.g.: upro.res.text.templates["en"] = { ... }
 *    These templates must have ALL text entries filled.
 * b) specific ones that are based on a generic language, using one sub-tag:
 *    e.g.: upro.res.text.templates["en-US"] = { ... }
 *    These templates may provide less than needed and only overwrite any specifics
 *
 * A template is a map of string/string values. The "en" template is the primary
 * one and also contains comments on what the text is about. The key is of course
 * not seen by the user and the same across all templates.
 */
upro.res.text.templates = {};

/**
 * English texts
 */
upro.res.text.templates["en"] =
{
   /** General text for anything that is turned 'on' */
   "general.on": "On",
   /** General text for anything that is turned 'off' */
   "general.off": "Off",

   /** Label for routing menu */
   "routing.menuLabel": "Routing",
   /** Command for clearing the route */
   "routing.clearRoute": "Clear Route",
   /** Label for routing capabilities menu */
   "routing.capabilities.menuLabel": "Capabilities",
   /** Label for routing rules menu */
   "routing.rules.menuLabel": "Routing Rules",
   /** Toggle rule on/off; 0: rule menu label, 1: on/off */
   "routing.rules.toggle": "Turn {0} {1}",
   /** Increase priority of the routing rule */
   "routing.rules.up": "Increase Priority",
   /** Decrease priority of the routing rule */
   "routing.rules.down": "Decrease Priority",

   /** Menu label for MinSecurity */
   "routing.rules.rule[MinSecurity].menuLabel": "Minimum Security",
   /** tip for MinSecurity at limit */
   "routing.rules.rule[MinSecurity].paramLimit": "Minimum Security at {0}",
   /** tip for settable MinSecurity  */
   "routing.rules.rule[MinSecurity].paramSet": "Minimum Security at {0} - Set to {1}",

   /** Menu label for MaxSecurity */
   "routing.rules.rule[MaxSecurity].menuLabel": "Maximum Security",
   /** tip for MaxSecurity at limit */
   "routing.rules.rule[MaxSecurity].paramLimit": "Use Security below {0}",
   /** tip for settable MaxSecurity  */
   "routing.rules.rule[MaxSecurity].paramSet": "Use Security below {0} - Set to {1}",

   /** Menu label for Jumps */
   "routing.rules.rule[Jumps].menuLabel": "Jump Count",
   /** tip for Jumps at limit */
   "routing.rules.rule[Jumps].paramLimit": "Jump Count Margin at {0}",
   /** tip for settable Jumps  */
   "routing.rules.rule[Jumps].paramSet": "Jump Count Margin at {0} - Set to {1}",

   /** Menu label for JumpFuel */
   "routing.rules.rule[JumpFuel].menuLabel": "Jump Fuel (Distance)",
   /** tip for JumpFuel at limit */
   "routing.rules.rule[JumpFuel].paramLimit": "Distance Margin at {0}ly",
   /** tip for settable JumpFuel  */
   "routing.rules.rule[JumpFuel].paramSet": "Distance Margin at {0}ly - Set to {1}ly",


   /** Toggling of jump gate capability */
   "routing.caps.jumpGates.toggle": "Turn Jump Gate Capability {0}",

   /** jump drive menu label */
   "routing.caps.jumpDrive.menuLabel": "Jump Drive",
   /** Toggling of jump drive capability */
   "routing.caps.jumpDrive.toggle": "Turn Jump Drive Capability {0}",
   /** Jump drive range tooltip */
   "routing.caps.jumpDrive.rangeLimit": "Jump Range at {0}ly",
   /** Jump drive range tooltip */
   "routing.caps.jumpDrive.rangeSet": "Jump Range at {0}ly - Set to {1}ly",


   /** Menu label for jump corridor control */
   "corridor.menuLabel": "Jump Corridors",
   /** Menu label for specifying the exit system */
   "corridor.exit": "Set Exit",
   /** Menu label for specifying a wormhole entry */
   "corridor.entry.wormhole": "Wormhole Entry",
   /** Menu label for specifying a jump bridge entry */
   "corridor.entry.jumpBridge": "Jump Bridge Entry",

   /** Add the given solar system as a checkpoint */
   "solarSystem.routing.addCheckpoint": "Add as Checkpoint",
   /** Add the given solar system as a waypoint */
   "solarSystem.routing.addWaypoint": "Add as Waypoint",
   /** Toggle the ignore status of given solar system */
   "solarSystem.routing.toggleIgnore": "Ignore Solar System",
   /** Remove the solar system from the route */
   "solarSystem.routing.remove": "Remove from Route"
};

