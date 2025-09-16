import Package from "./package.json" with { "type": "json" }
import Path from "path"
import FS from "fs"
import HtmlWebpackPlugin from "html-webpack-plugin"
import CopyPlugin from "copy-webpack-plugin"
import { CleanWebpackPlugin } from "clean-webpack-plugin"
import remarkImages from "remark-images"
import remarkEmoji from "remark-emoji"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import rehypeHighlightCodeLines from "rehype-highlight-code-lines"
import highlightJs from "highlight.js"
import WebpackShellPluginNext from "webpack-shell-plugin-next"
import MiniCssExtractPlugin from "mini-css-extract-plugin"
import Webpack from "webpack"
import path from "path"

const __dirname = path.dirname(new URL(import.meta.url).pathname)

export default env => {
    if (typeof Package.port !== "number") {
        // Define a random port number for dev server.
        Package.port = 1204 + Math.floor(Math.random() * (0xffff - 1024))
        FS.writeFileSync(
            Path.resolve(__dirname, "package.json"),
            JSON.stringify(Package, null, "    ")
        )
        console.log("A random port has been set for dev server:", Package.port)
    }

    const isProdMode = env.WEBPACK_BUILD === true
    if (isProdMode) {
        console.log("+-----------------+")
        console.log("| Production Mode |")
        console.log("+-----------------+")
    }
    return {
        cache: false,
        // cache: {
        //     type: "memory",
        // },
        output: {
            filename: "scr/[name].[contenthash].js",
            path: Path.resolve(__dirname, "build"),
            devtoolModuleFilenameTemplate: "[absolute-resource-path]",
        },
        watchOptions: {
            aggregateTimeout: 600,
        },
        entry: {
            app: "./src/index.tsx",
        },
        target: "web",
        resolve: {
            extensions: [".tsx", ".ts", ".js", ".jsx", ".wasm"],
            enforceExtension: false,
            alias: {
                "@": Path.resolve(__dirname, "src/"),
            },
        },
        devtool: isProdMode ? false : "inline-source-map",
        devServer: {
            compress: true,
            historyApiFallback: true,
            static: {
                directory: Path.resolve(__dirname, "./public"),
            },
            client: {
                logging: "none",
                overlay: { errors: false, warnings: false },
                progress: true,
            },
            hot: true,
            // Open WebBrowser.
            open: true,
            host: "0.0.0.0",
            port: env.PORT || Package.port,
            server: "http",
        },
        stats: {
            colors: true,
            errorDetails: false,
        },
        plugins: [
            new Webpack.ProgressPlugin(),
            new WebpackShellPluginNext({
                onBeforeCompile:{
                  scripts: ['npm run generate'],
                  blocking: true,
                  parallel: false
                },
              }),
            // // List of the needed files for later caching.
            // new WebpackManifestPlugin({
            //     filter: (file) => {
            //         if (file.name.endsWith(".map")) return false
            //         if (file.name.endsWith(".ts")) return false
            //         return true
            //     },
            // }),
            new CleanWebpackPlugin({
                // We don't want to remove the "index.html" file
                // after the incremental build triggered by watch.
                cleanStaleWebpackAssets: false,
            }),
            new CopyPlugin({
                patterns: [
                    {
                        from: Path.resolve(__dirname, "public"),
                        filter: async path => {
                            // Allow non-root index.html to be copied verbatim.
                            return !path.endsWith("/public/index.html")
                        },
                    },
                ],
            }),
            new HtmlWebpackPlugin({
                template: "public/index.html",
                filename: "index.html",
                version: Package.version,
                title: "Tolokoban",
                minify: {
                    collapseInlineTagWhitespace: isProdMode,
                    collapseWhitespace: isProdMode,
                    decodeEntities: isProdMode,
                    minifyCSS: isProdMode,
                    removeComments: isProdMode,
                },
            }),
            new MiniCssExtractPlugin(),
        ],
        performance: {
            hints: "warning",
            maxAssetSize: 300000,
            maxEntrypointSize: 200000,
            assetFilter: filename => {
                // PNG are just fallbacks for WEBP images.
                if (filename.endsWith(".png")) return false
                if (filename.endsWith(".map")) return false
                return true
            },
        },
        optimization: {
            splitChunks: {
                chunks: "all",
                cacheGroups: {
                    defaultVendors: {
                        test: /[\\/]node_modules[\\/]/,
                        priority: -10,
                        reuseExistingChunk: true,
                    },
                    default: {
                        minChunks: 2,
                        priority: -20,
                        reuseExistingChunk: true,
                    },
                },
            },
            // Prevent "libs.[contenthash].js" from changing its hash if not needed.
            moduleIds: "deterministic",
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: "ts-loader",
                            options: {
                                transpileOnly: false,
                            },
                        },
                    ],
                    exclude: /node_modules/,
                },
                // {
                //     test: /\.tsx?$/,
                //     loader: "esbuild-loader",
                //     options: {
                //       loader: "tsx", // Or 'ts' if you don't need tsx
                //       target: "es2015",
                //     },
                // },          
                {
                    test: /\.(png|jpe?g|gif|webp|avif|svg)$/i,
                    // More information here https://webpack.js.org/guides/asset-modules/
                    type: "asset",
                    generator: {
                        filename: "img/[name].[hash][ext][query]",
                    },
                },
                {
                    test: /\.(bin|glb|dat|swc)$/i,
                    // More information here https://webpack.js.org/guides/asset-modules/
                    type: "asset",
                    generator: {
                        filename: "bin/[name].[hash][ext][query]",
                    },
                },
                {
                    test: /\.(eot|ttf|woff|woff2)$/i,
                    // More information here https://webpack.js.org/guides/asset-modules/
                    type: "asset/resource",
                    generator: {
                        filename: "fnt/[name].[hash][ext][query]",
                    },
                },
                {
                    test: /\.(vert|frag|obj)$/i,
                    // More information here https://webpack.js.org/guides/asset-modules/
                    type: "asset/source",
                },
                {
                    test: /\.(py|txt|sh|md)$/i,
                    // More information here https://webpack.js.org/guides/asset-modules/
                    type: "asset/source",
                },
                {
                    test: /\.css$/,
                    use: [
                        // {
                        //     loader: "style-loader",
                        //     options: {
                        //         injectType: "styleTag",
                        //     },
                        // },
                        { loader: MiniCssExtractPlugin.loader, options: {} },
                        {
                            loader: "css-loader",
                            options: {
                                modules: {
                                    auto: true,
                                    namedExport: false,
                                    localIdentName: isProdMode
                                        ? "[hash:base64]"
                                        : "[path][name]_[local]_[hash:base64:6]",
                                },
                            },
                        },
                    ],
                },
                // If you need MDX:
                // {
                //     test: /\.mdx?$/,
                //     use: [
                //         // `babel-loader` is optional:
                //         { loader: "babel-loader", options: {} },
                //         {
                //             loader: "@mdx-js/loader",
                //             /** @type {import('@mdx-js/loader').Options} */
                //             options: {
                //                 rehypePlugins: [[rehypeHighlight, {
                //                     languages: {
                //                         ts: ()=>highlightJs.getLanguage("ts"),
                //                         glsl: ()=>highlightJs.getLanguage("glsl"),
                //                     }
                //                 }], rehypeHighlightCodeLines],
                //                 remarkPlugins: [remarkImages, remarkEmoji, remarkGfm],
                //                 providerImportSource: "@mdx-js/react",
                //             },
                //         },
                //     ],
                // },
            ],
        },
    }
}
