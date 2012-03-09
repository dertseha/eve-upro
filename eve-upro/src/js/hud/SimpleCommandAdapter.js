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
