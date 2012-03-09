/**
 *
 */
upro.data.DataStore = Class.create(
{
   initialize: function()
   {

   },

   /**
    * This creates a transaction for this store with which
    * data can be modified after commit.
    * @return A DataStoreWriteTransaction object
    */
   createWriteTransaction: function()
   {
      return null;
   }
});
