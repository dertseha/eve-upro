/**
 * A listener to keyboard events to forward it to a handler in a unified manner.
 */
upro.sys.KeyboardListener = Class.create(
{
   /**
    * Initializes the listener
    * 
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
      this.isObserving = false;
      this.startObserving();
   },

   /**
    * Unlinks all references to handlers - unregisters them
    */
   destroy: function()
   {
      this.stopObserving();
   },

   /**
    * Starts observing the keyboard events
    */
   startObserving: function()
   {
      if (!this.isObserving)
      {
         this.isObserving = true;
         for ( var name in this.boundHandler)
         {
            Element.observe(this.context, name, this.boundHandler[name]);
         }
      }
   },

   /**
    * Stops observing the keyboard events
    */
   stopObserving: function()
   {
      if (this.isObserving)
      {
         for ( var name in this.boundHandler)
         {
            Element.stopObserving(this.context, name, this.boundHandler[name]);
         }
         this.isObserving = false;
      }
   },

   /**
    * Returns true for events/keys that should be stopped. This function primarily looks for actions that somehow affect
    * the content of the view (application).
    * 
    * @param keyCode the determined keyCode
    * @param event event this is called in
    * @return true if the event should be filtered
    */
   shouldStopEvent: function(keyCode, event)
   {
      var rCode = false;

      if ((keyCode == 82) && event.ctrlKey && !event.shiftKey)
      { // Ctrl+R (without shift) -- reload
         rCode = true;
      }
      else if (keyCode == 116)
      { // F5 -- reload
         rCode = true;
      }
      else if (keyCode == 118)
      { // F7 -- caret browsing
         rCode = true;
      }
      else if ((keyCode == 65) && event.ctrlKey)
      { // Ctrl+A -- select all
         rCode = true;
      }
      else if ((keyCode == 70) && event.ctrlKey)
      { // Ctrl+F -- search
         rCode = true;
      }
      else if ((keyCode == 83) && event.ctrlKey)
      { // Ctrl+S -- save
         rCode = true;
      }
      else if (keyCode == Event.KEY_TAB)
      { // TAB -- don't try to switch focus
         rCode = true;
      }
      else if (keyCode == Event.KEY_BACKSPACE)
      { // Backspace -- go back
         rCode = true;
      }

      return rCode;
   },

   /**
    * Event Handler for keydown
    * 
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
    * 
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
    * 
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
