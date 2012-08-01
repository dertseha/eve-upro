/**
 * A data store info is the interface to the user (listener) of a data store
 */
upro.data.DataStoreInfo = Class.create(
{
   initialize: function(infoId)
   {
      this.infoId = infoId;
   },

   /**
    * Returns string presentation
    * @return string presentation
    */
   toString: function()
   {
      return "DataStoreInfo:" + this.infoId.toString();
   },

   /**
    * Returns the info id
    * @return the info id
    */
   getInfoId: function()
   {
      return this.infoId;
   },

   /**
    * Decodes a boolean value and sets a member with the same name
    * @param properties property map that was used for update
    * @param propertyName of the property and the member
    * @return true if a value was decoded
    */
   decodeBooleanMember: function(properties, propertyName)
   {
      var value = properties[propertyName];
      var rCode = false;

      if (value !== undefined)
      {
         this[propertyName] = ("" + value) != "0";
         rCode = true;
      }

      return rCode;
   },

   /**
    * Decodes a number value and sets a member with the same name
    * @param properties property map that was used for update
    * @param propertyName of the property and the member
    * @return true if a value was decoded
    */
   decodeNumberMember: function(properties, propertyName)
   {
      var value = properties[propertyName];
      var rCode = false;

      if (value !== undefined)
      {
         this[propertyName] = new Number(value);
         rCode = true;
      }

      return rCode;
   },

   /**
    * Decodes a string value and sets a member with the same name
    * @param properties property map that was used for update
    * @param propertyName of the property and the member
    * @return true if a value was decoded
    */
   decodeStringMember: function(properties, propertyName)
   {
      var value = properties[propertyName];
      var rCode = false;

      if (value !== undefined)
      {
         this[propertyName] = ("" + value);
         rCode = true;
      }

      return rCode;
   },

   /**
    * Called when this info became deleted. Either explicitly, or as the
    * result of removing the last owning parent reference.
    */
   onDeleted: function()
   {

   },

   /**
    * Called whenever this info became its properties updated. The passed
    * map of properties lists the requested changes.
    * @param properties map of properties to update
    */
   onUpdated: function(properties)
   {

   },

   /**
    * Called when this info became referenced to another.
    * The child is notified of its parent first.
    * @param info the referenced info
    */
   onReferenceAdded: function(info)
   {

   },

   /**
    * Called when this info lost its reference to another.
    * The parent is notified first.
    * @param info the referenced info
    */
   onReferenceRemoved: function(info)
   {

   }
});
