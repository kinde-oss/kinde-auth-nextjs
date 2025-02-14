import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import tsPlugin from "@rollup/plugin-typescript";

export default {
  plugins: [babel({ babelHelpers: "bundled" }), terser(), tsPlugin({
    tsconfig: "./tsconfig.json",
    declarationDir: "./dist/server" // Align with outDir
  })],
  input: "src/server/index.js",
  output: [
    {
      file: "./dist/server/index.cjs.js",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    {
      file: `./dist/server/index.js`,
      sourcemap: true,
      exports: "named",
      format: "esm",
    },
  ],
  external: [
    "next/server",
    "next/navigation",
    "next/headers",
    "react",
    "@kinde-oss/kinde-typescript-sdk",
    "@kinde/jwt-decoder",
    "@kinde/jwt-validator",
    "next/dist/server/web/spec-extension/cookies",
    "cookie",
  ],
};
