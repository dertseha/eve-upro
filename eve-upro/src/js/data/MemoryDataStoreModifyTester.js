/**
 * This modifier tests whether the whole transaction would be OK
 */
upro.data.MemoryDataStoreModifyTester = Class.create(upro.data.DataStoreModifier,
{
   initialize: function(store)
   {
      this.store = store;
      this.objectLife = {};
   },

   /**
    * Returns true if the given info Id has been created, or still exists
    * in the store - and hasn't been deleted by a previous action.
    * @return true if the given info Id would be present
    */
   isEntryAlive: function(infoId)
   {
      var rCode = false;
      var alive = this.objectLife[infoId.toString()];

      if (alive === undefined)
      {
         rCode = this.store.containsEntry(infoId);
      }
      else if (alive === true)
      {
         rCode = true;
      }
      else if (alive === false)
      {
         rCode = false;
      }

      return rCode;
   },

   /** {@inheritDoc} */
   createInfo: function(parentId, infoId, properties)
   {
      var rCode = this.isEntryAlive(parentId) && !this.isEntryAlive(infoId);

      if (rCode)
      {
         this.objectLife[infoId.toString()] = true;
      }

      return rCode;
   },

   /** {@inheritDoc} */
   updateInfo: function(infoId, properties)
   {
      return this.isEntryAlive(infoId);
   },

   /** {@inheritDoc} */
   deleteInfo: function(infoId)
   {
      this.objectLife[infoId.toString()] = false;

      return true;
   },

   /** {@inheritDoc} */
   addReference: function(infoId, parentId, owning)
   {
      return this.isEntryAlive(parentId) && this.isEntryAlive(infoId);
   },

   /** {@inheritDoc} */
   removeReference: function(infoId, parentId)
   {
      return true;
   }
});
