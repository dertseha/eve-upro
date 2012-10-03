TestCube = Class.create(upro.scene.SceneRenderObject,
{
   initialize: function($super)
   {
      $super();

      this.vertices = [];
      this.colors = [];

      // Ok, it's not a cube so far, but helps orienting
      this.colors.push(1.0, 0.0, 0.0);
      this.vertices.push(0.5, 0.5, 0.5);
      this.colors.push(0.0, 1.0, 0.0);
      this.vertices.push(-0.5, 0.5, 0.5);

      this.colors.push(1.0, 0.0, 0.0);
      this.vertices.push(0.5, 0.5, 0.5);
      this.colors.push(0.0, 0.0, 1.0);
      this.vertices.push(0.5, -0.5, 0.5);

      this.colors.push(1.0, 0.0, 0.0);
      this.vertices.push(0.5, 0.5, 0.5);
      this.colors.push(1.0, 1.0, 0.0);
      this.vertices.push(0.5, 0.5, -0.5);
   },

   addToScene: function($super, scene)
   {
      this.vertexBuffer = scene.gl.createBuffer();
      scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, this.vertexBuffer);
      scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(this.vertices), scene.gl.STATIC_DRAW);

      this.colorBuffer = scene.gl.createBuffer();
      scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, this.colorBuffer);
      scene.gl.bufferData(scene.gl.ARRAY_BUFFER, new Float32Array(this.colors), scene.gl.STATIC_DRAW);

      $super(scene);
   },

   render: function(timeDiffMSec)
   {
      var scene = this.scene;

      scene.pushMatrix();
      mainShader.use();

      mat4.translate(scene.mvMatrix, this.position);

      scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, this.vertexBuffer);
      scene.gl.vertexAttribPointer(mainShader.positionAttribute, 3, scene.gl.FLOAT, false, 0, 0);

      scene.gl.bindBuffer(scene.gl.ARRAY_BUFFER, this.colorBuffer);
      scene.gl.vertexAttribPointer(mainShader.colorAttribute, 3, scene.gl.FLOAT, false, 0, 0);

      scene.gl.uniformMatrix4fv(mainShader.mvMatrixUniform, false, scene.mvMatrix);
      scene.gl.uniformMatrix4fv(mainShader.pMatrixUniform, false, scene.pMatrix);

      scene.gl.drawArrays(scene.gl.LINES, 0, this.vertices.length / 3);

      scene.popMatrix();

      this.updateProjectionTrackers();
   },

   pick: function(viewPosition)
   {
      var result = null;
      var scene = this.scene;
      var projection = scene.project(this.position);

      if (projection != null) // ignored if behind the view
      {
         var dx = projection.x - viewPosition.x;
         var dy = projection.y - viewPosition.y;
         var dist = Math.sqrt((dx * dx) + (dy * dy));

         if (dist <= 0.05)
         {
            // can't go without a Carl Sagan reference here :P
            result = new upro.scene.PickResult("A Cuuube", projection, dist);
         }
      }

      return result;
   }


});
