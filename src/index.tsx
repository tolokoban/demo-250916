import React from "react"
import { createRoot } from "react-dom/client"

import State from "@/state"

import App from "./app"
import FontDosis from "./fonts/dosis"

import "./index.css"
import { ContextAssets, loadAssets } from "./assets"

async function start() {
    const promiseFonts = Promise.all([FontDosis.load300(), FontDosis.load700()])
    await promiseFonts
    console.log("Fonts loaded!")
    const assets = await loadAssets()
    console.log("Assets loaded!")
    const container = document.getElementById("app")
    if (!container) throw Error("Missing element with id #app!")
    createRoot(container).render(
        <ContextAssets.Provider value={assets}>
            <MainPage />
        </ContextAssets.Provider>
    )
    const splash = document.getElementById("tgd-logo")
    if (splash) {
        splash.classList.add("vanish")
        window.setTimeout(() => splash.parentNode?.removeChild(splash), 1000)
    }
}

function MainPage() {
    const lang = State.language.useValue()
    return <App lang={lang} />
}

start()
