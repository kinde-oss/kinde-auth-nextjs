import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default {
  plugins: [babel({babelHelpers: 'bundled'}), terser()],
  input: './src/index.js',
  output: [
    {
      file: 'dist/cjs/index.js',
      format: 'esm',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: 'dist/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    }
  ],
  external: ['react', 'react-dom']
};
