/**
 * A session control is providing a DataStore based on certain
 * preconditions, such as a logged in user.
 * This control binds a DataStore interface to a backing
 * system.
 */
upro.data.SessionControl = Class.create(
{
   initialize: function()
   {
      this.dataStore = null;
   },

   getDataStore: function()
   {
      return this.dataStore;
   }


});
