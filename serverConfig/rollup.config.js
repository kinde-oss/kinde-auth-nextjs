import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import tsPlugin from "@rollup/plugin-typescript";

export default {
  plugins: [babel({ babelHelpers: "bundled" }), terser(), tsPlugin()],
  input: "src/server/index.js",
  output: [
    {
      file: "dist/server/cjs/index.js",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    {
      file: `dist/server/index.js`,
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
  ],
};
