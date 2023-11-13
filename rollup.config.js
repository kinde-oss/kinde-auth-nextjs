import packageJson from './package.json' assert {type: 'json'};
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import {nodeResolve} from '@rollup/plugin-node-resolve';
import dts from 'rollup-plugin-dts';

export default [
  {
    plugins: [babel({babelHelpers: 'bundled'}), terser()],
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
    external: [
      'react',
      'react-dom',
      'jwt-decode',
      '@kinde-oss/kinde-typescript-sdk'
    ]
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
    ],
    external: [
      'react',
      'jwt-decode',
      '@kinde-oss/kinde-typescript-sdk',
      'next/server',
      'next/navigation',
      'next/headers',
      'cookie'
    ]
  },
  {
    plugins: [babel({babelHelpers: 'bundled'}), terser()],
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
    external: ['react', 'react-dom', '@kinde-oss/kinde-typescript-sdk']
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
    ],
    external: ['next/server', 'jwt-decode', '@kinde-oss/kinde-typescript-sdk']
  },
  {
    input: './types.d.ts',
    output: [{file: 'dist/types.d.ts', format: 'esm'}],
    plugins: [dts()]
  },
  {
    input: './dist/types/index.d.ts',
    output: [{file: 'dist/index.d.ts', format: 'esm'}],
    plugins: [dts()]
  },
  {
    input: './dist/types/server/index.d.ts',
    output: [{file: 'dist/server/index.d.ts', format: 'esm'}],
    plugins: [dts()]
  },
  {
    input: './dist/types/components/index.d.ts',
    output: [{file: 'dist/components/index.d.ts', format: 'esm'}],
    plugins: [dts()]
  },
  {
    input: './dist/types/middleware/index.d.ts',
    output: [{file: 'dist/middleware/index.d.ts', format: 'esm'}],
    plugins: [dts()]
  }
];
