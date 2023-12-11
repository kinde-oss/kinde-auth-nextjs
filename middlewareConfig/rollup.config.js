import babel from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';

export default {
  plugins: [babel({babelHelpers: 'bundled'}), terser()],
  input: 'src/middleware/index.js',
  output: [
    {
      file: 'dist/middleware/cjs/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: `dist/middleware/index.js`,
      sourcemap: true,
      exports: 'named',
      format: 'esm'
    }
  ]
};
