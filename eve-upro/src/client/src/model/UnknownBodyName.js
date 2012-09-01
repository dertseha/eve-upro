/**
 * This is an unknown body name, requesting to be looked up on name request
 */
upro.model.UnknownBodyName = Class.create(upro.model.AbstractBodyName,
{
   initialize: function($super, id, type, requester)
   {
      $super(id);

      this.type = type;
      this.requester = requester;
   },

   getName: function()
   {
      this.requester.requestBodyName(this.type, this.getId());

      return this.getId();
   }
});
