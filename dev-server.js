import browserSync from 'browser-sync'

const local = browserSync.create('local')
local.init({
  server: 'src',
  https: {
    key: './localhost-key.pem',
    cert: './localhost.pem',
  },
  port: 8000,
  cors: true,
  open: false,
})

// This is if you want to proxy your pages from Hot Page and replace the scripts used with these ones. This can be a fast way to preview a page or a whole site without changing any of the live pages.
// const proxy = browserSync.create('proxy')
// proxy.init({
//   proxy: 'https://playground.hot.page/',
//   port: 8000,
//   ui: { port: 8001 },
//   files: [
//     '**/*.css',
//     '**/*.js',
//   ],
//   open: false,
//   rewriteRules: [
//     {
//       match: 'https://unpkg.com/@hot-page/skeleton@0.0.1/skeleton.css',
//       replace: 'https://10.0.0.3:8002/skeleton/skeleton.css',
//     },
//     {
//       match: 'https://unpkg.com/@hot-page/fx@0.0.1/parallax.css',
//       replace: 'https://10.0.0.3:8002/fx/parallax.css',
//     },
//     {
//       match: 'https://unpkg.com/@hot-page/fx@0.0.1/intersection-observer.js',
//       replace: 'https://localhost:8002/fx/intersection-observer.js',
//     },
//     {
//       match: 'https://unpkg.com/@hot-page/demos@0.0.3/hot-page-landing.css',
//       replace: 'https://10.0.0.3:8002/demos/hot-page-landing.css',
//     },
//     {
//       match: 'https://unpkg.com/@hot-page/fx@0.0.2/far-out-carousel.js',
//       replace: 'https://10.0.0.3:8002/fx/far-out-carousel.js',
//     },
//     {
//       match: 'https://unpkg.com/@hot-page/fx@0.0.2/drop-reveal.js',
//       replace: 'https://10.0.0.3:8002/fx/drop-reveal.js',
//     },
//     {
//       match: 'https://unpkg.com/@hot-page/fx@0.0.2/deep-box.js',
//       replace: 'https://10.0.0.3:8002/fx/deep-box.js',
//     },
//     {
//       match: 'https://unpkg.com/@hot-page/demos@0.0.2/xela.css',
//       replace: 'https://10.0.0.3:8002/demos/xela.css',
//     },
//     {
//       match: 'https://unpkg.com/@hot-page/fx@0.0.2/speech-bubble.js',
//       replace: 'https://10.0.0.3:8002/fx/speech-bubble.js',
//     },
//     {
//       match: '</head>',
//       replace: `
//           <script type="module" src="https://10.0.0.3:8002/playground.js"></script>
//           <link rel="stylesheet" href="https://10.0.0.3:8002/playground.css">
//         </head>`
//     },
//   ]
// })
