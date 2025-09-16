import { Assets } from "./assets"
import Scene from "./webgl/scene"
import RainPainter from "./painters/rain"
import BackgroundPainter from "./painters/background"
import { assertImage } from "./validator"

export function startApplication(canvas: HTMLCanvasElement, assets: Assets) {
    assertAssets(assets)
    const scene = new Scene(canvas)
    scene.setPainters([
        new BackgroundPainter(scene.gl, assets.welcomeTexture),
        new RainPainter(scene.gl, assets),
    ])
    scene.play()
}

function assertAssets(data: {[key: string]: unknown}): asserts data is {
    diamTexture: HTMLImageElement,
    welcomeTexture: HTMLImageElement
} {
    assertImage(data.diamTexture, "data.diamTexture")
    assertImage(data.welcomeTexture, "data.welcomeTexture")
}