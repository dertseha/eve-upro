/**
 * base class for something shared
 */
upro.model.AbstractSharedObjectInfo = Class.create(
{
   initialize: function(id, type, interestChecker)
   {
      this.id = id;
      this.type = type;
      this.interestChecker = interestChecker;

      this.owner = [];
      this.shares = [];
   },

   getId: function()
   {
      return this.id;
   },

   toString: function()
   {
      return this.type + " [" + this.id + "]";
   },

   isClientOwner: function()
   {
      var that = this;
      var rCode = false;

      this.owner.forEach(function(interest)
      {
         if (that.interestChecker.hasInterest(interest))
         {
            rCode = true;
         }
      });

      return rCode;
   }

});
