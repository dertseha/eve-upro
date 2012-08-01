/**
 * A shader program consists of compiled vertex and fragment shader scripts. It may have additional parameters for data
 * exchange, but these must be bound in the derived class.
 * 
 * Create a compiled and linked shader program by using SceneSystem.loadShaderProgram
 */
upro.scene.ShaderProgram = Class.create(
{
   initialize: function(gl, handle)
   {
      this.gl = gl;
      this.handle = handle;

      this.mvMatrixUniform = this.gl.getUniformLocation(this.handle, "uMVMatrix");
      this.pMatrixUniform = this.gl.getUniformLocation(this.handle, "uPMatrix");

      this.colorAttribute = gl.getAttribLocation(this.handle, "aColor");
      this.gl.enableVertexAttribArray(this.colorAttribute);

      this.positionAttribute = gl.getAttribLocation(this.handle, "aPosition");
      this.gl.enableVertexAttribArray(this.positionAttribute);
   },

   /**
    * Returns the handle to the program
    * 
    * @return the handle to the program
    */
   getHandle: function()
   {
      return this.handle;
   },

   /**
    * Makes this shader program active
    */
   use: function()
   {
      this.gl.useProgram(this.handle);
   }
});

/**
 * Compiles and links a list of scripts to a shader program.
 * 
 * @param gl GL context
 * @param scriptProvider an array of provider containing at least { id, type, text } (which a typical <script> entry
 *           does
 * @return a program handle or null if failure
 */
upro.scene.ShaderProgram.compileAndLink = function(gl, scriptProvider)
{
   var shaderProgram = gl.createProgram();

   for ( var i = 0; i < scriptProvider.length; i++)
   {
      var object = upro.scene.ShaderProgram.compileScript(gl, scriptProvider[i]);

      gl.attachShader(shaderProgram, object);
   }

   gl.linkProgram(shaderProgram);
   if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS))
   {
      console.log("Shader Link Problem");
      shaderProgram = null;
   }

   return shaderProgram;
};

/**
 * Compiles a script from a provider. The type of the script must either be "x-shader/x-fragment" or
 * "x-shader/x-vertex".
 * 
 * @param gl GL context
 * @param scriptProvider one script provider. See compileAndLink()
 * @return a shader object handle, ready for linking into a program
 */
upro.scene.ShaderProgram.compileScript = function(gl, scriptProvider)
{
   var shader = null;

   if (scriptProvider.type === "x-shader/x-fragment")
   {
      shader = gl.createShader(gl.FRAGMENT_SHADER);
   }
   else if (scriptProvider.type === "x-shader/x-vertex")
   {
      shader = gl.createShader(gl.VERTEX_SHADER);
   }

   if (shader)
   {
      gl.shaderSource(shader, scriptProvider.text);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
      {
         console.log("Shader Compile Problem in '" + scriptProvider.id + "': " + gl.getShaderInfoLog(shader));
         shader = null;
      }
   }

   return shader;
};
