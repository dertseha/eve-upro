/**
 * This is a resolved body with a name
 */
upro.model.ResolvedBodyName = Class.create(upro.model.AbstractBodyName,
{
   initialize: function($super, id, name)
   {
      $super(id);

      this.name = name;
   },

   getName: function()
   {
      return this.name;
   }
});
