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
