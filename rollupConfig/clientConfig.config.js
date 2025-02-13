import packageJson from "../package.json" with { type: "json" };
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import tsPlugin from "@rollup/plugin-typescript";

export default {
  plugins: [babel({ babelHelpers: "bundled" }), terser(), tsPlugin()],
  input: "./src/index.ts",
  output: [
    {
      file: './dist/index.js',
      format: "esm",
      sourcemap: true,
      exports: "named",
    },
    {
      file: './dist/index.cjs.js',
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
  ],
  external: [
    "react",
    "react-dom",
    "@kinde-oss/kinde-typescript-sdk",
    "@kinde/jwt-decoder",
  ],
};
