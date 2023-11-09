import packageJson from './package.json' assert {type: 'json'};
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import {nodeResolve} from '@rollup/plugin-node-resolve';

export default [
  {
    plugins: [babel({babelHelpers: 'bundled'}), terser(), nodeResolve()],
    input: 'src/index.js',
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
    external: ['react', 'react-dom']
  }
];
