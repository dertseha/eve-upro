varying vec4 vColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;

attribute vec3 aPosition;
attribute vec4 aColor;

void main(void)
{
   vec4 pos4 = uPMatrix * uMVMatrix * vec4(aPosition, 1.0);

   gl_Position = pos4;

   gl_PointSize = 1.0;
   vColor = aColor;
}
