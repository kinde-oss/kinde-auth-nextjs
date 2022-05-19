import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";

export default {
  plugins: [babel({ babelHelpers: "bundled" }), terser()],
  input: "src/index.js",
  output: {
    file: "bundle.js",
    format: "esm",
  },
};
