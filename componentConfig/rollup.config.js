import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";
import tsPlugin from "@rollup/plugin-typescript";

export default {
  plugins: [babel({ babelHelpers: "bundled" }), terser(), tsPlugin()],
  input: "src/components/index.js",
  output: [
    {
      file: "dist/components/cjs/index.js",
      format: "cjs",
      sourcemap: true,
      exports: "named",
    },
    {
      file: `dist/components/index.js`,
      sourcemap: true,
      exports: "named",
      format: "esm",
    },
  ],
  external: ["react", "@kinde-oss/kinde-typescript-sdk"],
};
