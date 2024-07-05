// TODO
// - firefox: cant load comic sans, speech bubble text is not well positioned

document.head.insertAdjacentHTML('beforeend', `
  <style>
    @font-face {
      font-family: "Comic Sans Webfont";
      font-display: block;
      src: url("https://static.hot.page/fonts/comic-sans.woff2") format("woff2"),
        url("https://static.hot.page/fonts/comic-sans.woff") format("woff"),
        url("https://static.hot.page/fonts/comic-sans.ttf") format("truetype");
    }
  </style>`
)

class SpeechBubble extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' });
    this._resizeObserver = new ResizeObserver(this._thrashLayout.bind(this))
  }
  
  _thrashLayout() {
    this.style.width = ''
    const container = this.shadowRoot.querySelector('.container')
    const wrap = this.shadowRoot.querySelector('.wrap')
    let width = 150
    container.style.width = width + 'px'
    let counter = 0;
    while (counter < 50 && container.offsetHeight * .9 < wrap.offsetHeight) {
      counter++
      width += 10
      container.style.width = width + 'px'
    }
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .container {
          position: relative;
          aspect-ratio: 4/3;
          min-height: 0;
          text-align: center;
          background-size: 100% 100%;
          font-family: "Comic Sans MS", "Comic Sans", "Comic Sans Webfont", cursive;
          padding-left: 2%;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><path fill="white" stroke="black" vector-effect="non-scaling-stroke" d="M155.2,2C76.3,2,12.4,45.9,12.4,100c0,19,7.9,36.7,21.5,51.7L3,192.6l55.6-20.4c25.4,16,59.3,25.8,96.6,25.8,78.9,0,142.8-43.9,142.8-98S234.1,2,155.2,2Z"/></svg>');
        }

        :host([position=left]) .container {
          padding-left: 0;
          padding-right: 2%;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 200"><path fill="white" stroke="black" vector-effect="non-scaling-stroke" d="M145.8,2c78.9,0,142.8,43.9,142.8,98,0,19-7.9,36.7-21.5,51.7L298,192.6l-55.6-20.4c-25.4,16-59.3,25.8-96.6,25.8C66.9,198,3,154.1,3,100S66.9,2,145.8,2Z"/></svg>');
        }

        :host([position=bottom]) .container {
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 200"><path fill="white" stroke="black" vector-effect="non-scaling-stroke" d="M155.2,198c-78.9,0-142.8-43.9-142.8-98 c0-19,7.9-36.7,21.5-51.7L3,7.4l55.6,20.4C84,11.8,117.9,2,155.2,2C234.1,2,298,45.9,298,100S234.1,198,155.2,198z"/></svg>');
        }

        :host([position=bottom-left]) .container {
          padding-left: 0;
          padding-right: 2%;
          background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 300 200"><path fill="white" stroke="black" vector-effect="non-scaling-stroke" d="M145.8,198c78.9,0,142.8-43.9,142.8-98,0-19-7.9-36.7-21.5-51.7L298,7.4,242.4,27.8C217,11.8,183.1,2,145.8,2,66.9,2,3,45.9,3,100S66.9,198,145.8,198Z" /></svg>');
        }

        .float-left,
        .float-right {
          display: block;
          box-sizing: border-box;
          width: 50%;
          height: 100%;
          shape-margin: 4%;
        }

        .float-left {
          float: left;
          margin-left: -10%;
          shape-outside: radial-gradient(ellipse at right, transparent 0%, transparent 60%, black 60%);
        }

        .float-right {
          float: right;
          margin-right: -10%;
          shape-outside: radial-gradient(ellipse at left, transparent 0%, transparent 60%, black 60%);
        }


        .wrap {
          padding-top: 5%;
        }

      </style>
      <div class="container">
        <div class="float-left"></div>
        <div class="float-right"></div>
        <div class="wrap">
          <slot></slot>
        </div>
      </div>
    `
    this._resizeObserver.observe(this.shadowRoot.querySelector('.wrap'))
    this._thrashLayout()
  }
}

customElements.define('speech-bubble', SpeechBubble)
