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
  }
];
