import { defineConfig } from "vite";
import { resolve } from "path";

// Separate config for middleware that bundles everything into a single file
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/middleware/index.js"),
      name: "KindeMiddleware",
      fileName: "middleware",
      formats: ["es", "cjs"],
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "next/server",
        "next/navigation",
        "next/headers",
        "@kinde-oss/kinde-typescript-sdk",
        "@kinde/jwt-decoder",
        "@kinde/jwt-validator",
        "next/dist/server/web/spec-extension/cookies",
        "cookie",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
      output: {
        // Don't preserve modules for middleware - bundle everything into a single file
        preserveModules: false,
        dir: "dist",
        entryFileNames: "middleware.[format].js",
      },
      onwarn: ({ code, message }) => {
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
