import Dosis2 from "./dosis-2.woff2"
import Dosis5 from "./dosis-5.woff2"
import "../dosis.css"

export default {
    name: "dosis",
    load300(): Promise<FontFace> {
        const font = new FontFace("dosis", `url(${Dosis2})`, {
            display: "swap",
            style: "normal",
            weight: "300",
            unicodeRange:
                "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
        })
        return font.load()
    },
    load700(): Promise<FontFace> {
        const font = new FontFace("dosis", `url(${Dosis5})`, {
            display: "swap",
            style: "normal",
            weight: "700",
            unicodeRange:
                "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD",
        })
        return font.load()
    },
}
