/**
 * A write transaction is the basis for any modification
 * within a data store
 */
upro.data.DataStoreWriteTransaction = Class.create(
{
   initialize: function()
   {

   },

   /**
    * This function commits the transaction. Only then the previously
    * entered modifications are executed.
    */
   commit: function()
   {

   },

   /**
    * Creates an information structure.
    * Fails during commit if parent does not exist or 'new' info already exists.
    * @param parentId the first (owning) reference this info is hooked under
    * @param infoId the id of the info to create
    * @param properties a map of initial properties to set
    */
   createInfo: function(parentId, infoId, properties)
   {

   },

   /**
    * Modifies an information structure.
    * Fails during commit if info does not exist.
    * @param infoId the id of the info to modify
    * @param properties a map of properties to set
    */
   updateInfo: function(infoId, properties)
   {

   },

   /**
    * Deletes an information.
    * Action is ignored if info is already deleted.
    * @param infoId the id of the info to delete
    */
   deleteInfo: function(infoId)
   {

   },

   /**
    * Adds a reference from infoId to parentId, either owning or informative.
    * An info can have more than one parent and more than one of them can be owning.
    * Fails if either info or parent do not exist.
    * @param infoId the id of the info to receive an additional parent
    * @param parentId the id of the referenced parent
    * @param owning whether this new reference is an owning one
    */
   addReference: function(infoId, parentId, owning)
   {

   },

   /**
    * Removes a reference from infoId to parentId.
    * If the reference is the last owning reference of this info, it is deleted.
    * If either info objects or the reference do not exist, this action is ignored.
    * @param infoId the id of the info to modify
    * @param parentId the id of the referenced parent
    */
   removeReference: function(infoId, parentId)
   {

   }
});
