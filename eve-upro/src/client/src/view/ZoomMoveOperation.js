/**
 * This pointer operation moves a scene object in one axis - typically bound to a camera
 */
upro.view.ZoomMoveOperation = Class.create(upro.sys.PointerOperation,
{
   initialize: function(sceneSystem, sceneMediator)
   {
      this.sceneSystem = sceneSystem;
      this.sceneMediator = sceneMediator;

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
      var temp = vec3.set([ 0, 0, -realPos.y ], this.temp);
      var diff = vec3.subtract(this.lastPos, temp);

      vec3.scale(diff, 30);

      this.sceneMediator.addZoom(diff[2]);
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

      this.lastPos[2] = -realPos.y;
      // this.lastPos[1] = realPos.x;
   },

   /** {@inheritDoc} */
   onStop: function(position)
   {

   }
});
