#ifdef GL_ES
precision highp float;
#endif

uniform sampler2D texture;

varying vec3 vColor;
uniform vec3 uColor;

vec3 red = vec3(1.0, 0.0, 0.0);
vec3 yellow = vec3(1.0, 1.0, 0.0);
vec3 green = vec3(0.0, 1.0, 0.0);

void main(void)
{
   vec4 texel = texture2D( texture, gl_PointCoord );
   vec3 color;
   float pointFiveFudge = 0.00001; // 0.5 is not always 0.5 it seems

   if ((vColor.r + pointFiveFudge) < 0.5)
   {
      color = red;
      color = mix(color, yellow, vColor.r);
   }
   else
   {
      color = yellow;
      color = mix(color, green, ((vColor.r - 0.5) * 2.0));
   }
   gl_FragColor = vec4( mix( texel.rgb, color, 1.0 ), texel.a);
}
