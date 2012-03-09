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
