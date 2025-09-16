/**
 * This file has been generatged automatically on 2022-02-02T14:27:54.158Z
 * Please extends this abstract class to have it work.
*/
export default abstract class BasePainter {
    protected readonly prg: WebGLProgram
    protected readonly vertBuff: WebGLBuffer

    protected constructor(
        protected readonly gl: WebGLRenderingContext
    ) {
        const vertBuff = gl.createBuffer()
        if (!vertBuff) throw Error("Unable to create WebGL Buffer!")
    
        const prg = gl.createProgram()
        if (!prg) throw Error("Unable to create a WebGL Program!")
    
        const vertShader = createShader(gl, gl.VERTEX_SHADER, VERT)
        const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAG)
        gl.attachShader(prg, vertShader)
        gl.attachShader(prg, fragShader)
        gl.linkProgram(prg)    
        this.prg = prg
        this.vertBuff = vertBuff
    }

    public destroy() {
        const { gl, prg, vertBuff } = this
        gl.deleteBuffer( vertBuff )
        gl.deleteProgram( prg )
        this.actualDestroy()
    }

    public static createDataArray(vertexCount: number): Float32Array {
        return new Float32Array(vertexCount * 6)
    }

    public static pokeData(
        data: Float32Array,
        vertexIndex: number,
        attX: number,
        attY: number,
        attZ: number,
        attW: number,
        attSpeed: number,
        attIndex: number
    ) {
        let index = vertexIndex * 6
        data[index++] = attX,
        data[index++] = attY,
        data[index++] = attZ,
        data[index++] = attW,
        data[index++] = attSpeed,
        data[index++] = attIndex
    }

    public pushData(data: Float32Array) {
        const { gl, vertBuff } = this
        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuff)
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    }

    public $uniSize(value: number) {
        const { gl, prg } = this
        const location = gl.getUniformLocation(prg, "uniSize")
        gl.uniform1f(location, value)
    }
    
    public $uniTime(value: number) {
        const { gl, prg } = this
        const location = gl.getUniformLocation(prg, "uniTime")
        gl.uniform1f(location, value)
    }
    
    public $uniTexture(texture: WebGLTexture) {
        const { gl, prg } = this
        const location = gl.getUniformLocation(prg, "uniTexture")
        gl.activeTexture(gl.TEXTURE0)
        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.uniform1i(location, 0)
    }

    public paint(time: number) {
        const { gl, prg } = this
        gl.useProgram(prg)
        const BPE = Float32Array.BYTES_PER_ELEMENT
        const stride = 6 * BPE
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuff)
        // attX
        gl.enableVertexAttribArray(0)
        gl.vertexAttribPointer(0, 1, gl.FLOAT, false, stride, 0 * BPE)
        // attY
        gl.enableVertexAttribArray(1)
        gl.vertexAttribPointer(1, 1, gl.FLOAT, false, stride, 1 * BPE)
        // attZ
        gl.enableVertexAttribArray(2)
        gl.vertexAttribPointer(2, 1, gl.FLOAT, false, stride, 2 * BPE)
        // attW
        gl.enableVertexAttribArray(3)
        gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride, 3 * BPE)
        // attSpeed
        gl.enableVertexAttribArray(4)
        gl.vertexAttribPointer(4, 1, gl.FLOAT, false, stride, 4 * BPE)
        // attIndex
        gl.enableVertexAttribArray(5)
        gl.vertexAttribPointer(5, 1, gl.FLOAT, false, stride, 5 * BPE)
        this.actualPaint(time)
    }

    /**
     * This method should be called after all the painters have their
     * `paint()` method been called.
     * It deals with everything taking time and not drawing anything. 
     */
    public abstract anim(time: number): void
    
    protected abstract actualPaint(time: number): void
    
    protected abstract actualDestroy(): void
}

function createShader(gl: WebGLRenderingContext, type: number, code: string) {
    const shader = gl.createShader(type)
    if (!shader) throw Error("Unable to create WebGL Shader!")

    gl.shaderSource(shader, code)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log(code)
        console.error(
            "An error occurred compiling the shader: ",
            gl.getShaderInfoLog(shader)
        )
        throw Error(
            gl.getShaderInfoLog(shader) ??
                "Unknow error while compiling the shader!"
        )
    }
    return shader
}

const VERT = `precision mediump float;
uniform float uniTime;
uniform float uniSize;
attribute float attX;
attribute float attY;
attribute float attZ;
attribute float attW;
attribute float attSpeed;
attribute float attIndex;
varying float varU;
varying float varZ;
varying float varHueShift;
void main(){varZ=attZ;
varU=floor(mod(16.0*attIndex+uniTime*0.02,16.0))*0.0625;
varHueShift=attIndex*360.0;
float z=varZ;
float speed=attSpeed;
float y=sin(uniTime*speed+attY);
gl_Position=vec4(attX,y,attZ,attW);
gl_PointSize=uniSize/attW;}`

const FRAG = `precision mediump float;
uniform sampler2D uniTexture;
varying float varHueShift;
varying float varU;
varying float varZ;
vec4 rgb2hsl(vec4 color){float L=max(color.r,max(color.g,color.b));
float m=min(color.r,min(color.g,color.b));
float C=L-m;
float H=0.0;
if(C > 0.0){if(L==color.r){H=60.0*mod((color.g-color.b)/C,6.0);}else if(L==color.g){H=60.0*mod(2.0+(color.b-color.r)/C,6.0);}else{H=60.0*mod(4.0+(color.r-color.g)/C,6.0);}}float S=0.0;
if(L > 0.0){S=C/L;}return vec4(H,S,L,color.a);}vec4 hsl2rgb(vec4 color){float H=mod(color.x,360.0);
float S=color.y;
float L=color.z;
float C=L*S;
float X=C*(1.0-abs(mod(H/60.0,2.0)-1.0));
float R=0.0;
float G=0.0;
float B=0.0;
if(H < 180.0){if(H < 60.0){R=C;
G=X;}else if(H < 120.0){R=X;
G=C;}else{G=C;
B=X;}}else{if(H < 240.0){G=X;
B=C;}else if(H < 300.0){R=X;
B=C;}else{R=C;
B=X;}}float m=L-C;
return vec4(R+m,G+m,B+m,color.a);}void main(){vec4 color=texture2D(uniTexture,vec2(varU+gl_PointCoord.x*0.0625,gl_PointCoord.y));
if(color.a < 0.01)discard;
vec4 hsl=rgb2hsl(color);
hsl.x+=varHueShift;
hsl.z*=1.3*varZ;
vec4 rgb=hsl2rgb(hsl);
gl_FragColor=rgb;}`
