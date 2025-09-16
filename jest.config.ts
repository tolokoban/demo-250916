import type { Config } from '@jest/types'
import FS from 'fs'
import { defaults as Defaults } from 'jest-config'
import Path from 'path'

export default async (): Promise<Config.InitialOptions> => {
    const cfg: Config.InitialOptions = {
        ...Defaults,
        haste: undefined,
        moduleNameMapper: {
            "\\.(css|less)$": "identity-obj-proxy"
        },
        resetModules: true,
        rootDir: __dirname,
        roots: [
            "<rootDir>/src"
        ],
        testMatch: [
            "**/__tests__/**/*.+(ts|tsx|js)",
            "**/?(*.)+(spec|test).+(ts|tsx|js)"
        ],
        timers: 'real',
        transform: {
            "^.+\\.(ts|tsx)$": "ts-jest"
        },
        moduleDirectories: [
            "node_modules",
            "../../lib/tp/dist"
        ],
        verbose: false
    }

    FS.writeFileSync(
        Path.join(__dirname, "jest.config.json"),
        JSON.stringify(cfg, null, "    ")
    )
    return cfg
}
