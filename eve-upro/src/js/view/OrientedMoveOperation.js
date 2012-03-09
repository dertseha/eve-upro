/**
 * This oriented move operation translates relative to a
 * foreign orientation (rotation)
 */
upro.view.OrientedMoveOperation = Class.create(upro.sys.PointerOperation,
{
   initialize: function(sceneSystem, rotationBuffer, moveCallback)
   {
      this.sceneSystem = sceneSystem;
      this.buffer = rotationBuffer;
      this.moveCallback = moveCallback;

      this.lastPos = vec3.create();
      this.temp = vec3.create();
   },

   onDown: function(position, buttonStates, changeMask)
   {

   },

   onUp: function(position, buttonStates, changeMask)
   {

   },

   onMove: function(position, buttonStates)
   {
      var realPos = this.sceneSystem.pixelToReal(-position.x, -position.y);
      var temp = vec3.set([realPos.x, realPos.y, 0], this.temp);

      var diff = vec3.subtract(this.lastPos, temp);
      this.moveByVector(diff);
      // store for next call
      vec3.set(temp, this.lastPos);
   },

   onRotate: function(position, buttonStates, rotation)
   {
      var temp = vec3.set([0, 0, rotation[1] / -1000.0], this.temp);

      this.moveByVector(temp);
   },

   onStart: function(position, buttonStates)
   {
      var realPos = this.sceneSystem.pixelToReal(-position.x, -position.y);

      this.lastPos[0] = realPos.x;
      this.lastPos[1] = realPos.y;
   },

   onStop: function(position)
   {

   },

   moveByVector: function(temp)
   {
      // rotate movement around reference
      this.buffer.rotateVector(temp);
      // callback
      this.moveCallback(temp);
   }

});
