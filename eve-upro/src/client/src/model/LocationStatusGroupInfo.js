/**
 * Location status group info
 */
upro.model.LocationStatusGroupInfo = Class.create(
{
   initialize: function(id)
   {
      this.id = id;
      this.sendLocation = null;
      this.displayLocation = null;
   },

   getId: function()
   {
      return this.id;
   },

   setSendLocation: function(value)
   {
      this.sendLocation = value;
   },

   isSendLocationEnabled: function()
   {
      return this.sendLocation;
   },

   setDisplayLocation: function(value)
   {
      this.displayLocation = value;
   },

   isDisplayLocationEnabled: function()
   {
      return this.displayLocation;
   }
});
