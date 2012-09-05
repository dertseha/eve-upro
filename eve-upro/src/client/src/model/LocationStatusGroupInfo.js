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

   /**
    * @returns the ID of the group
    */
   getId: function()
   {
      return this.id;
   },

   /**
    * Sets the SendLocation setting
    * 
    * @param value to set
    */
   setSendLocation: function(value)
   {
      this.sendLocation = value;
   },

   /**
    * @returns Whether the current location is transmitted to the membrs of this group
    */
   isSendLocationEnabled: function()
   {
      return this.sendLocation;
   },

   /**
    * Updates the DisplayLocation setting
    * 
    * @param value to set
    * @returns {Boolean} true if the setting changed
    */
   updateDisplayLocation: function(value)
   {
      var rCode = false;

      if (this.displayLocation !== value)
      {
         this.displayLocation = value;
         rCode = true;
      }

      return rCode;
   },

   /**
    * @returns Whether the current location of other group members should be displayed
    */
   isDisplayLocationEnabled: function()
   {
      return this.displayLocation;
   }
});
