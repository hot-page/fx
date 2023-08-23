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


// import http from 'http'
// import startDevServer from '@hot-page/dev-server'
// import static from 'node-static'
//
// var file = new(static.Server)(__dirname);
//
// http.createServer(function (req, res) {
//   file.serve(req, res);
// }).listen(8080)
//
// startDevServer({
//   site: 'hot.page',
//   port: 8000,
//   addAssets: [
//     'http://localhost:8001/playground.js',
//   ],
//   replaceAssets: {
//     'https://static.hot.page/assets/drop-reveal.js':
//       'http://localhost:8001/assets/drop-reveal.js',
//     'https://static.hot.page/assets/hanging-punctuation.js':
//       'http://localhost:8001/assets/hanging-punctuation.js',
//     'https://static.hot.page/assets/hot-form.js':
//       'http://localhost:8001/assets/hot-form.js',
//     'https://static.hot.page/assets/intersection-observer.js':
//       'http://localhost:8001/assets/intersection-observer.js',
//     'https://static.hot.page/assets/paginator.js':
//       'http://localhost:8001/assets/paginator.js',
//     'https://static.hot.page/assets/parallax.css':
//       'http://localhost:8001/assets/parallax.js',
//     'https://static.hot.page/assets/scroll-synced-audio.js':
//       'http://localhost:8001/assets/scroll-synced-audio.js',
//     'https://static.hot.page/assets/scroll-synced-video.js':
//       'http://localhost:8001/assets/scroll-synced-video.js',
//     'https://static.hot.page/assets/speech-bubble.js':
//       'http://localhost:8001/assets/speech-bubble.js',
//     'https://static.hot.page/assets/skeleton.css':
//       'http://localhost:8001/assets/skeleton.js',
//     'https://static.hot.page/assets/far-out-carousel.js':
//       'http://localhost:8001/assets/far-out-carousel.js',
//     'https://static.hot.page/demos/alice.css':
//       'http://localhost:8001/demos/alice.js',
//     'https://static.hot.page/demos/hot-page-landing.css':
//       'http://localhost:8001/demos/hot-page-landing.js',
//     'https://static.hot.page/demos/rabbit-hole.js':
//       'http://localhost:8001/demos/rabbit-hole.js',
//     'https://static.hot.page/demos/xela.css':
//       'http://localhost:8001/demos/xela.js',
//   }
// })
