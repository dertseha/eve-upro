/**
 * Interface for checking interest for a shared data object
 */
upro.model.InterestChecker = Class.create(
{
   initialize: function()
   {

   },

   /**
    * Returns true if given interest matches
    * 
    * @param interest to check
    * @returns {Boolean} true if given interest matches
    */
   hasInterest: function(interest)
   {
      return false;
   }

});
