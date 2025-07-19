import Prism from 'prismjs'
import burnout from './burnout.js'

class HotDemo extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.#render()
    this.#fetch()
  }

  toggleHTML() {
    this.shadowRoot.querySelector('footer').classList.toggle('html-expanded')
  }

  async #fetch() {
    const cssResponse = await fetch(this.getAttribute('src') + '.css')
    const css = await cssResponse.text()
    const htmlResponse = await fetch(this.getAttribute('src') + '?theRealThingAndNotSomeClientRenderedBS')
    const html = await htmlResponse.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    doc.querySelectorAll('script:not([src*="jsdelivr"]):not([src*="localhost"])').forEach(s => s.remove())
    const imports = doc.querySelector('head style').innerHTML
      .split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith(`@import url('${this.getAttribute('src')}`))
      .map(line => `  ${line.replace(/\?cache-key=[^']*'/, "'").trim()}`)
      .join('\n')
    if (!this.querySelector('[slot="source"]')) {
      const scripts = Array.from(doc.querySelectorAll('script'))
        .map(el => el.outerHTML)
      this.shadowRoot.querySelector('#source code').textContent += scripts.join('\n\n')
      this.shadowRoot.querySelector('#source code').textContent += scripts.length ? '\n' : ''
      let style = '<style>\n'
      style += imports
      style += imports.length && css.length ? '\n\n' : ''
      style += css.split('\n').map(line => `  ${line}`).join('\n')
      style += '\n</style>\n'
      this.shadowRoot.querySelector('#source code').textContent += style
      const start = html.indexOf('<body>') + 6
      const end = html.indexOf('</body>')
      const body = html.slice(start, end)
        .split('\n')
        .map(line => line.startsWith('    ') ? line.slice(4) : line)
        .join('\n')
      this.shadowRoot.querySelector('#source code').textContent += body
    }
    Prism.highlightElement(this.shadowRoot.querySelector('#source code'))
    const body = this.shadowRoot.querySelector('#body')
    if (this.hasAttribute('use-iframe')) {
      const iframe = document.createElement('iframe')
      // Firefox does not like style sheet @imports without the origin
      iframe.srcdoc = doc.documentElement.outerHTML.replaceAll(
        "@import url('/",
        "@import url('https://fx.hot.page/",
      )
      iframe.setAttribute('part', 'iframe')
      body.appendChild(iframe)
    } else {
      body.attachShadow({ mode: 'open' })
      // Firefox does not like style sheet @imports without the origin
      body.shadowRoot.innerHTML = `
        ${doc.querySelector('head style').outerHTML.replaceAll("url('/", "url('https://fx.hot.page/")}
        ${doc.body.innerHTML}
      `
    }
  }

  #handleCopyClick = () => {
    const el = document.createElement('pre')
    el.style.width = '1px'
    el.style.height = '1px'
    el.style.position = 'fixed'
    el.style.top = '5px'
    el.textContent = this.shadowRoot.querySelector('#source').textContent.trim()
    document.body.appendChild(el)
    const selection = getSelection()
    selection.removeAllRanges()
    const range = document.createRange()
    range.selectNodeContents(el)
    selection.addRange(range)
    document.execCommand('copy')
    selection.removeAllRanges()
    document.body.removeChild(el)
    this.shadowRoot.querySelector('#copy span').textContent = 'Copied!'
    setTimeout(() => {
      this.shadowRoot.querySelector('#copy span').textContent = 'Copy'
    }, 2000)
  }


  #render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css">
      <style>
        :host {
          display: block;
          background-color: white;
        }

        *, *::after, *::before {
          box-sizing: border-box;
        }

        .container {
          max-width: 800px;
          margin: 0 auto;
          padding: 16px;
        }

        @media (max-width: 800px) {
          .container {
            padding: 12px 8px;
          }
        }

        header {
          background-color: var(--secondary-color);
          color: white;
          font-family: var(--fixed-width-font);
        }

        header h1 {
          font-size: 1.3rem;
          font-weight: 400;
          margin: 0;
        }

        #controls {
          background-color: var(--secondary-color-extra-dark);
          color: white;
        }

        #body {
          background-color: white;
          overflow: hidden;
        }

        #body iframe {
          margin: 16px;
          margin-left: calc(50% - 400px + 16px);
          border: 1px solid var(--secondary-color);
        }

        @media (max-width: 800px) {
          #body iframe {
            margin: 16px;
          }
        }

        #source {
          display: grid;
          grid-template-rows: 0fr;
          min-height: 0;
          background-color: var(--secondary-color-extra-dark);
          transition: grid-template-rows 300ms ease-out;
        }

        footer.html-expanded + #source {
          grid-template-rows: 1fr;
        }

        #source .wrapper {
          display: block;
          overflow: hidden;
          padding: 0;
          font-size: 16px;
        }

        #source pre,
        #source code {
          background-color: var(--secondary-color-extra-dark);
        }

        footer {
          background-color: var(--secondary-color);
        }

        footer .container {
          display: flex;
          justify-content: space-between
        }

        footer .right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        footer button,
        footer .button {
          color: white;
          background: none;
          border: none;
          text-decoration: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          font-size: 1rem;
          font-weight: 400;
          font-family: inherit;
          gap: 4px;
        }

        @media (max-width: 800px) {
          footer button,
          footer .button {
            font-size: 14px;
          }
        }

        footer button:hover,
        footer .button:hover {
          color: var(--primary-color);
        }

        footer button:active,
        footer .button:active {
          transform: scale(.95);
        }

        footer button.html abbr::before {
          content: 'Show ';
        }

        footer button.html svg {
          transition: rotate 300ms ease-out;
        }

        footer.html-expanded button.html svg {
          rotate: 180deg;
        }

        footer.html-expanded button.html abbr::before {
          content: 'Hide ';
        }

        footer button svg,
        footer .button svg {
          width: 1rem;
          height: 1rem;
        }

        footer .button #burnout {
          width: 1.5rem;
          height: 1.5rem;
        }

        #burnout g {
          opacity: 0;
        }

        .button #burnout #static {
          opacity: 1;
        }
        .button:hover #burnout #static {
          opacity: 0;
        }

        .button:hover #burnout g {
          animation: cycle 1.2s step-end infinite;
        }

        @keyframes cycle {
          0% { opacity: 1; }
          16.66666% { opacity: 0; }
        }

        #burnout #frame2 { animation-delay: 0.2s }
        #burnout #frame3 { animation-delay: 0.4s }
        #burnout #frame4 { animation-delay: 0.6s }
        #burnout #frame5 { animation-delay: 0.8s }
        #burnout #frame6 { animation-delay: 1.0s }
      </style>
      <header>
        <div class="container">
          <h1><slot name="heading"><div></h1>
        </div>
      </header>
      <div id="controls">
        <slot name="controls"></slot>
      </div>
      <div id="body" part="body"></div>
      <footer>
        <div class="container">
          <button class="html">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 21"><path fill="currentColor" d="M12.12 9.792 11 10.913v-4.17a1 1 0 0 0-2 0v4.17l-1.121-1.12a1 1 0 1 0-1.414 1.413l2.828 2.828a.995.995 0 0 0 1.083.22 1 1 0 0 0 .33-.22l2.828-2.827a1 1 0 0 0-1.414-1.415m2.878-8.209C10.217-1.177 4.102.461 1.341 5.243S.218 16.14 5.001 18.901c4.781 2.76 10.897 1.122 13.657-3.66 2.762-4.782 1.123-10.897-3.66-13.658m1.929 12.658a7.999 7.999 0 1 1-13.854-8 7.999 7.999 0 0 1 13.854 8"/></svg>
            <abbr>HTML</abbr>
          </button>
          <div class="right">
            <button id="copy">
              <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="200px" width="200px" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>
              <span>Copy</span>
            </button>
            <a
              class="button"
              href="https://hotpage.dev/fx${this.getAttribute('src')}"
              target="_blank">
              ${burnout}
              Use on Hot Page
            </a>
          </span>
        </div>
      </footer>
      <div id="source">
        <div class="wrapper">
          <slot name="source">
            <pre class="language-html"><code></code></pre>
          </slot>
        </div>
      </div>
    `
    this
      .shadowRoot
      .querySelector('button.html')
      .addEventListener('click', () => this.toggleHTML())
    this
      .shadowRoot
      .querySelector('#copy')
      .addEventListener('click', this.#handleCopyClick)
  }
}

customElements.define('hot-demo', HotDemo)
