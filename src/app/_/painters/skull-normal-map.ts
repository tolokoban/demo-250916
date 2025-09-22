import {
    TgdContext,
    TgdDataGlb,
    tgdLoadGlb,
    TgdTexture2D,
    TgdPainterMeshGltf,
    TgdPainter,
    TgdPainterState,
    webglPresetDepth,
    TgdPainterGroup,
    TgdPainterClear,
    TgdPainterFramebuffer,
    TgdMaterialNormalMap,
    TgdPainterFramebufferWithAntiAliasing,
    TgdPainterFilter,
    TgdFilterBlur,
    TgdTransfo,
} from "@tolokoban/tgd"

import URL from "@/assets/skull.glb"
import { animate } from "./animation"
import { viewportMatchingScale } from "./consts"

export class PainterSkullNormalMap extends TgdPainter {
    public readonly texture: TgdTexture2D

    private readonly painter: TgdPainter
    private readonly transfo: TgdTransfo

    constructor(context: TgdContext, { asset }: { asset: TgdDataGlb }) {
        super()
        const painterMesh = new TgdPainterMeshGltf(context, {
            asset,
            material: new TgdMaterialNormalMap(),
        })
        this.transfo = painterMesh.transfo
        const painterState = new TgdPainterState(context, {
            depth: webglPresetDepth.lessOrEqual,
            children: [painterMesh],
        })
        const painterGroup = new TgdPainterGroup([
            new TgdPainterClear(context, {
                color: [0.5, 0.5, 1, 1],
                depth: 1,
            }),
            painterState,
        ])
        const painterFramebuffer1 = new TgdPainterFramebuffer(context, {
            viewportMatchingScale,
            depthBuffer: true,
            textureColor0: new TgdTexture2D(context),
            children: [painterGroup],
        })
        if (!painterFramebuffer1.textureColor0) {
            throw new Error("No textureColor0 found in TgdPainterFramebuffer!")
        }
        const size = 2 // Blur size
        const painterFilter = new TgdPainterFilter(context, {
            texture: painterFramebuffer1.textureColor0,
            filters: [
                new TgdFilterBlur({
                    size,
                    direction: 0,
                }),
                new TgdFilterBlur({
                    size,
                    direction: 90,
                }),
            ],
            flipY: true,
        })
        const painterFramebuffer2 = new TgdPainterFramebuffer(context, {
            viewportMatchingScale,
            depthBuffer: false,
            textureColor0: new TgdTexture2D(context),
            children: [painterFilter],
        })
        if (!painterFramebuffer2.textureColor0) {
            throw new Error("No textureColor0 found in TgdPainterFramebuffer!")
        }
        this.texture = painterFramebuffer2.textureColor0
        this.painter = new TgdPainterGroup([
            painterFramebuffer1,
            painterFramebuffer2,
        ])
    }

    delete(): void {
        this.painter.delete()
    }

    paint(time: number, delay: number): void {
        animate(this.transfo, time)
        this.painter.paint(time, delay)
    }
}
