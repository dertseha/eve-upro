
CameraRotationOperation = Class.create(upro.sys.PointerOperation,
{
   initialize: function(object)
   {
      this.lastPos = vec3.create();
      this.temp = vec3.create();
      this.obj = object;
   },

   onDown: function(position, buttonStates, changeMask)
   {

   },

   onUp: function(position, buttonStates, changeMask)
   {

   },

   onMove: function(position, buttonStates)
   {
      var realPos = sceneSystem.pixelToReal(position.x, position.y);
      var temp = vec3.set([-realPos.y, realPos.x, 0], this.temp);
      var diff = vec3.subtract(this.lastPos, temp);

      vec3.scale(diff, 5);

      vec3.add(this.obj.rotation, diff);

      this.obj.rotation[0] = this.rotateValue(this.obj.rotation[0]);
      this.obj.rotation[0] = this.limitValueMax(this.obj.rotation[0], 0);
      this.obj.rotation[0] = this.limitValueMin(this.obj.rotation[0], Math.PI / -2);
      this.obj.rotation[1] = this.rotateValue(this.obj.rotation[1]);
      this.obj.rotation[2] = this.rotateValue(this.obj.rotation[2]);
      this.obj.setOrientationModified(true);

      vec3.set(temp, this.lastPos);
   },

   rotateValue: function(value)
   {
      var limit = Math.PI * 2;

      while (value > limit)
      {
         value -= limit;
      }
      while (value < -limit)
      {
         value += limit;
      }

      return value;
   },

   limitValueMax: function(value, limit)
   {
      if (value > limit)
      {
         value = limit;
      }

      return value;
   },

   limitValueMin: function(value, limit)
   {
      if (value < limit)
      {
         value = limit;
      }

      return value;
   },

   onRotate: function(position, buttonStates, rotation)
   {

   },

   onStart: function(position, buttonStates)
   {
      var realPos = sceneSystem.pixelToReal(position.x, position.y);

      this.lastPos[0] = -realPos.y;
      this.lastPos[1] = realPos.x;
   },

   onStop: function(position)
   {

   }

});
