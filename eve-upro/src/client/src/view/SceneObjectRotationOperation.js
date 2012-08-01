/**
 * This pointer operation rotates a scene object - typically bound to a camera
 */
upro.view.SceneObjectRotationOperation = Class.create(upro.sys.PointerOperation,
{
   initialize: function(sceneSystem, object)
   {
      this.sceneSystem = sceneSystem;
      this.obj = object;

      this.lastPos = vec3.create();
      this.temp = vec3.create();
   },

   /** {@inheritDoc} */
   onDown: function(position, buttonStates, changeMask)
   {

   },

   /** {@inheritDoc} */
   onUp: function(position, buttonStates, changeMask)
   {

   },

   /** {@inheritDoc} */
   onMove: function(position, buttonStates)
   {
      var realPos = this.sceneSystem.pixelToReal(position.x, position.y);
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

   /** {@inheritDoc} */
   onRotate: function(position, buttonStates, rotation)
   {

   },

   /** {@inheritDoc} */
   onStart: function(position, buttonStates)
   {
      var realPos = this.sceneSystem.pixelToReal(position.x, position.y);

      this.lastPos[0] = -realPos.y;
      this.lastPos[1] = realPos.x;
   },

   /** {@inheritDoc} */
   onStop: function(position)
   {

   },

   /**
    * Rotates a circular value and ensures it's between -2PI and +2PI
    * @param value to rotate
    * @return the rotated value
    */
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

   /**
    * This method limits a given value
    * @param value to limit
    * @param limit to use
    * @return the value if below limit, limit otherwise
    */
   limitValueMax: function(value, limit)
   {
      if (value > limit)
      {
         value = limit;
      }

      return value;
   },

   /**
    * This method limits a given value
    * @param value to limit
    * @param limit to use
    * @return the value if above limit, limit otherwise
    */
   limitValueMin: function(value, limit)
   {
      if (value < limit)
      {
         value = limit;
      }

      return value;
   }

});
