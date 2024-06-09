<div align="center">
  <img
    width="250"
    src="https://hotpage.dev/api/images/7c8a2e06-759d-4610-8583-e8e07ed6b05f/versions/1500">
</div>

&nbsp;

HotFX is a collection of standalone custom elements and frontend code snippets
that are like wowwwwwww

Read more at [fx.hot.page](https://fx.hot.page/).

Created for sites built on [Hot Page](hot.page).


## Development

To modify the files and see the results on your pages, you can run a
development server. First create the SSL certificates following the procedure
below and then run:

```
npm start
```

If you get the error `Error: ENOENT: no such file or directory, open
'./localhost-key.pem'` that is because you haven't created an SSL certificate
yet (see below).

Once you can start the server, the files here will be available on localhost like
[`https://localhost:8000/fx-responsive-menu/index.js`](https://localhost:8000/fx-responsive-menu/index.js).
Be sure to use `https` or the browser will show you a very cryptic error.


## Create an SSL Certificate for `localhost`

To run the server and use this with your pages on [Hot Page](hot.page), you
will need to serve these files using encrypted `https`. To do that, it is
easiest to install a valid SSL certificate for `localhost`. This keeps the
browser from freaking out when it loads the files. You can install a certicate
easily using `mkcert` (you can [read
more](https://web.dev/articles/how-to-use-local-https) on web.dev). For
example, on MacOS use the following

```
brew install mkcert mkcert -install mkcert localhost
```

This will generate the certificate in this directory and you should be able to
then run the server as described above.

&nbsp;

<p align="center">
  <a href="https://hot.page" target="_blank">
    <img width="250" src="https://static.hot.page/logo.png">
  </a>
</p>
