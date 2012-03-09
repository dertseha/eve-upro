
TestHandler = Class.create(upro.sys.KeyboardHandler,
{
   initialize: function()
   {

   },

   keyToString: function(keyCode)
   {
      var stringCode = String.fromCharCode(keyCode);

      return "" + keyCode + " = [" + ((stringCode.length > 0) ? stringCode : "(empty)") + "]";
   },

   onDown: function(keyCode)
   {
      hudSystem.debugMessage("Down: " + this.keyToString(keyCode));
   },

   onUp: function(keyCode)
   {
      hudSystem.debugMessage("Up: " + this.keyToString(keyCode));
   },

   onPress: function(charCode)
   {
      hudSystem.debugMessage("Press: " + this.keyToString(charCode));
   }
});
