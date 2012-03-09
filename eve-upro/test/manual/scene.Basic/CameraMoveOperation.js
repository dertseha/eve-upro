
CameraMoveOperation = Class.create(upro.sys.PointerOperation,
{
   initialize: function(object, rotationBuffer)
   {
      this.lastPos = vec3.create();
      this.temp = vec3.create();
      this.obj = object;

      this.buffer = rotationBuffer;
   },

   onDown: function(position, buttonStates, changeMask)
   {

   },

   onUp: function(position, buttonStates, changeMask)
   {

   },

   onMove: function(position, buttonStates)
   {
      var realPos = sceneSystem.pixelToReal(-position.x, -position.y);
      var temp = vec3.set([realPos.x, realPos.y, 0], this.temp);

      var diff = vec3.subtract(this.lastPos, temp);
      this.moveByVector(diff);
      // store for next call
      vec3.set(temp, this.lastPos);
   },

   moveByVector: function(temp)
   {
      // scale the movement according to distance to center - faster if farther out
      var scale = vec3.length(this.obj.position) / 1.5;
      if (scale < 5)
      {
         scale = 5;
      }
      vec3.scale(temp, scale);
      // rotate movement around reference
      this.buffer.rotateVector(temp);
      // finally add to destination object
      vec3.add(this.obj.position, temp);
      this.obj.setOrientationModified(true);
   },

   onRotate: function(position, buttonStates, rotation)
   {
      var temp = vec3.set([0, 0, rotation[1] / -120.0], this.temp);

      this.moveByVector(temp);
   },

   onStart: function(position, buttonStates)
   {
      var realPos = sceneSystem.pixelToReal(-position.x, -position.y);

      this.lastPos[0] = realPos.x;
      this.lastPos[1] = realPos.y;
   },

   onStop: function(position)
   {

   }

});
