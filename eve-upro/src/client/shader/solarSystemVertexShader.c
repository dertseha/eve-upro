#ifdef GL_ES
precision highp float;
#endif

varying vec3 vColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

attribute vec3 aPosition;
attribute vec3 aColor;

void main(void)
{
   vec4 pos4 = uPMatrix * uMVMatrix * vec4(aPosition, 1.0);

   gl_Position = pos4;

   gl_PointSize = 64.0 / pos4.w;
   if (gl_PointSize > 24.0)
   {
      gl_PointSize = 24.0;
   }
   else if (gl_PointSize < 5.0)
   {
      gl_PointSize = 5.0;
   }
   vColor = aColor;
}
