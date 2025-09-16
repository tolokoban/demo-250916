/**
 * This file has been generatged automatically on 2022-02-02T14:25:53.468Z
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
        return new Float32Array(vertexCount * 4)
    }

    public static pokeData(
        data: Float32Array,
        vertexIndex: number,
        attPos_X: number,
        attPos_Y: number,
        attUV_X: number,
        attUV_Y: number
    ) {
        let index = vertexIndex * 4
        data[index++] = attPos_X,
        data[index++] = attPos_Y,
        data[index++] = attUV_X,
        data[index++] = attUV_Y
    }

    public pushData(data: Float32Array) {
        const { gl, vertBuff } = this
        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuff)
        gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)
    }

    public $uniScreen(x: number, y: number) {
        const { gl, prg } = this
        const location = gl.getUniformLocation(prg, "uniScreen")
        gl.uniform2f(location, x, y)
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
        const stride = 4 * BPE
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertBuff)
        // attPos
        gl.enableVertexAttribArray(0)
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, stride, 0 * BPE)
        // attUV
        gl.enableVertexAttribArray(1)
        gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 2 * BPE)
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

const VERT = `uniform vec2 uniScreen;
attribute vec2 attPos;
attribute vec2 attUV;
varying vec2 varUV;
void main(){varUV=attUV;
float side=max(uniScreen.x,uniScreen.y);
float scaleX=side/uniScreen.x;
float scaleY=side/uniScreen.y;
gl_Position=vec4(attPos.x*scaleX,attPos.y*scaleY,1.0,1.0);}`

const FRAG = `precision mediump float;
uniform sampler2D uniTexture;
varying vec2 varUV;
void main(){vec3 color=texture2D(uniTexture,varUV).rgb;
gl_FragColor=vec4(color,1.0);}`
