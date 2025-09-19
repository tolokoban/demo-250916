import {
    TgdPainter,
    TgdContext,
    TgdTexture2D,
    TgdDataset,
    TgdVertexArray,
    TgdProgram,
    TgdShaderVertex,
    TgdShaderFragment,
    TgdPainterState,
    webglPresetDepth,
    TgdPainterClear,
    tgdCodeFunction_vec3ToFloat01,
    tgdCodeFunction_mapRange,
} from "@tolokoban/tgd"

export class PainterBackground extends TgdPainter {
    private readonly clear: TgdPainterClear
    private readonly textureBackground: TgdTexture2D
    private readonly textureNormalMap: TgdTexture2D
    private readonly textureDepth: TgdTexture2D
    private readonly program: TgdProgram
    private readonly vao: TgdVertexArray
    private readonly count: number
    private readonly drawingMode: GLenum

    constructor(
        private readonly context: TgdContext,
        {
            background,
            normalMap,
            depth,
        }: {
            background: HTMLImageElement
            normalMap: TgdTexture2D
            depth: TgdTexture2D
        }
    ) {
        super()
        this.clear = new TgdPainterClear(context, {
            depth: 1,
        })
        this.textureNormalMap = normalMap
        this.textureDepth = depth
        const textureBackground = new TgdTexture2D(context).loadBitmap(
            background
        )
        this.textureBackground = textureBackground
        const prg = new TgdProgram(context.gl, {
            vert: new TgdShaderVertex({
                attributes: {
                    attPos: "vec2",
                    attUV1: "vec2",
                },
                varying: {
                    varPos: "vec2",
                    varUV1: "vec2",
                },
                mainCode: [
                    `varPos = attPos;`,
                    `varUV1 = attUV1;`,
                    `gl_Position = vec4(attPos, 1.0, 1.0);`,
                ],
            }).code,
            frag: new TgdShaderFragment({
                uniforms: {
                    uniTime: "float",
                    uniAspect: "vec2",
                    texDepth: "sampler2D",
                    texBackground: "sampler2D",
                    texNormals: "sampler2D",
                },
                varying: {
                    varPos: "vec2",
                    varUV1: "vec2",
                },
                outputs: {
                    FragColor: "vec4",
                },
                functions: {
                    ...tgdCodeFunction_mapRange(),
                    ...tgdCodeFunction_vec3ToFloat01(),
                },
                mainCode: [
                    `float MIN = 0.7;`,
                    `float MAX = 0.9;`,
                    `float offset = 1.0 - abs(sin(uniTime * 5.0));`,
                    // `offset = 0.0;`,
                    // Depth and normals.
                    `float depth = vec3ToFloat01(`,
                    [`texture(texDepth, varUV1).rgb`],
                    ");",
                    // `if (depth < MIN) {`,
                    // [`FragColor = vec4(1, 0, 0, 1);`, `return;`],
                    // "}",
                    // `if (depth > MAX) {`,
                    // [`FragColor = vec4(0, 1, 0, 1);`, `return;`],
                    // "}",
                    `float height = max(0.0, mapRange(depth, MIN, MAX, 1.0, 0.0) - offset);`,
                    `vec3 normal = texture(texNormals, varUV1).rgb;`,
                    `normal += vec3(-.5, -.5, 0);`,
                    `normal *= vec3(2, 2, 1);`,
                    `normal = normalize(normal);`,
                    // Change position according to height.
                    `vec2 pos = varPos;`,
                    `pos += height * normal.xy;`,
                    // Painting texture.
                    `vec2 uv = pos * uniAspect + vec2(0, .2 * uniTime);`,
                    `uv.y += pos.x > 0.0 ? .7 : 0.0;`,
                    `vec4 color = texture(texBackground, uv);`,
                    `FragColor = vec4(color.rgb, 1);`,
                    // Adding shadows.
                    `if (height > 0.0) {`,
                    [
                        `float light = 1.0 - pow(1.0 - normal.z, 2.0);`,
                        `light = .25 + .75 * light;`,
                        `FragColor.rgb *= light;`,
                    ],
                    "}",
                    // `FragColor = vec4(vec3(height), 1.0);`,
                ],
            }).code,
        })
        this.program = prg
        const dataset = new TgdDataset({
            attPos: "vec2",
            attUV1: "vec2",
            attUV2: "vec2",
        })
        const Z = 1e-9
        // prettier-ignore
        dataset.set("attPos", new Float32Array([
            -1, -1,
            -1, +1,
            -Z, -1,
            -Z, +1,
            +Z, -1,
            +Z, +1,
            +1, -1,
            +1, +1            
        ]))
        // prettier-ignore
        dataset.set("attUV1", new Float32Array([
            0, 0, 0, 1,
            .5, 0, .5, 1,
            .5, 0, .5, 1,
            1, 0, 1, 1
        ]))
        this.drawingMode = WebGL2RenderingContext.TRIANGLE_STRIP
        this.count = 8
        const vao = new TgdVertexArray(context.gl, prg, [dataset])
        this.vao = vao
    }

    delete(): void {
        this.textureBackground.delete()
        this.vao.delete()
        this.program.delete()
    }

    paint(time: number, delay: number): void {
        const {
            context,
            clear,
            program,
            vao,
            textureBackground,
            textureNormalMap,
            textureDepth,
            drawingMode,
            count,
        } = this
        const { gl, width, height } = context
        clear.paint()
        program.use()
        program.uniform1f("uniTime", time * 0.05)
        const backgroundAspect =
            textureBackground.width / textureBackground.height
        if (width < height) {
            // Portrait
            program.uniform2f("uniAspect", width / height, -backgroundAspect)
        } else {
            // Landscape
            program.uniform2f(
                "uniAspect",
                1,
                -(backgroundAspect * height) / width
            )
        }
        textureBackground.activate(0, program, "texBackground")
        textureNormalMap.activate(1, program, "texNormals")
        textureDepth.activate(2, program, "texDepth")
        vao.bind()
        TgdPainterState.do(
            {
                gl,
                depth: webglPresetDepth.lessOrEqual,
            },
            () => {
                gl.drawArrays(drawingMode, 0, count)
            }
        )
        vao.unbind()
    }
}
