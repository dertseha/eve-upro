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
