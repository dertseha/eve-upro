/**
 * The idle pointer operation is for the mouse actions while no button is pressed. Tightly bound to the SceneMediator.
 */
upro.view.IdlePointerOperation = Class.create(upro.sys.PointerOperation,
{
   initialize: function(sceneMediator)
   {
      this.sceneMediator = sceneMediator;
   },

   /** {@inheritDoc} */
   onDown: function(position, buttonStates, changeMask)
   {
      if (changeMask[2] && buttonStates[2])
      {
         this.sceneMediator.onIdleTertiaryClick();
      }
   },

   /** {@inheritDoc} */
   onUp: function(position, buttonStates, changeMask)
   {
      var sceneSystem = this.sceneMediator.getViewComponent();
      var realPos = sceneSystem.pixelToReal(position.x, position.y);

      if (changeMask[0] && !buttonStates[0])
      {
         this.sceneMediator.onIdlePrimaryClick(realPos);
      }
   },

   /** {@inheritDoc} */
   onMove: function(position, buttonStates)
   {
      var sceneSystem = this.sceneMediator.getViewComponent();
      var realPos = sceneSystem.pixelToReal(position.x, position.y);

      this.sceneMediator.onHover(realPos);
   },

   /** {@inheritDoc} */
   onRotate: function(position, buttonStates, rotation)
   {
      this.sceneMediator.addZoom(rotation[1] / 50);
   },

   /** {@inheritDoc} */
   onStart: function(position, buttonStates)
   {
      var sceneSystem = this.sceneMediator.getViewComponent();
      var realPos = sceneSystem.pixelToReal(position.x, position.y);

      this.sceneMediator.onHover(realPos);
   },

   /** {@inheritDoc} */
   onStop: function(position)
   {
      this.sceneMediator.stopHover();
   }

});
