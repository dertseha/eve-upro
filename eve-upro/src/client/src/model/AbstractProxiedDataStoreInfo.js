/**
 * User settings contain the basic things how a user likes his system.
 */
upro.model.AbstractProxiedDataStoreInfo = Class.create(upro.data.DataStoreInfo,
{
   initialize: function($super, infoId)
   {
      $super(infoId);

      this.deletedCallback = null;
   },

   onDeleted: function()
   {
      if (this.deletedCallback)
      {
         this.deletedCallback();
      }
   }

});
