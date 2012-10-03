
TestHandler = Class.create(upro.sys.PointerHandler,
{
   initialize: function()
   {

   },

   stateToString: function(position, buttonStates, extra)
   {
      return "Position: " + position.x + "." + position.y +
         " Buttons: [" + buttonStates[0] + ", " + buttonStates[1] + ", " + buttonStates[2] + "]" +
         (extra ? (" Extra: [" + extra[0] + ", " + extra[1] + ", " + extra[2] + "]") : "");
   },

   onDown: function(position, buttonStates, changeMask)
   {
      hudSystem.debugMessage("Down: " + this.stateToString(position, buttonStates, changeMask));
   },

   onUp: function(position, buttonStates, changeMask)
   {
      hudSystem.debugMessage("Up: " + this.stateToString(position, buttonStates, changeMask));
   },

   onMove: function(position, buttonStates)
   {
      hudSystem.debugMessage("Move: " + this.stateToString(position, buttonStates));
   },

   onRotate: function(position, buttonStates, rotation)
   {
      hudSystem.debugMessage("Rotate: " + this.stateToString(position, buttonStates, rotation));
   }


});
