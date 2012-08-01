/**
 * A scene object is something can have a position in a scene
 */
upro.scene.SceneObject = Class.create(
{
   initialize: function()
   {
      this.position = vec3.create([0.0, 0.0, 0.0]);
      this.rotation = vec3.create([0.0, 0.0, 0.0]);
      this.orientationModified = false;
   },

   isOrientationModified: function()
   {
      return this.orientationModified;
   },

   setOrientationModified: function(value)
   {
      this.orientationModified = value;
   }

});
