/**
 * This modifier does the actual work
 */
upro.data.MemoryDataStoreModifyExecutor = Class.create(upro.data.DataStoreModifier,
{
   initialize: function(store)
   {
      this.store = store;
   },

   /** {@inheritDoc} */
   createInfo: function(parentId, infoId, properties)
   {
      var parent = this.store.getEntry(parentId);
      var entry = this.store.createEntry(infoId);

      entry.setProperties(properties);
      this.store.setReference(entry, parent, true);

      return true;
   },

   /** {@inheritDoc} */
   updateInfo: function(infoId, properties)
   {
      var entry = this.store.getEntry(infoId);

      entry.setProperties(properties);

      return true;
   },

   /** {@inheritDoc} */
   deleteInfo: function(infoId)
   {
      this.store.deleteEntry(infoId);

      return true;
   },

   /** {@inheritDoc} */
   addReference: function(infoId, parentId, owning)
   {
      var parent = this.store.getEntry(parentId);
      var entry = this.store.getEntry(infoId);

      this.store.setReference(entry, parent, owning);

      return true;
   },

   /** {@inheritDoc} */
   removeReference: function(infoId, parentId)
   {
      var parent = this.store.getEntry(parentId);
      var entry = this.store.getEntry(infoId);

      if ((parent !== undefined) && (entry !== undefined))
      {
         this.store.setReference(entry, parent, undefined);
      }

      return true;
   }
});
