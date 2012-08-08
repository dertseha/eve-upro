/**
 * The scene system is the main context object for the 3D space; It initializes and handles the WebGL context, has all
 * bodies registered and runs the render loop.
 */
upro.scene.SceneSystem = Class.create(
{
   initialize: function(resizableContext)
   {
      this.context = resizableContext;

      this.matrixStack = [];
      this.mvMatrix = mat4.identity(mat4.create());

      this.camera = new upro.scene.Camera();
      this.inverseCameraPos = vec3.negate(this.camera.position, vec3.create());
      this.rotationBuffer = this.getCameraRotationBuffer();

      this.bodies = [];

      this.setupCanvas();
      this.setupGL();
      this.setupProjectionMatrix();

      this.context.getFrame().addEventListener("resize", this.onResize.bind(this), false);

      this.animId = null;
      this.animCallback = this.render.bind(this);

      this.lastRenderTick = upro.sys.Time.tickMSec();
      this.render(this);
   },

   pixelToReal: function(pixelX, pixelY)
   {
      var temp =
      {
         x: (pixelX / (this.canvas.width / 2)) - 1,
         y: -((pixelY / (this.canvas.height / 2)) - 1)
      };

      return temp;
   },

   /**
    * Adds a render object to the list
    * 
    * @param body the object to add
    */
   addRenderObject: function(body)
   {
      this.bodies.push(body);
   },

   /**
    * Projects given position vector onto the 2d plane based on current mv/p matrices.
    * 
    * @param position the vec3 to project
    * @return a structure of {x, y} in view space coordinates or null if behind view
    */
   project: function(position)
   {
      var temp = quat4.create();
      var result = null;

      temp[0] = position[0];
      temp[1] = position[1];
      temp[2] = position[2];
      temp[3] = 1;

      mat4.multiplyVec4(this.mvMatrix, temp);
      mat4.multiplyVec4(this.pMatrix, temp);

      if (temp[3] > 0)
      {
         temp[0] /= temp[3];
         temp[1] /= temp[3];
         temp[2] /= temp[3];

         result = {};
         result.x = 0 + this.canvas.width * (temp[0] + 1) * 0.5;
         result.y = 0 + this.canvas.height * (-temp[1] + 1) * 0.5;

         result.x = result.x / this.canvas.width * 2 - 1;
         result.y = result.y / this.canvas.height * -2 + 1;
      }

      return result;
   },

   /**
    * Tries to pick something at given viewPosition
    * 
    * @param viewPosition to search from
    * @return A PickResult nearest to viewPosition or null if nothing found
    */
   pickAt: function(viewPosition)
   {
      var result = null, temp = null, i, body;

      for (i = 0; i < this.bodies.length; i++)
      {
         body = this.bodies[i];
         temp = body.pick(viewPosition);
         if ((temp != null) && ((result == null) || (temp.getDistance() < result.getDistance())))
         {
            result = temp;
         }
      }

      return result;
   },

   /**
    * Returns a rotation helper that is based on the scenes camera rotation.
    * 
    * @return a RotationBuffer instance
    */
   getCameraRotationBuffer: function()
   {
      return new upro.scene.RotationBuffer(this, this.camera.rotation);
   },

   pushMatrix: function()
   {
      this.matrixStack.push(mat4.create(this.mvMatrix));
   },

   popMatrix: function()
   {
      if (this.matrixStack.length == 0)
      {
         throw "matrixStack is empty!";
      }
      this.mvMatrix = this.matrixStack.pop();
   },

   render: function()
   {
      this.animId = window.requestAnimFrame(this.animCallback, this.canvas);
      {
         var now = upro.sys.Time.tickMSec();
         var timeDiffMSec = now - this.lastRenderTick;

         this.lastRender = now;
         this.draw(timeDiffMSec);
      }
   },

   draw: function(timeDiffMSec)
   {
      var modifiedCamera = this.camera.isOrientationModified();

      this.gl.clear(this.gl.COLOR_BUFFER_BIT);

      mat4.identity(this.mvMatrix);

      vec3.negate(this.camera.position, this.inverseCameraPos);
      this.rotationBuffer.rotateVector(this.inverseCameraPos);
      mat4.translate(this.mvMatrix, this.inverseCameraPos);

      // render all registered bodies
      this.bodies.each(function(body)
      {
         if (modifiedCamera)
         {
            body.setOrientationModified(true);
         }
         body.render(timeDiffMSec);
         body.setOrientationModified(false);
      }, this);
      this.camera.setOrientationModified(false);
   },

   onResize: function()
   {
      this.resizeCanvas();
      this.setupProjectionMatrix();
      this.camera.setOrientationModified(true);
   },

   resizeCanvas: function()
   {
      this.canvas.width = this.context.getFrame().innerWidth;
      this.canvas.height = this.context.getFrame().innerHeight;
   },

   setupProjectionMatrix: function()
   {
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);

      this.pMatrix = mat4.create();
      mat4.perspective(45, this.canvas.width / this.canvas.height, 0.1, 1000, this.pMatrix);
   },

   setupCanvas: function()
   {
      var canvas = $(this.context.getHolderName());

      this.canvas = canvas;

      canvas.style.backgroundColor = "yellow"; // should anything go wrong, we'd see it
      this.resizeCanvas();
   },

   setupGL: function()
   {
      var gl = this.canvas.getContext("experimental-webgl",
      {
         premultipliedAlpha: false,
         alpha: false
      });

      this.gl = gl;

      gl.clearColor(0.0, 0.0, 0.0, 1.0);

      gl.enable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
   },

   loadShaderProgram: function(shaderConstructor, scriptProvider)
   {
      var programHandle = upro.scene.ShaderProgram.compileAndLink(this.gl, scriptProvider);
      var program = null;

      if (programHandle != null)
      {
         program = new shaderConstructor(this.gl, programHandle);
      }

      return program;
   }

});

upro.scene.SceneSystem.SUPPORTED = !!window.WebGLRenderingContext;
