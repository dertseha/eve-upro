/**
 * A vertex buffer segment is the storage of vertex and color
 * data using GL arrays.
 * It is present to help segmenting large buffers as WebGL has some
 * limits regarding array sizes.
 *
 * See http://stackoverflow.com/questions/6527791/webgl-buffer-size-limit et al.
 */
upro.scene.VertexBufferSegment = Class.create(
{
   initialize: function()
   {
      this.vertexBuffer = null;
      this.colorBuffer = null;
   },

   create: function(gl)
   {
      this.destroy(gl);
      this.vertexBuffer = gl.createBuffer();
      this.colorBuffer = gl.createBuffer();
   },

   update: function(gl, vertices, colors, from, to)
   {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices.slice(from * 3, to * 3)), gl.STATIC_DRAW);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors.slice(from * 4, to * 4)), gl.STATIC_DRAW);

      this.size = to - from;
   },

   destroy: function(gl)
   {
      if (this.vertexBuffer)
      {
         gl.deleteBuffer(this.vertexBuffer);
         this.vertexBuffer = null;
      }
      if (this.colorBuffer)
      {
         gl.deleteBuffer(this.colorBuffer);
         this.colorBuffer = null;
      }
   },

   select: function(gl, shader)
   {
      gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
      gl.vertexAttribPointer(shader.positionAttribute, 3, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
      gl.vertexAttribPointer(shader.colorAttribute, 4, gl.FLOAT, false, 0, 0);
   }
});
