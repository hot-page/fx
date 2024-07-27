export default {
  build: {
    lib: {
      entry: 'hotfx-slinky.js',
      formats: ['es'],
    },
    sourcemap: true,
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
      },
    },
  }
}
