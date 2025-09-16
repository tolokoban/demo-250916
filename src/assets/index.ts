interface AssetsURLs {
    [id: string]: string
}

type Asset = HTMLImageElement | HTMLAudioElement | string

export interface Assets {
    [id: string]: Asset
}

export async function fetchAssets(
    assetsURLs: AssetsURLs,
    onProgress: (percentage: number) => void
): Promise<Assets> {
    const assets: Assets = {}
    onProgress(0)
    const ids = Object.keys(assetsURLs)
    let count = 0
    for (const id of ids) {
        count++
        onProgress(count / ids.length)
        const url = assetsURLs[id]
        const asset = await fetchAsset(url)
        if (asset) assets[id] = asset
    }
    onProgress(1)
    return assets
}

const loadedAudio = new Set<HTMLAudioElement>()

export async function fetchAsset(url: string): Promise<Asset | undefined> {
    return new Promise(async (resolve) => {
        try {
            if (hasExtension(url, "jpg", "png", "gif", "svg")) {
                const img = new Image()
                img.crossOrigin = "anonymous"
                img.onload = () => resolve(img)
                img.onerror = function (ex) {
                    console.error('Unable to load image "' + url + '":', url)
                    console.error(ex)
                    resolve(undefined)
                }
                img.src = url
            } else if (hasExtension(url, "ogg", "wav", "mp3")) {
                const audio = document.createElement("audio")
                const slot = function () {
                    if (loadedAudio.has(audio)) return

                    loadedAudio.add(audio)
                    resolve(audio)
                }
                audio.addEventListener("canplay", slot)
                audio.addEventListener("loadeddata", slot)
                window.setTimeout(slot, 3000)
                audio.addEventListener("error", function (ex) {
                    console.error('Unable to load sound "' + url + '":', url)
                    console.error(ex)
                    resolve(undefined)
                })
                audio.src = url
                console.log("Loading audio: ", url)
            } else {
                const response = await fetch(url)
                resolve(
                    hasExtension(url, "json")
                        ? response.json()
                        : response.text()
                )
            }
        } catch (ex) {
            console.error(`Unable to load "${url}"!`, ex)
            resolve(undefined)
        }
    })
}

function hasExtension(name: string, ...extensions: string[]): boolean {
    for (const ext of extensions) {
        if (name.endsWith(`.${ext}`)) return true
    }
    return false
}
