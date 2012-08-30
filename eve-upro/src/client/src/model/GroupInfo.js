/**
 * This proxy is the primary entry point for everything group related
 */
upro.model.GroupInfo = Class.create(
{
   initialize: function(id, groupData)
   {
      this.id = id;
      this.groupData = groupData;
   },

   getId: function()
   {
      return this.id;
   },

   getName: function()
   {
      return this.groupData.name;
   }
});
