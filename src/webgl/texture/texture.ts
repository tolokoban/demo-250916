export function createTexture(gl: WebGLRenderingContext): WebGLTexture {
    const tex = gl.createTexture()
    if (!tex) throw Error("Unable to create WebGL texture!")

    return tex
}

export function createTextureFromImage(
    gl: WebGLRenderingContext,
    img: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement
): WebGLTexture {
    const tex = createTexture(gl)
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    return tex
}

export function textureClampToEdge(
    gl: WebGLRenderingContext,
    tex: WebGLTexture
) {
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
}

export function textureClampToEdgeHorizontal(
    gl: WebGLRenderingContext,
    tex: WebGLTexture
) {
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
}

export function textureClampToEdgeVertical(
    gl: WebGLRenderingContext,
    tex: WebGLTexture
) {
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
}

export function textureRepeat(gl: WebGLRenderingContext, tex: WebGLTexture) {
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
}

export function textureRepeatHorizontal(
    gl: WebGLRenderingContext,
    tex: WebGLTexture
) {
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT)
}

export function textureRepeatVertical(
    gl: WebGLRenderingContext,
    tex: WebGLTexture
) {
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT)
}
