import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 8081,
    cors: true,
    https: {
      key: '../localhost-key.pem',
      cert: '../localhost.pem',
    },
  },
  build: {
    sourcemap: true,
    target: 'esnext',
    rollupOptions: {
      input: 'src/index.js',
      output: { entryFileNames: 'hotfx-docs.js' },
    },
  },
})
