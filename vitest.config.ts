import { defineConfig } from 'vitest/config'; // if you are using a shared config, make sure to change this import from 'vite'


export default defineConfig({
  test: {
    environment: 'jsdom',
  }
});