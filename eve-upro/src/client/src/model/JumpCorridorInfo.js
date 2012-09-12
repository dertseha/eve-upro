/**
 * A jump corridor
 */
upro.model.JumpCorridorInfo = Class.create(upro.model.AbstractSharedObjectInfo,
{
   initialize: function($super, id, interestChecker, data)
   {
      $super(id, "JumpCorridor", interestChecker);

      this.data =
      {
         name: data.name,
         jumpType: data.jumpType
      };
   },

   getName: function()
   {
      return this.name;
   },

   getJumpType: function()
   {
      return this.jumpType;
   },

   /**
    * Updates the data and returns true if something changed
    * 
    * @param data data object to extract from
    * @returns {Boolean} true if something was changed
    */
   updateData: function(data)
   {
      var rCode = false;

      for ( var key in this.data)
      {
         if (data.hasOwnProperty(key))
         {
            var value = data[key];

            if (this.data[key] !== value)
            {
               this.data[key] = value;
               rCode = true;
            }
         }
      }

      return rCode;
   }

});
