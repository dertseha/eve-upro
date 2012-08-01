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
