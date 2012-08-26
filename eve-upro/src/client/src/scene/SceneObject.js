/**
 * A scene object is something can have a position in a scene
 */
upro.scene.SceneObject = Class.create(
{
   initialize: function()
   {
      this.position = vec3.create([ 0.0, 0.0, 0.0 ]);
      this.positionTarget = vec3.create([ 0.0, 0.0, 0.0 ]);
      this.rotation = vec3.create([ 0.0, 0.0, 0.0 ]);
      this.rotationTarget = vec3.create([ 0.0, 0.0, 0.0 ]);
      this.temp = vec3.create();
      this.orientationModified = false;
      this.atTargets = true;
   },

   isAtTargets: function()
   {
      return this.atTargets;
   },

   updateTargets: function(timeDiffMSec)
   {
      var changed = false;

      if (this.updateTarget(timeDiffMSec, this.position, this.positionTarget))
      {
         changed = true;
      }
      if (this.updateTarget(timeDiffMSec, this.rotation, this.rotationTarget))
      {
         changed = true;
      }
      this.atTargets = !changed;

      return changed;
   },

   updateTarget: function(timeDiffMSec, current, target, limit)
   {
      var temp = vec3.subtract(target, current, this.temp);
      var len = vec3.length(temp);
      var destLen = len * (timeDiffMSec / 100.0);
      var changed = false;

      if (destLen > 5.0)
      {
         destLen = 5.0;
      }
      if (len == 0)
      {

      }
      else if ((len < 0.001) || (destLen >= len))
      {
         vec3.set(target, current);
         changed = true;
      }
      else
      {
         vec3.normalize(temp);
         vec3.scale(temp, destLen);
         vec3.add(current, temp);
         changed = true;
      }

      return changed;
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
