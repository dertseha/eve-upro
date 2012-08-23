/**
 * This is a factory of an icon creator (a factory by itself). It holds references to a paper context and some path data
 * to create an icon on request. The getIconCreator() method returns a function bound to the creating function.
 */
upro.hud.IconCreatorFactory = Class.create(
{
   initialize: function(context, pathData)
   {
      this.context = context;
      this.pathData = pathData;
   },

   /**
    * Creates an icon instance
    * 
    * @returns an icon instance registered at initialized paper
    */
   createIcon: function()
   {
      var path = this.context.paper.path(this.pathData);

      path.attr("fill", "#FFF");

      return path;
   },

   /**
    * @returns a creator function calling this.createIcon()
    */
   getIconCreator: function()
   {
      return this.createIcon.bind(this);
   }
});
