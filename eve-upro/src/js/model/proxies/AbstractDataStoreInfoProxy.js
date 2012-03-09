/**
 * This proxy is one that has an AbstractProxiedDataStoreInfo object as data.
 * It registers the deletedCallback to a method that removes the proxy from
 * the model.
 */
upro.model.proxies.AbstractDataStoreInfoProxy = Class.create(Proxy,
{
   initialize: function($super, name, data, dataStore)
   {
      $super(name, data);

      this.dataStore = dataStore;
      data.deletedCallback = this.onDataDeleted.bind();
   },

   /**
    * String presentation
    * @return string presentation
    */
   toString: function()
   {
      return this.getName() + " for " + this.getData().toString();
   },

   /**
    * Returns the data store responsible for this proxy
    * @return the data store responsible for this proxy
    */
   getDataStore: function()
   {
      return this.dataStore;
   },

   /**
    * Called when the contained data became deleted.
    * Removes this proxy from the model.
    */
   onDataDeleted: function()
   {
      this.facade().removeProxy(this.getName());
   },

   /**
    * Encodes a boolean value (mirroring DataStoreInfo.decodeBooleanMember())
    * @param value the boolean to encode
    * @return an encoded string
    */
   encodeBoolean: function(value)
   {
      return value ? "1" : "0";
   },

   updateProperties: function(properties)
   {
      var transaction = this.getDataStore().createWriteTransaction();

      transaction.updateInfo(this.getData().infoId, properties);
      transaction.commit();
   }

});
