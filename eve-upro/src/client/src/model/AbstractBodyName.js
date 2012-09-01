/**
 * A body name is an association between an ID and a (human readable) name
 */
upro.model.AbstractBodyName = Class.create(
{
   initialize: function(id)
   {
      this.id = id;
   },

   toString: function()
   {
      return this.id + ' [' + this.getName() + ']';
   },

   getId: function()
   {
      return this.id;
   },

   getName: function()
   {
      return null;
   }
});
