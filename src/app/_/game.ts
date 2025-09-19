import {
    tgdActionCreateCameraInterpolation,
    tgdCalcDegToRad,
    TgdCameraPerspective,
    TgdContext,
    TgdControllerCameraOrbit,
    tgdEasingFunctionOutBack,
    TgdGeometryBox,
    TgdMaterialNormals,
    TgdPainterClear,
    TgdPainterMesh,
    TgdPainterState,
    TgdQuat,
    webglPresetDepth,
} from "@tolokoban/tgd"
import { PainterSkullNormalMap } from "./painters/skull-normal-map"
import { PainterBackground } from "./painters/background"
import { useAssets } from "@/assets"
import { PainterSkullDepth } from "./painters/skull-depth"

export function useGameHandler() {
    const assets = useAssets()
    return (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return

        const camera = new TgdCameraPerspective({
            transfo: {
                distance: 3,
                position: [0, 0, 0],
            },
            far: 5,
            near: 1,
            fovy: Math.PI / 4,
        })
        const context = new TgdContext(canvas, { camera })
        const skullNormalMap = new PainterSkullNormalMap(context, {
            asset: assets.glb.skull,
        })
        const skullDepth = new PainterSkullDepth(context, {
            asset: assets.glb.skull,
        })
        const background = new PainterBackground(context, {
            background: assets.img.background,
            normalMap: skullNormalMap.texture,
            depth: skullDepth.texture,
        })
        context.add(skullNormalMap, skullDepth, background)
        context.play()

        new TgdControllerCameraOrbit(context, {
            geo: {
                minLat: tgdCalcDegToRad(-20),
                maxLat: tgdCalcDegToRad(+20),
                minLng: tgdCalcDegToRad(-60),
                maxLng: tgdCalcDegToRad(+60),
            },
            inertiaOrbit: 3000,
        })
    }
}
