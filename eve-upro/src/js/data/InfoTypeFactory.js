/**
 * This registry maps info types to their factory function
 */
upro.data.InfoTypeFactory = Class.create(
{
   initialize: function()
   {
      this.factoryByType = {};
   },

   /**
    * This registers a factory function
    * 
    * @param type type string to register for
    * @param a function to register, returns a new object for type
    */
   register: function(type, factory)
   {
      this.factoryByType[type] = factory;
   },

   /**
    * This creates an object for given type
    * 
    * @param infoId to create an object for
    * @param dataStore the dataStore querying the object
    * @return A DataStoreInfo object for given type
    */
   create: function(infoId, dataStore)
   {
      var factory = this.factoryByType[infoId.getType()];
      var info = null;

      if (factory !== undefined)
      {
         info = factory(infoId, dataStore);
      }

      return info;
   }
});

/** Singleton instance */
upro.data.InfoTypeFactory.Instance = new upro.data.InfoTypeFactory();
