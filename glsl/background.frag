precision mediump float;

uniform sampler2D uniTexture;
varying vec2 varUV;

void main() {
  vec3 color = texture2D( uniTexture, varUV ).rgb;
  gl_FragColor = vec4( color, 1.0 );
}
