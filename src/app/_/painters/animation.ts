import { TgdTransfo } from "@tolokoban/tgd"

export function animate(transfo: TgdTransfo, time: number) {
    const degX = Math.sin(time) * 20
    const degY = Math.sin(time * 0.715) * 20
    const degZ = 0
    transfo.setEulerRotation(degX, degY, degZ)
}
