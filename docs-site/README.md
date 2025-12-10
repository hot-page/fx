
## HotFX Docs Site (fx.hot.page)

These are web components that we use to make the HotFX documentation site
beautiful and functional.

To format a video for the homepage run this:

````bash
ffmpeg -i trimmed.mov -c:v libx264 -preset slow -crf 23 -c:a aac -b:a 128k -movflags +faststart -pix_fmt yuv420p  output.mp4
````

