export default {
  build: {
    lib: {
      entry: 'hotfx-slinky.js',
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        entryFileNames: `[name].js`,
      },
    },
  }
}
