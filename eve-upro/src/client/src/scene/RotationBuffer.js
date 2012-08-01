/**
 * This is a helper class for rotation.
 */
upro.scene.RotationBuffer = Class.create(
{
   /**
    * @param scene SceneSystem reference to take the mvMatrix from
    * @param rotation rotation vector reference to use
    */
   initialize: function(scene, rotation)
   {
      this.scene = scene;
      this.rotation = rotation;

      this.rotMatrix = mat4.create();
      this.axisPitch = vec3.create();
   },

   /**
    * Rotates the given vector
    * @param vector to rotate
    * @return the given vector
    */
   rotateVector: function(vector)
   {
      var axisPitch = vec3.set([1.0, 0.0, 0.0], this.axisPitch);
      var rotation = this.rotation;
      var rotMatrix = this.rotMatrix;

      mat4.identity(rotMatrix);
      mat4.rotateY(rotMatrix, -rotation[1]);

      mat4.multiply(this.scene.mvMatrix, rotMatrix);

      mat4.inverse(rotMatrix);
      mat4.multiplyVec3(rotMatrix, axisPitch);
      mat4.multiplyVec3(rotMatrix, vector);

      {  // now apply pitch
         mat4.identity(rotMatrix);
         mat4.rotate(rotMatrix, -rotation[0], axisPitch);
         mat4.multiply(this.scene.mvMatrix, rotMatrix);

         mat4.inverse(rotMatrix);
         mat4.multiplyVec3(rotMatrix, vector);
      }

      return vector;
   }

});
