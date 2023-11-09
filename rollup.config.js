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
  },
  {
    plugins: [babel({babelHelpers: 'bundled'}), terser()],
    input: 'src/server/index.js',
    output: [
      {
        file: 'dist/server/index.js',
        format: 'esm',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/server/cjs/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      }
    ]
  },
  {
    plugins: [babel({babelHelpers: 'bundled'}), terser(), nodeResolve()],
    input: 'src/components/index.js',
    output: [
      {
        file: 'dist/components/index.js',
        format: 'esm',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/components/cjs/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      }
    ],
    external: ['react', 'react-dom']
  },
  {
    plugins: [babel({babelHelpers: 'bundled'}), terser()],
    input: 'src/middleware/index.js',
    output: [
      {
        file: 'dist/middleware/index.js',
        format: 'esm',
        sourcemap: true,
        exports: 'named'
      },
      {
        file: 'dist/middleware/cjs/index.js',
        format: 'cjs',
        sourcemap: true,
        exports: 'named'
      }
    ]
  }
];
