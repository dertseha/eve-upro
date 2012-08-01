/**
 * A write transaction is the basis for any modification
 * within a data store
 */
upro.data.MemoryDataStoreWriteTransaction = Class.create(upro.data.DataStoreWriteTransaction,
{
   initialize: function(dataStore)
   {
      this.dataStore = dataStore;
      this.actions = [];
   },

   /** {@inheritDoc} */
   commit: function()
   {
      var actions = this.actions;

      this.actions = [];
      this.dataStore.commit(actions);
   },

   /** {@inheritDoc} */
   createInfo: function(parentId, infoId, properties)
   {
      this.actions.push(function(a) { return a.createInfo(parentId, infoId, properties); });
   },

   /** {@inheritDoc} */
   updateInfo: function(infoId, properties)
   {
      this.actions.push(function(a) { return a.updateInfo(infoId, properties); });
   },

   /** {@inheritDoc} */
   deleteInfo: function(infoId)
   {
      this.actions.push(function(a) { return a.deleteInfo(infoId); });
   },

   /** {@inheritDoc} */
   addReference: function(infoId, parentId, owning)
   {
      this.actions.push(function(a) { return a.addReference(infoId, parentId, owning); });
   },

   /** {@inheritDoc} */
   removeReference: function(infoId, parentId)
   {
      this.actions.push(function(a) { return a.removeReference(infoId, parentId); });
   }
});
