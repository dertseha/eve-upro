function resetScene()
{
   vec3.set([ 0, 0, 20 ], sceneSystem.camera.positionTarget);
   vec3.set([ 0, 0, 0 ], sceneSystem.camera.rotationTarget);
   vec3.set([ 0, 0, 0 ], cube.positionTarget);
   vec3.set([ 0, 0, 0 ], cube.rotationTarget);
   cube.setOrientationModified(true);
}

function addResetButton()
{
   var button = new upro.hud.Button(hudSystem, 20, 500);

   button.clickedCallback = resetScene;
}

function projectionChanged(tracker, valid)
{
   var realPos = tracker.getProjectedPosition();

   if (realPos)
   {
      var pixel = hudSystem.realToViewCoordinates(realPos);

      projectedItem.stop();
      projectedItem.animate(
      {
         "transform": "T" + pixel.x + "," + pixel.y,
         "fill-opacity": 0.2,
         "stroke-opacity": 0.3
      }, 50);
      projectedItem.show();

   }
   else
   {
      projectedItem.hide();
   }
}

function testScene()
{
   addResetButton();

   mainShader = sceneSystem.loadShaderProgram(upro.scene.ShaderProgram, [ $('basic-vertex-shader'),
         $('basic-fragment-shader') ]);

   // a static one in center to help referencing
   refCube = new TestCube();
   refCube.addToScene(sceneSystem);

   cube = new TestCube();
   cube.addToScene(sceneSystem);

   projectedItem = hudSystem.createHexagon(5).hide();
   projectedItem.attr(
   {
      "stroke": "#808080",
      "fill": "#808080"
   });
   cube.addProjectionTracker(new upro.scene.TrackedProjection(0, vec3.create([ 0.0, 0.0, 0.0 ]), projectionChanged));

   moveOp = new CameraMoveOperation(cube, sceneSystem.getCameraRotationBuffer());
   opRegistry.registerOperation([ false, true, false ], moveOp);

   rotOp = new CameraRotationOperation(sceneSystem.camera);
   opRegistry.registerOperation([ true, false, false ], rotOp);

   idleOp = new IdleOperation();
   opRegistry.registerOperation([ false, false, false ], idleOp);

   resetScene();

}
