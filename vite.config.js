import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";
import nodeResolve from "@rollup/plugin-node-resolve";

// https://vitejs.dev/guide/build.html#library-mode

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "lib/main.ts"),
            name: "database",
        },
        rollupOptions: {
            external: ["zod", "node:crypto"],
            plugins: [
                nodeResolve({
                    preferBuiltins: true,
                }),
            ],
        },
        minify: true,
    },
    plugins: [dts()],
});
