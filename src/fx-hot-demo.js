class FXHotDemo extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.#render()
    this.#fetch()
  }
 
  async #fetch() {
    const response = await fetch(this.getAttribute('src'))
    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    window.temp1 = doc
    console.log(doc)
    this.shadowRoot.querySelector('#source').textContent = `
      ${doc.querySelector('head style').outerHTML}
      ${doc.body.innerHTML}
    `
  }

  #render() {
    this.shadowRoot.innerHTML = `
      <style>
        header {
          background-color: var(--secondary-color);
          color: white;
          font-family: var(--fixed-width-font);
        }

        header h1 {
          font-weight: 400;
        }

        #body {
          height: 100px;
          background-color: white;
        }

        footer {
          background-color: var(--secondary-color);
        }

        footer button {
          color: white;
          background: none;
          border: none;
        }
      </style>
      <header>
        <h1>Demo</h1>
      </header>
      <div id="controls">
        <slot name="controls"></slot>
      </div>
      <div id="body"></div>
      <pre id="source"></pre>
      <footer>
        <button>Hide HTML</button>
        <button>Copy</button>
        <button>Use on Hot Page</button>
      <footer>
    `
  }
}

customElements.define('fx-hot-demo', FXHotDemo)
