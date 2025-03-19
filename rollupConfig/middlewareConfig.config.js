import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import tsPlugin from "@rollup/plugin-typescript";

export default {
  plugins: [babel({ babelHelpers: "bundled" }), terser(), tsPlugin({
    tsconfig: "./tsconfig.json",
    declaration: true,
    declarationDir: "./dist/middleware" // Align with outDir
  })],
  input: "src/middleware/index.js",
  output: [
    {
      file: "./dist/middleware/index.cjs.js",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    {
      file: `./dist/middleware/index.js`,
      sourcemap: true,
      exports: "named",
      format: "esm",
    },
  ],
  external: [
    "@kinde-oss/kinde-typescript-sdk",
    "next/server.js",
    "@kinde/jwt-decoder",
    "@kinde/jwt-validator",
    "cookie",
    "next/headers.js",
    "next/dist/server/web/spec-extension/cookies.js"
  ],
};
