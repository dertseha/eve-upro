/**
 * A pick result contains info regarding a selective search on
 * a view position
 */
upro.scene.PickResult = Class.create(
{
   initialize: function(refObject, viewPosition, distance)
   {
      this.refObject = refObject;
      this.viewPosition = viewPosition;
      this.distance = distance;
   },

   getRefObject: function()
   {
      return this.refObject;
   },

   getViewPosition: function()
   {
      return this.viewPosition;
   },

   getDistance: function()
   {
      return this.distance;
   }
});
