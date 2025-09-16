import { Assets } from "../../assets"
import { assertImage, assertObject, assertString } from "../../validator"
import { createTextureFromImage } from "../../webgl/texture"
import BaseRainPainter from "./base-rain-painter"

const DIAMS_COUNT = 150

export default class RainPainter extends BaseRainPainter {
    private readonly texture: WebGLTexture

    constructor(gl: WebGLRenderingContext, assets: Assets) {
        super(gl)
        this.initializeData(DIAMS_COUNT)
        assertRainAssets(assets)
        this.texture = createTextureFromImage(gl, assets.diamTexture)
    }

    anim(time: number) {}

    protected actualDestroy() {
        const { gl } = this
        gl.deleteTexture(this.texture)
    }

    protected actualPaint(time: number): void {
        const { gl } = this
        gl.disable(gl.DEPTH_TEST)
        gl.enable(gl.BLEND)
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
        this.$uniSize(
            0.15 * Math.min(gl.drawingBufferWidth, gl.drawingBufferHeight)
        )
        this.$uniTime(time)
        this.$uniTexture(this.texture)
        gl.drawArrays(gl.POINTS, 0, DIAMS_COUNT)
    }

    private initializeData(count: number) {
        const data = RainPainter.createDataArray(DIAMS_COUNT)
        const min = 0.2
        const max = 1
        const depths: number[] = []
        for (let i = 0; i < DIAMS_COUNT; i++) {
            depths.push(min + (max - min) * Math.random())
        }
        depths.sort()
        let vertexIndex = 0
        for (const z of depths) {
            const radius = 2
            const x = radius * Math.random() - radius * 0.5
            const y = 10 * radius * Math.random()
            const w = 1 / z
            const speed = (2 + Math.random()) * 0.0001
            RainPainter.pokeData(
                data,
                vertexIndex++,
                x,
                y,
                z,
                w,
                speed, // Speed
                Math.random() // Index
            )
        }
        this.pushData(data)
    }
}

interface RainAssets {
    diamTexture: HTMLImageElement
}

function assertRainAssets(data: unknown): asserts data is RainAssets {
    assertObject(data)
    const { diamTexture } = data
    assertImage(diamTexture, "data.diamTexture")
}
