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
