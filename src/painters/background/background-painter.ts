import BaseBackgroundPainter from "./base-background-painter"
import { createTextureFromImage } from "../../webgl/texture"

export default class BackgroundPainter extends BaseBackgroundPainter {
    private readonly texture: WebGLTexture

    constructor(
        gl: WebGLRenderingContext,
        squareImage: HTMLImageElement | HTMLCanvasElement
    ) {
        super(gl)
        this.texture = createTextureFromImage(gl, squareImage)
        const data = BackgroundPainter.createDataArray(4)
        BackgroundPainter.pokeData(data, 0, -1, +1, 0, 0)
        BackgroundPainter.pokeData(data, 1, +1, +1, 1, 0)
        BackgroundPainter.pokeData(data, 2, -1, -1, 0, 1)
        BackgroundPainter.pokeData(data, 3, +1, -1, 1, 1)
        this.pushData(data)
    }

    anim(time: number) {}

    protected actualPaint(time: number): void {
        const { gl } = this
        const { width, height } = gl.canvas
        gl.disable(gl.BLEND)
        gl.disable(gl.DEPTH_TEST)
        this.$uniTexture(this.texture)
        this.$uniScreen(width, height)
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }

    protected actualDestroy(): void {
        const { gl } = this
        gl.deleteTexture(this.texture)
    }
}
