import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

export default {
  plugins: [babel({babelHelpers: 'bundled'}), terser()],
  input: 'src/server/index.js',
  output: [
    {
      file: 'dist/server/cjs/index.js',
      format: 'cjs',
      sourcemap: true,
      exports: 'named'
    },
    {
      file: `dist/server/index.js`,
      sourcemap: true,
      exports: 'named',
      format: 'esm'
    }
  ],
  external: ['react', 'react-dom']
};
