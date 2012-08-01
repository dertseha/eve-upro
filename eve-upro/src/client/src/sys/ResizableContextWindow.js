/**
 * The window resizable context is based on the (browser) window and
 * some holding element
 */
upro.sys.ResizableContextWindow = Class.create(upro.sys.ResizableContext,
{
   initialize: function(holderName)
   {
      this.holderName = holderName;
   },

   getHolderName: function()
   {
      return this.holderName;
   },

   getFrame: function()
   {
      return $(window);
   }
});
