import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';
import preserveDirectives from 'rollup-plugin-preserve-directives';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js', 'src/**/*.jsx'],
      outDir: 'dist/types',
    }),
  ],
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        components: resolve(__dirname, 'src/components/index.js'),
        server: resolve(__dirname, 'src/server/index.js'),
        middleware: resolve(__dirname, 'src/middleware/index.js'),
      },
      fileName: (format, entryName) => `${entryName}.${format}.js`,
      formats: ['es', 'cjs'],
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'next/server',
        'next/navigation',
        'next/headers',
        '@kinde-oss/kinde-typescript-sdk',
        '@kinde/jwt-decoder',
        '@kinde/jwt-validator',
        'next/dist/server/web/spec-extension/cookies',
        'cookie',
        "react/jsx-runtime", 
        "react/jsx-dev-runtime"
      ],
      output: {
        preserveModules: true,
        
        dir: 'dist',
      },
      plugins: [preserveDirectives()],
    },
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
});