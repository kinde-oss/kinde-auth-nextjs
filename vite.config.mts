import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";
import { resolve } from "path";
import preserveDirectives from "rollup-plugin-preserve-directives";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ["src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx"],
      outDir: "dist/types",
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        components: resolve(__dirname, "src/components/index.js"),
        server: resolve(__dirname, "src/server/index.js"),
        middleware: resolve(__dirname, "src/middleware/index.js"),
        app: resolve(__dirname, "src/app/index.ts"),
        "app-server": resolve(__dirname, "src/app/server/index.ts"),
        pages: resolve(__dirname, "src/pages/index.ts"),
        "pages-server": resolve(__dirname, "src/pages/server/index.ts"),
      },
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        /^@kinde-oss\/kinde-auth-react(\/.*)?$/,
        "@kinde-oss/kinde-typescript-sdk",
        "@kinde/jwt-decoder",
        "@kinde/jwt-validator",
        "@kinde/js-utils",
        "cookie",
        "destr",
        "next/dist/server/web/spec-extension/cookies",
        "next/headers",
        "next/navigation",
        "next/server",
        "react",
        "react-dom",
        "react/jsx-dev-runtime",
        "react/jsx-runtime",
      ],
      output: {
        preserveModules: true,
        dir: "dist",
      },
      plugins: [preserveDirectives()],
      onwarn: ({ code, message }) => {
        // See https://github.com/Ephem/rollup-plugin-preserve-directives?tab=readme-ov-file#rollup-warning
        if (code === "MODULE_LEVEL_DIRECTIVE") {
          return;
        }
        console.warn(message);
      },
    },
  },
  resolve: {
    extensions: [".js", ".jsx", ".ts", ".tsx"],
  },
});
