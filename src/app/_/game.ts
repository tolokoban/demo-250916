import {
    tgdActionCreateCameraInterpolation,
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

export function useGameHandler() {
    return (canvas: HTMLCanvasElement | null) => {
        if (!canvas) return

        const camera = new TgdCameraPerspective({
            transfo: {
                distance: 3,
                position: [0, 0, 0],
            },
            far: 1000,
            near: 0.1,
            fovy: Math.PI / 4,
            zoom: 0.1,
        })
        const context = new TgdContext(canvas, { camera })
        const state = new TgdPainterState(context, {
            depth: webglPresetDepth.lessOrEqual,
            children: [
                new TgdPainterClear(context, {
                    color: [0, 0, 0, 1],
                    depth: 1,
                }),
            ],
        })
        context.add(state)
        const geometry = new TgdGeometryBox()
        const material = new TgdMaterialNormals()
        const mesh = new TgdPainterMesh(context, {
            geometry,
            material,
        })
        state.add(mesh)
        context.animSchedule({
            action: tgdActionCreateCameraInterpolation(context.camera, {
                zoom: 1,
                orientation: new TgdQuat()
                    .face("+Y+Z+X")
                    .rotateAroundX(Math.random())
                    .rotateAroundY(Math.random()),
            }),
            duration: 1.5,
            easingFunction: tgdEasingFunctionOutBack,
            onEnd() {
                new TgdControllerCameraOrbit(context, {
                    inertiaOrbit: 900,
                })
            },
        })
        context.paint()
    }
}
