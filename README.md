
# Hot _fx_

These are special effects created for pages on [Hot Page](hot.page). Read more at [https://fx.hot.page/](https://fx.hot.page/).

## Development

To modify the files and see the results, you can run a development server.

```
npm start
```

If you get the error `Error: ENOENT: no such file or directory, open './localhost-key.pem'` that is because you haven't created an SSL certificate yet (see below).

Once you can start the server, the files in `src/` will be available at localhost like [`https://localhost:8000/drop-reveal.js`](https://localhost:8000/drop-reveal.js). Be sure to use `https` or the browser will show you a cryptic error.


## Create an SSL Certificate for `localhost`

To run the server and use this with your pages on [Hot Page](hot.page), you will need to serve these files using encrypted `https`. To do that, it is easiest to install a valid SSL certificate for `localhost`. This keeps the browser from freaking out when it loads the files. You can install a certicate easily using `mkcert` (you can [read more](https://web.dev/articles/how-to-use-local-https) on web.dev). For example, on MacOS use the following

```
brew install mkcert
mkcert -install
mkcert localhost
```
This will generate the certificate in this directory and you should be able to run the server.