import babel from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';

export default {
  plugins: [babel({babelHelpers: 'bundled'}), terser()],
  input: 'src/server/index.js',
  output: [
    {
      file: 'dist/server/kinde-auth-nextjs.cjs.js',
      format: 'cjs'
    },
    {
      file: 'dist/server/kinde-auth-nextjs.esm.js',
      format: 'es',
      sourcemap: true
    }
  ]
};
