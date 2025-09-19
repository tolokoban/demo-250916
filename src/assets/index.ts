import React from "react"
import { TgdDataGlb, tgdLoadAssets } from "@tolokoban/tgd"

import GridURL from "@/assets/grid.glb"
import SkullURL from "@/assets/skull.glb"
import BackgroundURL from "@/assets/background.webp"

export interface Assets {
    glb: {
        grid: TgdDataGlb
        skull: TgdDataGlb
    }
    img: {
        background: HTMLImageElement
    }
}

export function loadAssets(): Promise<Assets> {
    return tgdLoadAssets({
        glb: {
            grid: GridURL,
            skull: SkullURL,
        },
        img: {
            background: BackgroundURL,
        },
    })
}

export const ContextAssets = React.createContext<Assets | null>(null)

export function useAssets(): Assets {
    const assets = React.useContext(ContextAssets)
    if (!assets) {
        throw new Error("Assets have not been loaded yet!")
    }
    return assets
}
