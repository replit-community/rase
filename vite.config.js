import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

// https://vitejs.dev/guide/build.html#library-mode

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, "lib/main.ts"),
            name: "rase",
        },
        rollupOptions: {
            external: ["zod"],
            plugins: [],
        },
        minify: true,
    },
    plugins: [dts()],
});
