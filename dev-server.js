import browserSync from 'browser-sync'

const local = browserSync.create('local')
local.init({
  server: '.',
  https: {
    key: './localhost-key.pem',
    cert: './localhost.pem',
  },
  port: 9090,
  ui: false,
  cors: true,
  open: false,
})

// This is if you want to proxy your pages from Hot Page and replace the scripts used with these ones. This can be a fast way to preview a page or a whole site without changing any of the live pages.
// const proxy = browserSync.create('proxy')
// proxy.init({
//   proxy: 'https://docs.hot.page/',
//   port: 8080,
//   ui: false,
//   // files to watch
//   files: [
//     '**/*.css',
//     '**/*.js',
//   ],
//   https: {
//     key: './localhost-key.pem',
//     cert: './localhost.pem',
//   },
//   open: false,
//   rewriteRules: [
//     {
//       match: 'https://cdn.jsdelivr.net/gh/hot-page/fx@345548e18f3de55b724bccf31289bfd4d09c128a/src/responsive-menu.js',
//       replace: 'https://localhost:8000/src/fx-responsive-menu.js',
//     },
//   ]
// })
