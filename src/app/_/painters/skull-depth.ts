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
    TgdMaterialDepth,
    TgdPainterFramebufferWithAntiAliasing,
    TgdTransfo,
} from "@tolokoban/tgd"

import URL from "@/assets/skull.glb"
import { animate } from "./animation"

export class PainterSkullDepth extends TgdPainter {
    public readonly texture: TgdTexture2D

    private readonly painter: TgdPainter

    private readonly transfo: TgdTransfo

    constructor(context: TgdContext, { asset }: { asset: TgdDataGlb }) {
        super()
        const painterMesh = new TgdPainterMeshGltf(context, {
            asset,
            material: new TgdMaterialDepth(),
        })
        this.transfo = painterMesh.transfo
        const painterState = new TgdPainterState(context, {
            depth: webglPresetDepth.lessOrEqual,
            children: [painterMesh],
        })
        const painterGroup = new TgdPainterGroup([
            new TgdPainterClear(context, {
                color: [1, 1, 1, 1],
                depth: 1,
            }),
            painterState,
        ])
        const painterFramebuffer = new TgdPainterFramebuffer(context, {
            viewportMatchingScale: 1,
            depthBuffer: true,
            textureColor0: new TgdTexture2D(context),
            children: [painterGroup],
        })
        if (!painterFramebuffer.textureColor0) {
            throw new Error("No textureColor0 found in TgdPainterFramebuffer!")
        }

        this.texture = painterFramebuffer.textureColor0
        this.painter = painterFramebuffer
    }

    delete(): void {
        this.painter.delete()
    }

    paint(time: number, delay: number): void {
        animate(this.transfo, time)
        this.painter.paint(time, delay)
    }
}
