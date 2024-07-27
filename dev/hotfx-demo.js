let burnout

class HotFXDemo extends HTMLElement {

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
    const response = await fetch(this.getAttribute('src'))
    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    doc.querySelectorAll('script:not([src*="jsdelivr"]):not([src*="localhost"])').forEach(s => s.remove())
    if (!this.querySelector('[slot="source"]')) {
      this.shadowRoot.querySelector('#source code').textContent = `
    ${Array.from(doc.querySelectorAll('script')).filter(el => el.src.includes('jsdelivr')).map(el => el.outerHTML).join('\n')}
    ${doc.querySelector('head style').outerHTML
      .replace('      @layers external, internal;\n\n', '')
      .replace('      @layers external, internal;\n', '')}
    ${doc.body.innerHTML}`
    }
    Prism.highlightElement(this.shadowRoot.querySelector('#source code'))
    const body = this.shadowRoot.querySelector('#body')
    if (this.hasAttribute('use-iframe')) {
      const iframe = document.createElement('iframe')
      iframe.srcdoc = doc.documentElement.outerHTML
      iframe.setAttribute('part', 'iframe')
      body.appendChild(iframe)
    } else {
      body.attachShadow({ mode: 'open' })
      body.shadowRoot.innerHTML = `
        ${doc.querySelector('head style').outerHTML}
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
              href="https://hotpage.dev/new?template=fx${this.getAttribute('src')}"
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

// gives time to set the burnout variable below
setTimeout(() => customElements.define('hotfx-demo', HotFXDemo))

burnout = `
  <svg id="burnout" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 32">
    <g id="static">
      <path fill="#fad61f" fill-rule="evenodd" d="M10 9h5v2h1v6h2v10h-2v2H7v-2H4V17h3v-6h3z"/>
      <path fill="#eb222a" d="M12 31h1v1h-1zM13 31h1v1h-1zM14 30h1v1h-1zM15 29h1v1h-1zM16 28h1v1h-1zM17 27h1v1h-1zM18 26h1v1h-1zM19 25h1v1h-1zM19 24h1v1h-1zM19 23h1v1h-1zM20 22h1v1h-1zM19 21h1v1h-1zM19 20h1v1h-1zM20 19h1v1h-1zM19 18h1v1h-1zM19 17h1v1h-1zM18 16h1v1h-1zM18 11h1v1h-1zM18 15h1v1h-1zM19 14h1v1h-1zM11 31h1v1h-1zM10 31h1v1h-1zM9 31h1v1H9zM8 31h1v1H8z"/>
      <path fill="#fad61f" d="M7 31h1v1H7zM6 30h1v1H6zM5 29h1v1H5zM4 28h1v1H4zM3 27h1v1H3zM2 26h1v1H2zM1 25h1v1H1zM1 23h1v1H1zM2 14h1v1H2z"/>
      <path fill="#fad61f" d="M2 14h1v1H2zM1 21h1v1H1zM2 20h1v1H2zM2 19h1v1H2zM1 18h1v1H1zM3 18h1v1H3zM3 17h1v1H3zM7 9h1v1H7zM8 8h1v1H8zM9 7h1v1H9zM9 6h1v1H9zM9 5h1v1H9zM10 1h1v1h-1zM12 1h1v1h-1zM13 4h1v1h-1zM13 3h1v1h-1zM14 6h1v1h-1zM14 5h1v1h-1zM15 7h1v1h-1zM15 8h1v1h-1zM15 10h1v1h-1zM16 11h1v1h-1zM17 12h1v1h-1zM18 13h1v1h-1zM19 15h1v1h-1zM18 14h1v1h-1zM20 18h1v1h-1zM21 19h1v1h-1zM20 20h1v1h-1zM20 23h1v1h-1zM20 24h1v1h-1zM21 21h1v1h-1z"/>
      <path fill="#eb222a" d="M21 18h1v1h-1z"/>
      <path fill="#fad61f" d="M19 26h1v1h-1zM18 27h1v1h-1zM17 28h1v1h-1zM16 29h1v1h-1zM15 30h1v1h-1zM14 31h1v1h-1zM4 15h1v1H4zM4 14h1v1H4zM3 12h1v1H3zM4 11h1v1H4zM4 13h1v1H4zM6 10h1v1H6zM5 12h1v1H5z"/>
      <path fill="#eb222a" d="M7 30h1v1H7zM8 29h1v1H8zM9 29h1v1H9zM11 29h1v1h-1zM12 29h1v1h-1zM13 29h1v1h-1zM14 28h1v1h-1zM15 27h1v1h-1zM16 26h1v1h-1zM17 25h1v1h-1zM17 24h1v1h-1zM17 23h1v1h-1zM18 22h1v1h-1zM17 21h1v1h-1zM17 20h1v1h-1zM18 19h1v1h-1zM17 18h1v1h-1zM17 17h1v1h-1zM16 16h1v1h-1zM16 15h1v1h-1zM15 14h1v1h-1zM15 13h1v1h-1zM14 12h1v1h-1zM13 11h1v1h-1zM13 9h1v1h-1zM12 8h1v1h-1zM10 29h1v1h-1zM7 28h1v1H7zM6 27h1v1H6zM5 26h1v1H5zM4 25h1v1H4zM3 24h1v1H3zM3 22h1v1H3zM4 21h1v1H4zM5 19h1v1H5zM9 24h1v1H9zM8 24h1v1H8zM10 24h1v1h-1zM11 24h1v1h-1zM12 24h1v1h-1zM13 24h1v1h-1zM6 18h1v1H6zM6 17h1v1H6zM6 16h1v1H6z"/>
      <path fill="#fad61f" d="M6 18h1v1H6zM6 17h1v1H6z"/>
      <path fill="#eb222a" d="M7 15h1v1H7zM7 14h1v1H7zM7 13h1v1H7zM8 12h1v1H8zM8 11h1v1H8zM9 10h1v1H9zM11 9h1v1h-1zM12 7h1v1h-1zM6 29h1v1H6zM5 28h1v1H5zM4 27h1v1H4zM3 26h1v1H3zM2 25h1v1H2zM1 24h1v1H1zM2 23h1v1H2zM1 22h1v1H1zM2 21h1v1H2zM3 19h1v1H3zM3 20h1v1H3zM4 18h1v1H4zM4 17h1v1H4zM3 15h1v1H3zM2 18h1v1H2zM1 19h1v1H1zM4 16h1v1H4zM5 15h1v1H5zM5 14h1v1H5zM4 12h1v1H4zM3 11h1v1H3zM5 13h1v1H5zM6 12h1v1H6zM6 11h1v1H6zM7 10h1v1H7zM8 9h1v1H8zM9 8h1v1H9zM10 8h1v1h-1zM10 7h1v1h-1zM10 6h1v1h-1zM10 5h1v1h-1zM10 4h1v1h-1zM11 3h1v1h-1z"/>
      <path fill="#f16325" d="M11 3h1v1h-1zM11 4h1v1h-1zM11 5h1v1h-1zM11 6h1v1h-1zM11 7h1v1h-1zM11 8h1v1h-1zM10 9h1v1h-1zM9 9h1v1H9zM8 10h1v1H8zM7 11h1v1H7zM6 13h1v1H6zM6 14h1v1H6zM6 15h1v1H6zM5 16h1v1H5zM5 17h1v1H5zM5 18h1v1H5zM4 19h1v1H4zM4 20h1v1H4zM3 21h1v1H3zM2 22h1v1H2zM3 23h1v1H3zM2 24h1v1H2zM3 25h1v1H3zM4 26h1v1H4zM5 27h1v1H5zM6 28h1v1H6zM7 29h1v1H7zM8 30h1v1H8zM9 30h1v1H9zM10 30h1v1h-1zM11 30h1v1h-1zM12 30h1v1h-1zM13 30h1v1h-1zM14 29h1v1h-1zM15 28h1v1h-1zM16 27h1v1h-1zM17 26h1v1h-1zM18 25h1v1h-1zM18 24h1v1h-1zM18 23h1v1h-1zM19 22h1v1h-1zM18 21h1v1h-1zM18 20h1v1h-1zM19 19h1v1h-1zM18 18h1v1h-1zM18 17h1v1h-1zM17 16h1v1h-1zM17 15h1v1h-1zM16 14h1v1h-1zM16 13h1v1h-1zM15 12h1v1h-1zM14 11h1v1h-1zM13 10h1v1h-1zM14 9h1v1h-1zM13 8h1v1h-1zM13 7h1v1h-1zM12 6h1v1h-1zM12 5h1v1h-1zM7 12h1v1H7z"/>
      <path fill="#eb222a" d="M11 2h1v1h-1zM12 4h1v1h-1zM12 3h1v1h-1zM12 2h1v1h-1zM11 1h1v1h-1zM13 6h1v1h-1zM13 5h1v1h-1zM14 7h1v1h-1zM14 8h1v1h-1zM15 9h1v1h-1zM14 10h1v1h-1zM15 11h1v1h-1zM16 12h1v1h-1zM17 13h1v1h-1zM17 14h1v1h-1z"/>
      <path fill="#fff" d="M8 20h1v1H8zM8 19h1v1H8zM9 19h1v1H9zM12 20h1v1h-1zM12 19h1v1h-1zM13 19h1v1h-1zM14 20h1v1h-1zM14 21h1v1h-1zM8 21h1v1H8zM12 21h1v1h-1zM9 21h1v1H9zM10 21h1v1h-1zM10 20h1v1h-1zM13 21h1v1h-1z"/>
      <path d="M9 20h1v1H9zM13 20h1v1h-1z"/>
      <path fill="#fad61f" d="M12 8h1v1h-1zM11 9h1v1h-1zM12 7h1v1h-1zM12 6h1v1h-1z"/>
      <path fill="#ffea7d" d="M12 6h1v1h-1zM13 12h1v1h-1zM12 11h1v1h-1zM12 7h1v1h-1zM12 8h1v1h-1zM14 13h1v1h-1zM14 14h1v1h-1zM15 15h1v1h-1zM16 17h1v1h-1zM17 19h1v1h-1zM19 16h1v1h-1zM20 15h1v1h-1zM18 12h1v1h-1zM17 22h1v1h-1zM16 24h1v1h-1zM16 25h1v1h-1zM15 26h1v1h-1zM14 27h1v1h-1zM12 28h1v1h-1zM11 28h1v1h-1zM9 28h1v1H9z"/>
      <path fill="#ffea7d" d="M9 28h1v1H9zM8 28h1v1H8zM7 27h1v1H7zM6 26h1v1H6zM5 25h1v1H5zM4 24h1v1H4zM4 23h1v1H4zM4 22h1v1H4zM5 21h1v1H5zM5 20h1v1H5zM6 19h1v1H6zM6 18h1v1H6zM6 17h1v1H6zM3 14h1v1H3zM2 15h1v1H2zM0 17h1v1H0zM7 16h1v1H7zM8 15h1v1H8zM8 14h1v1H8zM8 13h1v1H8zM9 12h1v1H9zM9 11h1v1H9zM10 10h1v1h-1zM11 9h1v1h-1zM10 28h1v1h-1zM13 28h1v1h-1z"/>
      <path fill="#eb222a" d="M10 0h1v1h-1z"/>
    </g>
    <g id="frame1">
      <path fill="#fad61f" d="M18 27V17h-2v-5h1v-1h-1v-1h-1V9h-2V6h-1v3h-2v2H7v6H3v2h1v7H3v1h1v1h1v-1h2v2h9v-2zM7 31h1v1H7zM6 30h1v1H6z"/>
      <path fill="#fad61f" d="M5 30h1v-2H5v2M1 25h1v1H1zM1 23h1v1H1zM2 10h1v1H2zM2 7h1v1H2zM1 21h1v1H1zM2 20v1h1v-2H2zM1 18h1v1H1zM7 9h1v1H7zM8 8h1v1H8zM10 7V5H9v3h1zM10 1h1v1h-1zM12 1h1v1h-1zM14 3h-1v2h1V3M14 7h1V5h-1v2M15 4h1v1h-1zM15 8h1v1h-1zM17 10h1v1h-1zM19 13h-1v2h1v-2M19 15h1v1h-1zM20 18h1v1h-1zM21 19h1v1h-1zM20 20h1v1h-1zM20 24v1h1v-2h-1zM21 21h1v1h-1zM19 26h1v1h-1zM18 27h1v1h-1zM17 28h1v1h-1zM16 29h1v1h-1zM15 30h1v1h-1zM14 31h1v1h-1zM4 15v1h1v-3H4v2M3 12h1v1H3zM4 10h1v1H4zM6 10h1v1H6zM5 12h1v1H5z"/>
      <path fill="#f16325" d="M9 9v1h2V9H9M8 10h1v1H8zM7 12v1h1v-2H7zM6 14v2h1v-3H6zM5 17v2h1v-3H5zM4 20v1h1v-2H4zM3 21h1v1H3zM2 22h1v1H2zM3 23h1v1H3zM2 24h1v1H2zM3 25h1v1H3zM5 26h1v1H5zM6 27h1v1H6zM8 28H7v2h1v-2M12 30H8v1h6v-1h-2M14 29h1v1h-1zM15 28h1v1h-1zM16 27h1v1h-1zM17 26h1v1h-1zM18 24v2h1v-3h-1zM19 22h1v1h-1zM19 20h-1v2h1v-2M19 19h1v1h-1zM19 17h-1v2h1v-2M18 15h-1v2h1v-2M17 13h-1v2h1v-2M15 12h1v1h-1zM14 11h1v1h-1zM13 10h1v1h-1zM14 9h1v1h-1zM14 7h-1v2h1V7M13 5h-1V3h-1v6h1V7h1V5"/>
      <path d="M9 20h1v1H9z"/>
      <path fill="#fff" d="M10 21H9v-1h1v-1H8v3h3v-2h-1zM14 20v1h-1v-1zv-1h-2v3h3v-2z"/>
      <path d="M13 20h1v1h-1z"/>
      <path fill="#eb222a" d="M12 31H8v1h6v-1h-2M14 30h1v1h-1zM15 29h1v1h-1zM16 28h1v1h-1zM17 27h1v1h-1zM18 26h1v1h-1zM19 24v2h1v-3h-1zM20 22h1v1h-1zM19 21h1v1h-1zM21 20h1v1h-1zM20 19h1v1h-1zM20 17h-1v2h1v-2M18 17h1v-2h-1v2M18 8h1v1h-1zM19 14h1v1h-1zM21 16h1v1h-1zM7 30h1v1H7zM8 30h6v-1H9v-1H8v2M14 28h1v1h-1zM15 27h1v1h-1zM16 26h1v1h-1zM18 25v-2h-1v3h1zM18 22h1v1h-1zM17 21v1h1v-2h-1zM18 19h1v1h-1zM17 18v1h1v-2h-1zM17 15h-1v2h1v-2M16 13h-1v2h1v-2M14 12h1v1h-1zM13 11h1v1h-1zM13 9h1v1h-1zM7 27h1v1H7zM6 26h1v1H6zM5 25H4v2h1v-2M3 24h1v1H3zM3 22h1v1H3zM4 21h1v1H4zM5 19h1v1H5zM12 24H8v1h6v-1h-2M6 17v2h1v-3H6zM7 14v2h1v-3H7zM8 12v1h1v-2H8zM9 10h1v1H9zM11 9h1v1h-1zM13 7h-1v2h1V7M7 28H6v2h1v-2M5 27h1v1H5zM2 25h1v1H2zM1 24h1v1H1zM2 23h1v1H2zM1 22h1v1H1zM2 21h1v1H2zM4 20v-1H3v2h1zM5 18v-2H4v3h1zM3 15h1v1H3zM2 18h1v1H2zM1 19h1v1H1zM6 15v-2H5v3h1zM4 12h1v1H4zM3 8h1v1H3zM7 12v-1H6v2h1zM7 10h1v1H7zM8 9h1v1H8zM11 9V4h-1v4H9v1h2M12 5h1V2h-1V1h-1v3h1zM13 7h1V5h-1v2M14 9h1V7h-1v2M15 9h1v1h-1zM14 10h1v1h-1zM15 11h1v1h-1zM16 12h1v1h-1zM17 15h1v-2h-1v2M10 0h1v1h-1z"/>
      <path fill="#ffea7d" d="M13 12h1v1h-1zM12 11h1v1h-1zM13 8V6h-1v3h1zM14 15h1v-2h-1v2M15 15h1v1h-1zM16 17h1v1h-1zM17 19h1v1h-1zM19 16h1v1h-1zM20 11h1v1h-1zM18 12h1v1h-1zM17 22h1v1h-1zM16 25v1h1v-2h-1zM15 26h1v1h-1zM14 27h1v1h-1zM12 28H8v1h6v-1h-2M8 26H7v2h1v-2M5 25h1v1H5zM4 23v2h1v-3H4zM5 21v1h1v-2H5zM7 19v-2H6v3h1zM3 14h1v1H3zM2 13h1v1H2zM0 17h1v1H0zM7 16h1v1H7zM9 15v-2H8v3h1zM10 12v-1H9v2h1zM10 10h1v1h-1zM11 9h1v1h-1z"/>
    </g>
    <g id="frame2">
      <path fill="#fad61f" d="M16 29v1h1v-2h-1zM16 23v-5h-1v-2h-1v-1h-1v-2h-1v-1h-1v-1h-1v2H9v3H8v3h2v1h1v2H8v-2H7v2H6v4h2v2h5v-1h1v-1h1v-1h1zm-2 2H8v-1h6zm1-4v1h-3v-3h2v1h1zM11 10h1v1h-1zM13 9h1v1h-1zM4 18h1v1H4zM7 31h1v1H7zM6 30h1v1H6zM6 28H5v2h1v-2M4 27h1v1H4zM3 26h1v1H3zM1 23h1v1H1zM1 12h1v1H1zM2 21h1v1H2zM4 20v-1H3v2h1zM4 16h1v1H4zM7 9h1v1H7zM8 8h1v1H8zM10 7V6H9v2h1zM18 13h1v1h-1zM19 15h1v1h-1zM21 18h1v1h-1zM20 20v1h1v-2h-1zM20 23h1v1h-1zM18 25v1h2v-1h-2M21 21h1v1h-1zM17 27h1v1h-1zM15 30h1v1h-1zM14 31h1v1h-1zM6 10h1v1H6zM4 13h1v1H4z"/>
      <path fill="#f16325" d="M10 2h1v1h-1zM11 6h1v1h-1zM11 7h1v1h-1zM11 8h1v1h-1zM10 9h1v1h-1zM9 9h1v1H9zM8 10h1v1H8zM7 11h1v1H7zM6 14h1v1H6zM6 15h1v1H6zM6 16h1v1H6zM5 19h1v1H5zM5 20h1v1H5zM4 21h1v1H4zM3 22h1v1H3zM4 23h1v1H4zM3 24h1v1H3zM3 25h1v1H3zM5 26h1v1H5zM6 27h1v1H6zM7 28h1v1H7zM7 29h1v1H7zM8 30h1v1H8zM9 30h1v1H9zM10 30h1v1h-1zM11 30h1v1h-1zM12 30h1v1h-1zM13 30h1v1h-1zM14 29h1v1h-1zM15 28h1v1h-1zM15 27h1v1h-1zM17 25h1v1h-1zM18 24h1v1h-1zM18 23h1v1h-1zM19 22h1v1h-1zM18 21h1v1h-1zM18 20h1v1h-1zM18 19h1v1h-1zM18 18h1v1h-1zM18 17h1v1h-1zM17 16h1v1h-1zM17 15h1v1h-1zM16 14h1v1h-1zM16 13h1v1h-1zM14 12h1v1h-1zM13 11h1v1h-1zM12 10h1v1h-1zM13 8h1v1h-1zM13 7h1v1h-1zM7 12h1v1H7z"/>
      <path fill="#ffea7d" d="M12 12h1v1h-1zM11 11h1v1h-1zM12 6h1v1h-1zM13 14v1h1v-2h-1zM20 12h1v1h-1zM18 12h1v1h-1zM17 10h1v1h-1zM17 22h1v1h-1zM17 23v-6h-1v-2h-2v1h1v2h1v7h1v-2M15 25h1v1h-1zM14 26h1v1h-1zM10 29h4v-2h-1v1H9v1zM7 26h1v1H7zM6 25v-3H5v4h1zM6 21v1h1v-2H6zM0 15h1v1H0zM7 18v2h1v-3H7zM8 13h1v1H8zM8 15v1h1v-2H8zM9 12v1h1v-2H9zM10 10h1v1h-1z"/>
      <path fill="#eb222a" d="M12 31H8v1h6v-1h-2M14 30h1v1h-1zM15 29h1v1h-1zM19 24v1h1v-2h-1zM20 22h1v1h-1zM19 21h1v1h-1zM21 20h1v1h-1zM19 19h1v1h-1zM19 17h1v1h-1zM18 17h1v-2h-1v2M18 7h1v1h-1zM19 14h1v1h-1zM22 14h1v1h-1zM7 30h1v1H7zM8 30h6v-1H9v-1H8v2M14 28v1h1v-2h-1zM16 26h-1v1h1v1h1v-3h-1zM17 24v1h1v-2h-1zM18 22h1v1h-1zM17 18v4h1v-5h-1zM16 17h1v-2h-1v2M14 15h2v-1h-1v-1h-1v2M13 12h1v1h-1zM12 11h1v1h-1zM7 27h1v1H7zM6 26h1v1H6zM5 25v-1H4v3h1v-2M4 22h1v1H4zM5 21h1v1H5zM6 20h1v-3H6v-2H5v4h1zM12 24H8v1h6v-1h-2M8 16v-3H7v-2H6v3h1v3h1zM8 12v1h1v-2H8zM9 10h1v1H9zM12 10h1V7h-1v2h-1v1zM7 28H6v2h1v-2M5 27h1v1H5zM2 25v1h1v-2H2zM3 23h1v1H3zM2 22h1v1H2zM3 21h1v1H3zM5 20v-1H4v2h1zM3 9h1v1H3zM7 10h1v1H7zM8 9h1v1H8zM11 9V6h1V5h-2v3H9v1h2M11 3v1h1V1h-1v2M13 10h1v1h-1zM14 11h1v1h-1zM18 14v-1h-1v2h1zM10 0h1v1h-1z"/>
      <path d="M9 20h1v1H9z"/>
      <path fill="#fff" d="M10 21H9v-1h1v-1H8v3h3v-2h-1zM14 20v1h-1v-1zv-1h-2v3h3v-2z"/>
      <path d="M13 20h1v1h-1z"/>
    </g>
    <g id="frame3">
      <path fill="#fad61f" d="M12 12h1v1h-1zM12 10h1v1h-1zM14 26h1v-1h1v-3h-4v-3h2v1h1v-2h-1v-2h-1v-1h-1v-1h-1v-2h-1v4H9v1H8v2h2v1h1v2H8v-2H7v2H6v4h2v2h5v-1h1zm-2-1H8v-1h6v1zM7 31h1v1H7zM6 29h1v1H6zM5 28h1v1H5zM4 27h1v1H4zM3 26h1v1H3zM2 25h1v1H2zM1 7h1v1H1zM1 18h1v1H1zM4 20v-1H3v2h1zM4 18h1v1H4zM4 13h1v1H4zM18 12h1v1h-1zM12 8h1v1h-1zM18 15h1v1h-1zM15 13h1v1h-1zM14 12h1v1h-1zM20 18h1v1h-1zM20 19h-1v2h1v-2M19 23h1v1h-1zM18 25v1h2v-1h-2M20 21h1v1h-1zM17 27h1v1h-1zM16 29v1h1v-2h-1zM15 30h1v1h-1zM14 31h1v1h-1zM4 10h1v1H4zM5 7h1v1H5zM6 10v1h1V9H6zM7 8h1v1H7z"/>
      <path fill="#f16325" d="M7 2h1v1H7zM9 8h1v1H9zM10 9h1v1h-1zM8 9h1v1H8zM8 13h1v1H8zM7 14h1v1H7zM7 15h1v1H7zM6 16h1v1H6zM6 17h1v1H6zM6 18h1v1H6zM5 19h1v1H5zM5 20h1v1H5zM4 21h1v1H4zM3 22h1v1H3zM4 23h1v1H4zM3 25h1v1H3zM5 26h1v1H5zM6 27h1v1H6zM7 28h1v1H7zM8 29h1v1H8zM8 30h1v1H8zM9 30h1v1H9zM10 30h1v1h-1zM11 30h1v1h-1zM12 30h1v1h-1zM13 30h1v1h-1zM14 29h1v1h-1zM15 28h1v1h-1zM15 27h1v1h-1zM17 25h1v1h-1zM18 24h1v1h-1zM18 23h1v1h-1zM18 22h1v1h-1zM17 21h1v1h-1zM17 20h1v1h-1zM17 19h1v1h-1zM17 18h1v1h-1zM17 17h1v1h-1zM15 16h1v1h-1zM15 15h1v1h-1zM15 14h1v1h-1zM11 11h1v1h-1zM10 10h1v1h-1zM8 12h1v1H8zM8 11h1v1H8zM8 10h1v1H8z"/>
      <path fill="#ffea7d" d="M11 13h1v1h-1zM12 14h1v1h-1zM13 15h1v1h-1zM16 20v-3h-1v-1h-1v2h1v4h1v-2M20 9h1v1h-1zM18 9h1v1h-1zM16 22v3h1v-2h1v-1h-2M15 25h1v1h-1zM14 26h1v1h-1zM13 28H8v1h6v-2h-1zM8 26H7v2h1v-2M5 23v3h1v-4H5zM7 21v-1H6v2h1zM8 19v-2H7v3h1zM0 10h1v1H0zM8 16h1v1H8zM10 15v-3h1v-1h-1V9H9v7h1z"/>
      <path fill="#eb222a" d="M12 31H8v1h6v-1h-2M14 30h1v1h-1zM15 29h1v1h-1zM19 24h1v1h-1zM19 22h1v1h-1zM18 21h1v1h-1zM20 20h1v1h-1zM18 19h1v1h-1zM19 17h1v1h-1zM18 4h1v1h-1zM19 11h1v1h-1zM13 29H9v1h5v-1zM14 28v1h1v-2h-1zM16 26h-1v1h1v1h1v-3h-1zM17 24v1h1v-2h-1zM17 21v-6h-1v7h1zM13 14h1v1h1v-2h-3v1zM11 12h1v1h-1zM10 8h1v1h-1zM6 26h1v1H6zM5 25v-1H4v-1H3v2h1v2h1v-2M4 22h1v1H4zM5 21h1v1H5zM6 19h1v1H6zM12 24H8v1h6v-1h-2M7 16h1v1H7zM9 15v-1H8v2h1zM8 29H7v2h1v-2M6 28h1v1H6zM5 27h1v1H5zM2 22h1v1H2zM3 21h1v1H3zM5 20v-1H4v2h1zM6 18v-2H5v3h1zM6 15h1v1H6zM3 4h1v1H3zM9 8V7h1V5H9v1H8v3h1zM7 5H6v1h2V5zM8 3h1v1H8zM8 12V9H7v5h1v-2M9 2h1v1H9zM8 1h1v1H8zM11 11h1V9h-1v2M12 11h1v1h-1zM9 0h1v1H9z"/>
      <path fill="#f16325" d="M13 14h1v1h-1zM14 15h1v1h-1z"/>
      <path fill="#fff" d="M8 20h1v1H8zM8 19h1v1H8zM9 19h1v1H9zM8 21h1v1H8zM9 21h1v1H9zM10 21h1v1h-1zM10 20h1v1h-1z"/>
      <path d="M9 20h1v1H9z"/>
      <path fill="#fff" d="M12 20h1v1h-1zM12 19h1v1h-1zM13 19h1v1h-1zM14 20h1v1h-1zM14 21h1v1h-1zM12 21h1v1h-1zM13 21h1v1h-1z"/>
      <path d="M13 20h1v1h-1z"/>
    </g>
    <g id="frame4">
      <path fill="#fad61f" d="M16 17h1v1h-1zM15 26h1v1h-1zM14 25H8v-1h6zh1v-1h1v-2h-4v-3h2v1h1v-2h-3v-2h-1v-2h-1v2H9v1H8v2h2v1h1v2H8v-2H7v2H6v4h2v1h5v-1h1zM7 31h1v1H7zM6 29h1v1H6zM5 28h1v1H5zM4 27h1v1H4zM3 26h1v1H3zM2 25h1v1H2zM2 22h1v1H2zM1 3h1v1H1zM4 20v-1H3v2h1zM4 14h1v1H4zM6 13h1v1H6zM4 18h1v1H4zM3 15h1v1H3zM18 8h1v1h-1zM16 14h1v1h-1zM13 12h1v1h-1zM11 7h1v1h-1zM17 26h1v1h-1zM16 29v1h1v-2h-1zM15 30h1v1h-1zM14 31h1v1h-1zM5 5h1v1H5zM13 10V9h-1v3h1v-2"/>
      <path fill="#ffea7d" d="M9 10h1v1H9zM9 11h1v1H9zM9 12h1v1H9zM10 13h1v1h-1zM11 14h1v1h-1zM11 15h1v1h-1zM13 17h1v1h-1zM12 16h1v1h-1zM12 15h1v1h-1zM15 19h1v1h-1zM15 20h1v1h-1zM15 18h1v1h-1zM12 17h1v1h-1zM20 7h1v1h-1zM18 5h1v1h-1zM17 22h1v1h-1zM15 21h1v1h-1zM16 24h1v1h-1zM16 23h1v1h-1zM16 22h1v1h-1zM15 24h1v1h-1zM14 26h1v1h-1zM14 25h1v1h-1zM13 26h1v1h-1zM12 27h1v1h-1zM11 27h1v1h-1zM9 27h1v1H9zM8 27h1v1H8zM7 27h1v1H7zM7 26h1v1H7zM5 25h1v1H5zM5 24h1v1H5zM5 23h1v1H5zM5 22h1v1H5zM6 21h1v1H6zM6 20h1v1H6zM7 19h1v1H7zM7 18h1v1H7zM7 17h1v1H7zM0 5h1v1H0zM8 16h1v1H8zM9 15h1v1H9zM9 14h1v1H9zM9 13h1v1H9z"/>
      <path fill="#f16325" d="M10 12v1h1v-3h-1v2M9 13v-2H8v3h1zM8 15v-1H7v2h1zM7 18v-2H6v3h1zM6 20v-1H5v2h1zM4 21h1v1H4zM3 22h1v1H3zM4 23h1v1H4zM3 25h1v1H3zM5 26h1v1H5zM6 27h1v1H6zM7 28h1v1H7zM9 28h1v1H9zM11 28h1v1h-1zM13 28h1v1h-1zM12 30H8v1h6v-1h-2M14 29h1v1h-1zM15 28v1h1v-2h-1zM17 25h1v1h-1zM18 22v3h1v-3zM18 20v-1h-1v3h1v-2M15 18v-2h-2v1h1v1zM13 15h1v-1h-2v1zM11 13h1v1h-1zM15 13h1v1h-1zM9 9h1v1H9z"/>
      <path fill="#ffea7d" d="M10 27h1v1h-1zM13 27h1v1h-1z"/>
      <path fill="#eb222a" d="M12 31H8v1h6v-1h-2M14 30h1v1h-1zM15 29h1v1h-1zM18 21h1v1h-1zM20 20h1v1h-1zM18 2h1v1h-1zM13 15v1h2v2h1v-3h-3M19 4h1v1h-1zM9 30h5v-1h-1v-1h-1v1h-1v-1h-1v1H9v-1H8v1H7v2h1v-1zM15 28v-1h-1v2h1zM15 25v1h1v2h1v-3h-2M17 24v1h1v-2h-1zM16 20v2h1v-4h-1v2M8 5h1v1H8zM6 26h1v1H6zM5 25v-1H4v-1H3v2h1v2h1v-2M4 22h1v1H4zM5 21h1v1H5zM6 19h1v1H6zM12 24H8v1h6v-1h-2M7 16h1v1H7zM9 15v-1H8v2h1zM6 28h1v1H6zM5 27h1v1H5zM2 18h1v1H2zM3 21h1v1H3zM5 20v-1H4v2h1zM6 18v-2H5v3h1zM6 15h1v1H6zM4 8h1v1H4zM8 12v-1h1v-1H8V9H7V8H6v3h1v3h1v-2M12 2h1v1h-1zM10 9v1h1v3h1v1h2v-1h-1v-1h-1V9h-1V7h-1v1H9v1zM8 7h1v1H8zM7 6h1v1H7z"/>
      <path d="M9 20h1v1H9z"/>
      <path fill="#fff" d="M10 21H9v-1h1v-1H8v3h3v-2h-1zM14 20v1h-1v-1zv-1h-2v3h3v-2z"/>
      <path d="M13 20h1v1h-1z"/>
    </g>
    <g id="frame5">
      <path fill="#f16325" d="M18 25h1v1h-1zM19 24h1v1h-1zM19 23h1v1h-1zM20 22h1v1h-1zM18 16h1v1h-1zM18 15h1v1h-1zM14 11h1v1h-1zM14 8h1v1h-1zM14 7h1v1h-1zM19 18h1v1h-1zM19 17h1v1h-1zM15 12h1v1h-1zM14 12h1v1h-1zM15 13h1v1h-1zM16 15h1v1h-1zM16 16h1v1h-1zM13 11h1v1h-1zM10 6h1v1h-1zM8 9h1v1H8zM7 10h1v1H7zM8 11h1v1H8zM3 11h1v1H3zM8 12h1v1H8zM6 15h1v1H6zM8 13h1v1H8zM7 15h1v1H7zM6 16h1v1H6zM6 17h1v1H6zM6 18h1v1H6zM4 19h1v1H4zM4 20h1v1H4zM4 21h1v1H4zM3 22h1v1H3zM4 23h1v1H4zM3 25h1v1H3zM5 26h1v1H5zM6 27h1v1H6zM13 27h1v1h-1zM8 30h1v1H8zM9 30h1v1H9zM10 30h1v1h-1zM11 30h1v1h-1zM12 30h1v1h-1zM13 30h1v1h-1zM14 29h1v1h-1zM15 28h1v1h-1zM15 27h1v1h-1zM17 25h1v1h-1zM18 24h1v1h-1zM19 21h1v1h-1zM19 20h1v1h-1zM19 19h1v1h-1zM13 10h1v1h-1z"/>
      <path fill="#fad61f" d="M16 12h1v1h-1zM20 15h1v1h-1zM22 18h1v1h-1zM22 19h-1v2h1v-2M21 23h1v1h-1zM19 25h1v1h-1zM22 21h1v1h-1zM18 27h1v1h-1zM9 28h1v1H9zM13 26h1v-1H8v-1h6v1h1v-1h1v-2h1v-5h-1v-3h-1v-1h-1v-1h-2v-2h-1V8h-1v2H8v1h1v5H8v3h2v1h1v2H8v-2H6v6h2v1h5zm-1-5v-2h2v1h1v2h-3zM11 28h1v1h-1zM15 26h1v1h-1zM13 28h1v1h-1zM7 31h1v1H7zM6 29h1v1H6zM5 28h1v1H5zM4 27h1v1H4zM3 26h1v1H3zM2 25h1v1H2zM2 22h1v1H2zM3 20v-1H2v2h1zM6 9v1h1V7H6v2M6 6V5H5v2h1zM6 1V0H5v2h1zM5 19v-3H4v2H3v1h2M6 12v2h1v-3H6zM15 10h1v1h-1zM13 7h1v1h-1zM13 5h1v1h-1zM17 26h1v1h-1zM16 29v1h1v-2h-1zM15 30h1v1h-1zM14 31h1v1h-1z"/>
      <path fill="#f16325" d="M8 8h1v1H8zM8 7h1v1H8z"/>
      <path fill="#ffea7d" d="M13 6h1v1h-1zM12 12h1v-2h-1v2M13 8h1v1h-1zM21 12h1v1h-1zM16 6h1v1h-1zM18 21v-4h-1v5h-1v2h-1v1h2v-2h2v-1h-1zM11 27H8v-1H7v2h6v-1h-2M11 9v1h1V7h-2v1h1zM20 7h1v1h-1zM18 5h1v1h-1zM14 26h-1v1h2v-2h-1zM5 23v3h1v-4H5zM5 20h1v1H5zM8 20v-4H7v3H6v1h2M9 15v-1H8v2h1zM10 9V8H9v2h1z"/>
      <path fill="#eb222a" d="M20 24v1h1v-2h-1zM21 22h1v1h-1zM19 16h1v1h-1zM20 10h1v1h-1zM23 14h1v1h-1zM19 22h1v1h-1zM20 19v3h1v-5h-1v2M18 15v-1h-1v-1h-1v2h1v2h1v-2M13 3V1h-1v3h1zM15 11h1v1h-1zM17 9h1v1h-1zM12 31H8v1h6v-1h-2M14 30h1v1h-1zM15 29h1v1h-1zM18 2h1v1h-1zM19 4h1v1h-1zM9 30h5v-1h-1v-1h-1v1h-1v-1h-1v1H9v-1H6v1h1v2h1v-1zM15 28v-1h-1v2h1zM15 25v1h1v2h2v-1h-1v-2h-2M17 23v2h1v-1h1v-1h-2M6 26h1v1H6zM5 25v-1H4v-1H3v2h1v2h1v-2M4 22h1v1H4zM5 21h1v1H5zM12 24H8v1h6v-1h-2M3 13h1v1H3zM8 9V7h1V6H8V5H7V4H6v3h1v3h1zM5 27h1v1H5zM1 18h1v1H1zM4 20v-1H3v3h1v-2M4 16h1v4h1v-5h2v-4H7v3H4v2M6 10h1v1H6zM4 3h1v1H4zM19 20v-3h-1v5h1v-2"/>
      <path fill="#eb222a" d="M9 5h1v1h1v1h1v3h2v1h1V9h-2V5h-2V4h-1V1H9v2H8v1h1z"/>
      <path d="M9 20h1v1H9z"/>
      <path fill="#fff" d="M8 21v1h3v-2h-1v1H9v-1h1v-1H8v2M14 21h-1v-1h1v-1h-2v3h3v-2h-1z"/>
      <path d="M13 20h1v1h-1z"/>
      <path fill="#f16325" d="M9 6h1v1H9zM9 7h1v1H9z"/>
    </g>
    <g id="frame6">
      <path fill="#fad61f" d="M15 27v-1h2v-1h1v-3h-1v-2h-1v-3h-1v-1h-1v-3h-1v-2h-1v-1h-1V9h-1v2h1v1h-1v1H9v2H8v1H7v2H6v6h1v2h1v1h1v1h6zm-3-6v-2h2v1h1v2h-3zm-4 1v-3h2v1h1v2zM15 31h1v1h-1zM16 30h1v1h-1zM17 29v1h1v-2h-1zM18 27h1v1h-1zM19 26h1v1h-1zM21 25h1v1h-1zM21 23h1v1h-1zM20 10h1v1h-1zM20 6h1v1h-1zM21 21h1v1h-1zM21 19h-1v2h1v-2M21 18h1v1h-1zM20 17h-1v2h1v-2M15 4h1v1h-1zM14 8h1v1h-1zM14 6h-1v2h1V6M13 2h1v1h-1zM12 1h1v1h-1zM10 1h1v1h-1zM10 4V3H9v2h1zM8 7h1V5H8v2M7 4h1v1H7zM7 8h1v1H7zM7 10h1v1H7zM6 11h1v1H6zM5 10h1v1H5zM3 15h1v1H3zM5 14v-1H4v2h1zM2 18h1v1H2zM1 15h1v1H1zM2 20h1v1H2zM3 24v-1H2v2h1zM1 21h1v1H1zM3 26h1v1H3zM4 27h1v1H4zM5 28h1v1H5zM6 29h1v1H6zM7 30h1v1H7zM8 31h1v1H8zM18 15v1h1v-3h-1v2M19 12h1v1h-1zM18 6h1v1h-1zM16 10h1v1h-1zM17 12h1v1h-1z"/>
      <path fill="#f16325" d="M12 7V3h-1v2h-1v1h1v3h1V7M13 9h-1v1h2V9zM14 10h1v1h-1zM16 11h-1v2h1v-2M17 14v-1h-1v3h1v-2M18 17v-1h-1v3h1v-2M19 19h-1v2h1v-2M19 21h1v1h-1zM20 22h1v1h-1zM19 23h1v1h-1zM20 24h1v1h-1zM19 25h1v1h-1zM17 26h1v1h-1zM16 27h1v1h-1zM15 29v1h1v-2h-1zM13 30H9v1h6v-1h-2M8 29h1v1H8zM7 28h1v1H7zM6 27h1v1H6zM5 26h1v1H5zM5 24v-1H4v3h1v-2M3 22h1v1H3zM5 21v-1H4v2h1zM3 19h1v1H3zM5 18v-1H4v2h1zM6 16v-1H5v2h1zM7 14v-1H6v2h1zM7 12h1v1H7zM8 11h1v1H8zM9 10h1v1H9zM8 9h1v1H8zM10 8V7H9v2h1z"/>
      <path d="M13 20h1v1h-1z"/>
      <path fill="#fff" d="M14 20v1h-1v-1zv-1h-2v3h3v-2zM10 21H9v-1h1v-1H8v3h3v-2h-1z"/>
      <path d="M9 20h1v1H9z"/>
      <path fill="#ffea7d" d="M10 6h1v1h-1zM9 12h1v1H9zM10 11h1v1h-1zM10 7h1v1h-1zM10 8h1v1h-1zM8 13h1v1H8zM8 14h1v1H8zM7 15h1v1H7zM6 17h1v1H6zM5 19h1v1H5zM3 16h1v1H3zM2 8h1v1H2zM4 8h1v1H4zM5 22h1v1H5zM6 24h1v1H6zM6 25h1v1H6zM7 26h1v1H7zM8 27h1v1H8zM10 28h1v1h-1zM11 28h1v1h-1zM13 28h1v1h-1zM14 28h1v1h-1zM15 27h1v1h-1zM15 26h1v1h-1zM17 25h1v1h-1zM18 24h1v1h-1zM18 23h1v1h-1zM18 22h1v1h-1zM17 21h1v1h-1zM17 20h1v1h-1zM16 19h1v1h-1zM16 18h1v1h-1zM16 17h1v1h-1zM19 14h1v1h-1zM20 13h1v1h-1zM22 17h1v1h-1zM15 16h1v1h-1zM14 15h1v1h-1zM14 14h1v1h-1zM14 13h1v1h-1zM13 12h1v1h-1zM13 11h1v1h-1zM12 10h1v1h-1zM11 9h1v1h-1zM12 28h1v1h-1zM9 28h1v1H9z"/>
      <path fill="#eb222a" d="M8 30h1v1H8zM7 29h1v1H7zM6 28h1v1H6zM5 27h1v1H5zM4 26h1v1H4zM4 24v-1H3v3h1v-2M2 22h1v1H2zM3 21h1v1H3zM2 19h1v1H2zM4 17H3v2h1v-2M5 16v-1H4v2h1zM4 3h1v1H4zM3 14h1v1H3zM13 31H9v1h6v-1h-2M1 11h1v1H1zM15 30h1v1h-1zM10 30h5v-1H9v1zM8 28h1v1H8zM7 27h1v1H7zM6 26h1v1H6zM5 25v1h1v-3H5v2M4 22h1v1H4zM6 21v-1H5v2h1zM4 19h1v1H4zM5 18v1h1v-2H5zM6 16v1h1v-2H6zM7 14v1h1v-2H7zM8 12h1v1H8zM9 11h1v1H9zM9 9h1v1H9zM16 26h1v1h-1zM18 26v1h1v-2h-1zM19 24h1v1h-1zM19 22h1v1h-1zM18 21h1v1h-1zM17 19h1v1h-1zM16 16h1v1h-1zM16 14v-1h-1v3h1v-2M15 11h-1v2h1v-2M13 10h1v1h-1zM16 29v1h1v-2h-1zM17 27h1v1h-1zM20 25h1v1h-1zM21 24h1v1h-1zM20 23h1v1h-1zM21 22h1v1h-1zM20 21h1v1h-1zM19 20v1h1v-2h-1zM19 17v-1h-1v3h1v-2M19 15h1v1h-1zM20 18h1v1h-1zM21 19h1v1h-1zM18 14v-1h-1v3h1v-2M18 9h1v1h-1zM19 3h1v1h-1zM16 13h1v-2h-1v2M15 10h1v1h-1zM14 9h1v1h-1zM13 8V4h-1v5h2V8zM11 4V3h1V1h-1v1h-1v3h1zM10 6V5H9v2h1zM9 8V7H8v2h1zM6 5h1v1H6zM7 9h1v1H7zM8 10h1v1H8zM7 11h1v1H7zM4 6h1v1H4zM6 12h1v1H6zM6 14v-1H5v2h1zM12 0h1v1h-1zM12 24H8v1h6v-1h-2"/>
    </g>
  </svg>
`
