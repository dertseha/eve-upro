/**
 * This entry is the memory-internal storage for one info of a data store
 */
upro.data.MemoryDataStoreEntry = Class.create(
{
   initialize: function(infoId, dataStore)
   {
      this.infoId = infoId;
      this.properties = {};
      this.references = {};
      this.children = {};

      this.boundObject = upro.data.InfoTypeFactory.Instance.create(this.infoId, dataStore);
   },

   /**
    * Called when this entry becomes destroyed
    */
   destruct: function()
   {
      if (this.boundObject)
      {
         this.boundObject.onDeleted();
         this.boundObject = null;
      }
   },

   /**
    * Returns string presentation
    * @return string presentation
    */
   toString: function()
   {
      return "DataStoreEntry:" + this.infoId.toString();
   },

   /**
    * Returns true if this entry is owned by at least one other
    * @return true if this entry is owned by at least one other
    */
   isOwned: function()
   {
      var rCode = false;

      for (var ref in this.references)
      {
         if (this.references[ref].owning)
         {
            rCode = true;
         }
      }

      return rCode;
   },

   /**
    * Returns the reference to given parent id
    * @param parentId to query
    * @return the reference to given parent id { undefined, false, true }
    */
   getReference: function(parentId)
   {
      var ref = this.references[parentId];
      var owning = undefined;

      if (ref !== undefined)
      {
         owning = ref.owning;
      }

      return owning;
   },

   /**
    * Sets the properties from given map
    * @param properties to set
    */
   setProperties: function(properties)
   {
      for (var name in properties)
      {
         var value = properties[name];

         this.properties[name] = value;
      }
      if (this.boundObject)
      {
         this.boundObject.onUpdated(properties);
      }
   },

   /**
    * Notifies the bound object (if existing) of becoming referenced to another
    * @param other the referenced entry.
    */
   notifyReferenceAdded: function(other)
   {
      if (this.boundObject && other.boundObject)
      {
         this.boundObject.onReferenceAdded(other.boundObject);
      }
   },

   /**
    * Notifies the bound object (if existing) of losing a reference to another
    * @param other the referenced entry.
    */
   notifyReferenceRemoved: function(other)
   {
      if (this.boundObject && other.boundObject)
      {
         this.boundObject.onReferenceRemoved(other.boundObject);
      }
   }

});
