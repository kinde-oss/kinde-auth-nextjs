const packageJson = require('./package.json');

import babel from '@rollup/plugin-babel';
import {terser} from 'rollup-plugin-terser';
import tsPlugin from '@rollup/plugin-typescript';

export default {
  plugins: [babel({babelHelpers: 'bundled'}), terser(), tsPlugin()],
  input: './src/index.ts',
  output: [
    {
      file: packageJson.module,
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: packageJson.main,
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    }
  ],
  external: [
    'react',
    'react-dom',
    '@kinde-oss/kinde-typescript-sdk',
    '@kinde/jwt-decoder'
  ]
};
