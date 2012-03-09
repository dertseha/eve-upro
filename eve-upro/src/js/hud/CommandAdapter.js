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
