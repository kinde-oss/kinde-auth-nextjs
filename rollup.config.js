import clientConfig from './clientConfig/rollup.config.js';
import serverConfig from './serverConfig/rollup.config.js';
import componentsConfig from './componentsConfig/rollup.config.js';
import {dts} from 'rollup-plugin-dts';

export default [
  clientConfig,
  serverConfig,
  componentsConfig,
  {
    input: './types.d.ts',
    output: [{file: 'dist/types.d.ts', format: 'es'}],
    plugins: [dts()]
  },
  {
    input: './dist/types/index.d.ts',
    output: [{file: 'dist/index.d.ts', format: 'es'}],
    plugins: [dts()]
  },
  {
    input: './dist/types/server/index.d.ts',
    output: [{file: 'dist/server/index.d.ts', format: 'es'}],
    plugins: [dts()]
  },
  {
    input: './dist/types/components/index.d.ts',
    output: [{file: 'dist/components/index.d.ts', format: 'es'}],
    plugins: [dts()]
  }
];
