import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import tsPlugin from "@rollup/plugin-typescript";

export default {
  plugins: [babel({ babelHelpers: "bundled" }), terser(), tsPlugin()],
  input: "src/middleware/index.js",
  output: [
    {
      file: "dist/middleware/cjs/index.js",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    {
      file: `dist/middleware/index.js`,
      sourcemap: true,
      exports: "named",
      format: "esm",
    },
  ],
  external: [
    "@kinde-oss/kinde-typescript-sdk",
    "next/server",
    "@kinde/jwt-decoder",
  ],
};
