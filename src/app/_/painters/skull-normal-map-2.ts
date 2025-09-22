import {
    TgdContext,
    TgdDataGlb,
    TgdTexture2D,
    TgdPainterMeshGltf,
    TgdPainter,
    TgdPainterState,
    webglPresetDepth,
    TgdPainterGroup,
    TgdPainterClear,
    TgdPainterFramebuffer,
    TgdMaterialNormalMap,
    TgdPainterFilter,
    TgdFilterBlur,
    TgdTransfo,
    TgdFilter,
    tgdCodeFunction_vec3ToFloat01,
} from "@tolokoban/tgd"

import { animate } from "./animation"

export class PainterSkullNormalMap2 extends TgdPainter {
    public readonly texture: TgdTexture2D

    private readonly painter: TgdPainter
    private readonly transfo: TgdTransfo

    constructor(
        context: TgdContext,
        { textureDepth }: { textureDepth: TgdTexture2D }
    ) {
        super()
        const painterFilter = new TgdPainterFilter(context, {
            texture: textureDepth,
            filters: [
                new TgdFilter({
                    uniforms: {
                        uniPixelX: "float",
                        uniPixelY: "float",
                        uniScaleZ: "float",
                    },
                    extraFunctions: {
                        ...tgdCodeFunction_vec3ToFloat01(),
                    },
                    fragmentShaderCode: [
                        `float h = vec3ToFloat01(texture(uniTexture, varUV));`,
                        `float hL = vec3ToFloat01(texture(uniTexture, varUV - vec2(uniPixelX, 0)));`,
                        `float hR = vec3ToFloat01(texture(uniTexture, varUV + vec2(uniPixelX, 0)));`,
                        `float hT = vec3ToFloat01(texture(uniTexture, varUV - vec2(0, uniPixelX)));`,
                        `float hB = vec3ToFloat01(texture(uniTexture, varUV + vec2(0, uniPixelX)));`,
                        `vec3 vL = vec3(uniPixelX, h - hL);`,
                        `vec3 vR = vec3(-uniPixelX, h - hR);`,
                        `vec3 vT = vec3(0, uniPixelY, h - hT);`,
                        `vec3 vB = vec3(0, -uniPixelY, h - hB);`,
                        `vec3 normal = normalize(`,
                        [
                            `normalize(`,
                            [`length(vL) * vR + length(vR) * vL`],
                            "),",
                            `normalize(`,
                            [`length(vT) * vB + length(vB) * vT`],
                            ")",
                        ],
                        ");",
                        `normal.z = abs(normal.z);`,
                        `FragColor = vec4(`,
                        [`vec3(.5, .5, 1) * (vec3(0, 1, 1) + normal)`, "1.0"],
                        `);`,
                    ],
                    setUniforms: (parameters) => {
                        const { program } = parameters
                        program.uniform1f("uniPixelX", 1 / textureDepth.width)
                        program.uniform1f("uniPixelY", 1 / textureDepth.height)
                        program.uniform1f("uniScaleZ", 1)
                    },
                }),
            ],
        })

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
            viewportMatchingScale: 0.25,
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
            viewportMatchingScale: 0.25,
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
