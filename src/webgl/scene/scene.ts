export interface Painter {
    paint(time: number): void
    anim(time: number): void
}

export default class Scene {
    public readonly gl: WebGLRenderingContext
    private painters: Painter[] = []
    private playing = false

    constructor(private readonly canvas: HTMLCanvasElement) {
        const gl = canvas.getContext("webgl")
        if (!gl) throw Error("Unable to create WebGL Context!")

        this.gl = gl
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                if (entry.target === canvas) {
                    const width = canvas.clientWidth
                    const height = canvas.clientHeight
                    this.resize(width, height)
                }
            }
        })
        observer.observe(canvas)
    }

    public setPainters(painters: Painter[]) {
        this.painters = painters
    }

    public paint = (time: number) => {
        for(const painter of this.painters) {
            painter.paint(time)
        }
        for(const painter of this.painters) {
            painter.anim(time)
        }
    }

    public play() {
        if(this.playing) return

        this.playing = true
        const animation = (time: number) => {
            this.paint(time)
            if(this.playing) window.requestAnimationFrame(animation)
        }
        window.requestAnimationFrame(animation)
    }

    public stop() {
        this.playing = false
    }

    public resize(width: number, height: number) {
        window.requestAnimationFrame(() => {
            const { gl, canvas } = this
            canvas.setAttribute("width", `${width}`)
            canvas.setAttribute("height", `${height}`)
            gl.viewport(0, 0, width, height)
        })
    }
}
