/**
 * A data store modifier is used behind a transaction
 */
upro.data.DataStoreModifier = Class.create(
{
   initialize: function()
   {

   },

   /**
    * Creates an information structure.
    * @param parentId the first (owning) reference this info is hooked under
    * @param infoId the id of the info to create
    * @param properties a map of initial properties to set
    * @return true if was OK
    */
   createInfo: function(parentId, infoId, properties)
   {
      return false;
   },

   /**
    * Modifies an information structure.
    * @param infoId the id of the info to modify
    * @param properties a map of properties to set
    * @return true if was OK
    */
   updateInfo: function(infoId, properties)
   {
      return false;
   },

   /**
    * Deletes an information.
    * @param infoId the id of the info to delete
    * @return true if was OK
    */
   deleteInfo: function(infoId)
   {
      return false;
   },

   /**
    * Adds a reference from infoId to parentId, either owning or informative.
    * An info can have more than one parent and more than one of them can be owning.
    * @param infoId the id of the info to receive an additional parent
    * @param parentId the id of the referenced parent
    * @param owning whether this new reference is an owning one
    * @return true if was OK
    */
   addReference: function(infoId, parentId, owning)
   {
      return false;
   },

   /**
    * Removes a reference from infoId to parentId.
    * If the reference is the last owning reference of this info, it is deleted.
    * @param infoId the id of the info to modify
    * @param parentId the id of the referenced parent
    * @return true if was OK
    */
   removeReference: function(infoId, parentId)
   {
      return false;
   }
});
