/**
 * base class for something shared
 */
upro.model.AbstractSharedObjectInfo = Class.create(
{
   initialize: function(id, type, controller, interestChecker)
   {
      this.id = id;
      this.type = type;
      this.controller = controller;
      this.interestChecker = interestChecker;

      this.owner = [];
      this.shares = [];
   },

   toString: function()
   {
      return this.type + " [" + this.id + "]";
   },

   getId: function()
   {
      return this.id;
   },

   getType: function()
   {
      return this.type;
   },

   getController: function()
   {
      return this.controller;
   },

   isInterestAllowedControl: function(interest)
   {
      var rCode = false;

      this.owner.forEach(function(ownerInterest)
      {
         if ((ownerInterest.scope == interest.scope) && (ownerInterest.id == interest.id))
         {
            rCode = true;
         }
      });

      return rCode;
   },

   isClientAllowedControl: function()
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
   },

   forEachOwner: function(callback)
   {
      this.owner.forEach(callback);
   },

   forEachShare: function(callback)
   {
      this.shares.forEach(callback);
   }
});
