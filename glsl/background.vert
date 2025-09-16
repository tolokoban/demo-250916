// Screen width and height.
uniform vec2 uniScreen;

attribute vec2 attPos;
attribute vec2 attUV;

varying vec2 varUV;

void main() {
    varUV = attUV;
    float side = max(uniScreen.x, uniScreen.y);
    float scaleX = side / uniScreen.x;
    float scaleY = side / uniScreen.y;
    gl_Position = vec4( attPos.x * scaleX, attPos.y * scaleY, 1.0, 1.0 );
}
