class FXHotDemo extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.#render()
    this.#fetch()
  }

  toggleHTML() {
    const source = this.shadowRoot.querySelector('#source')
    if (source.style.gridTemplateRows) {
      source.style.gridTemplateRows = ''
    } else {
      source.style.gridTemplateRows = '1fr'
    }
  }

  async #fetch() {
    const response = await fetch(this.getAttribute('src'))
    const html = await response.text()
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, "text/html")
    this.shadowRoot.querySelector('#source code').textContent = `
      ${doc.querySelector('head style').outerHTML}
      ${doc.body.innerHTML}`
    Prism.highlightElement(this.shadowRoot.querySelector('#source code'))
    const body = this.shadowRoot.querySelector('#body')
    if (this.hasAttribute('use-iframe')) {
      const iframe = document.createElement('iframe')
      iframe.srcdoc = html
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
        }

        #body iframe {
          margin: 16px;
          margin-left: calc(50% - 400px);
          border: 1px solid var(--secondary-color);
        }

        #source {
          display: grid;
          grid-template-rows: 0fr;
          min-height: 0;
          background-color: var(--secondary-color-extra-dark);
          transition: grid-template-rows 300ms ease-out;
        }

        #source .container {
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

        footer button svg,
        footer .button svg {
          width: 1rem;
          height: 1rem;
        }

        footer .button .burnout {
          width: 1.5rem;
          height: 1.5rem;
        }

      </style>
      <header>
        <div class="container">
          <h1><slot name="heading"><div></h1>
        </div>
      </header>
      <div id="controls">
        <div class="container">
          <slot name="controls"></slot>
        </div>
      </div>
      <div id="body"></div>
      <div id="source">
        <div class="container">
          <pre class="language-html">
            <code></code>
          </pre>
        </div>
      </div>
      <footer>
        <div class="container">
          <button class="html">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 21"><path fill="white" d="M12.12 9.792 11 10.913v-4.17a1 1 0 0 0-2 0v4.17l-1.121-1.12a1 1 0 1 0-1.414 1.413l2.828 2.828a.995.995 0 0 0 1.083.22 1 1 0 0 0 .33-.22l2.828-2.827a1 1 0 0 0-1.414-1.415m2.878-8.209C10.217-1.177 4.102.461 1.341 5.243S.218 16.14 5.001 18.901c4.781 2.76 10.897 1.122 13.657-3.66 2.762-4.782 1.123-10.897-3.66-13.658m1.929 12.658a7.999 7.999 0 1 1-13.854-8 7.999 7.999 0 0 1 13.854 8"/></svg>
            Show HTML
          </button>
          <div class="right">
            <button>
              <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="200px" width="200px" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0V0z"></path><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>
              Copy
            </button>
            <a
              class="button"
              href="https://hotpage.dev/new?template=fx${this.getAttribute('src')}"
              target="_blank">
              <svg class="burnout" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 32">
                <path fill="#FAD61F" d="M10,9 L15,9 L15,11 L16,11 L16,17 L18,17 L18,27 L16,27 L16,29 L7,29 L7,27 L4,27 L4,17 L7,17 L7,11 L10,11 Z" />
                <path fill="#EB222A" d="M12,31 L13,31 L13,32 L12,32 Z M13,31 L14,31 L14,32 L13,32 Z M14,30 L15,30 L15,31 L14,31 Z M15,29 L16,29 L16,30 L15,30 Z M16,28 L17,28 L17,29 L16,29 Z M17,27 L18,27 L18,28 L17,28 Z M18,26 L19,26 L19,27 L18,27 Z M19,25 L20,25 L20,26 L19,26 Z M19,24 L20,24 L20,25 L19,25 Z M19,23 L20,23 L20,24 L19,24 Z M20,22 L21,22 L21,23 L20,23 Z M19,21 L20,21 L20,22 L19,22 Z M19,20 L20,20 L20,21 L19,21 Z M20,19 L21,19 L21,20 L20,20 Z M19,18 L20,18 L20,19 L19,19 Z M19,17 L20,17 L20,18 L19,18 Z M18,16 L19,16 L19,17 L18,17 Z M18,11 L19,11 L19,12 L18,12 Z M18,15 L19,15 L19,16 L18,16 Z M19,14 L20,14 L20,15 L19,15 Z M11,31 L12,31 L12,32 L11,32 Z M10,31 L11,31 L11,32 L10,32 Z M9,31 L10,31 L10,32 L9,32 Z M8,31 L9,31 L9,32 L8,32 Z" />
                <path fill="#FAD61F" d="M7,31 L8,31 L8,32 L7,32 Z M6,30 L7,30 L7,31 L6,31 Z M5,29 L6,29 L6,30 L5,30 Z M4,28 L5,28 L5,29 L4,29 Z M3,27 L4,27 L4,28 L3,28 Z M2,26 L3,26 L3,27 L2,27 Z M1,25 L2,25 L2,26 L1,26 Z M1,23 L2,23 L2,24 L1,24 Z M2,14 L3,14 L3,15 L2,15 Z" />
                <path fill="#FAD61F" d="M2,14 L3,14 L3,15 L2,15 Z M1,21 L2,21 L2,22 L1,22 Z M2,20 L3,20 L3,21 L2,21 Z M2,19 L3,19 L3,20 L2,20 Z M1,18 L2,18 L2,19 L1,19 Z M3,18 L4,18 L4,19 L3,19 Z M3,17 L4,17 L4,18 L3,18 Z M7,9 L8,9 L8,10 L7,10 Z M8,8 L9,8 L9,9 L8,9 Z M9,7 L10,7 L10,8 L9,8 Z M9,6 L10,6 L10,7 L9,7 Z M9,5 L10,5 L10,6 L9,6 Z M10,1 L11,1 L11,2 L10,2 Z M12,1 L13,1 L13,2 L12,2 Z M13,4 L14,4 L14,5 L13,5 Z M13,3 L14,3 L14,4 L13,4 Z M14,6 L15,6 L15,7 L14,7 Z M14,5 L15,5 L15,6 L14,6 Z M15,7 L16,7 L16,8 L15,8 Z M15,8 L16,8 L16,9 L15,9 Z M15,10 L16,10 L16,11 L15,11 Z M16,11 L17,11 L17,12 L16,12 Z M17,12 L18,12 L18,13 L17,13 Z M18,13 L19,13 L19,14 L18,14 Z M19,15 L20,15 L20,16 L19,16 Z M18,14 L19,14 L19,15 L18,15 Z M20,18 L21,18 L21,19 L20,19 Z M21,19 L22,19 L22,20 L21,20 Z M20,20 L21,20 L21,21 L20,21 Z M20,23 L21,23 L21,24 L20,24 Z M20,24 L21,24 L21,25 L20,25 Z M21,21 L22,21 L22,22 L21,22 Z" />
                <path fill="#EB222A" d="M21,18 L22,18 L22,19 L21,19 Z" />
                <path fill="#FAD61F" d="M19,26 L20,26 L20,27 L19,27 Z M18,27 L19,27 L19,28 L18,28 Z M17,28 L18,28 L18,29 L17,29 Z M16,29 L17,29 L17,30 L16,30 Z M15,30 L16,30 L16,31 L15,31 Z M14,31 L15,31 L15,32 L14,32 Z M4,15 L5,15 L5,16 L4,16 Z M4,14 L5,14 L5,15 L4,15 Z M3,12 L4,12 L4,13 L3,13 Z M4,11 L5,11 L5,12 L4,12 Z M4,13 L5,13 L5,14 L4,14 Z M6,10 L7,10 L7,11 L6,11 Z M5,12 L6,12 L6,13 L5,13 Z" />
                <path fill="#EB222A" d="M7,30 L8,30 L8,31 L7,31 Z M8,29 L9,29 L9,30 L8,30 Z M9,29 L10,29 L10,30 L9,30 Z M11,29 L12,29 L12,30 L11,30 Z M12,29 L13,29 L13,30 L12,30 Z M13,29 L14,29 L14,30 L13,30 Z M14,28 L15,28 L15,29 L14,29 Z M15,27 L16,27 L16,28 L15,28 Z M16,26 L17,26 L17,27 L16,27 Z M17,25 L18,25 L18,26 L17,26 Z M17,24 L18,24 L18,25 L17,25 Z M17,23 L18,23 L18,24 L17,24 Z M18,22 L19,22 L19,23 L18,23 Z M17,21 L18,21 L18,22 L17,22 Z M17,20 L18,20 L18,21 L17,21 Z M18,19 L19,19 L19,20 L18,20 Z M17,18 L18,18 L18,19 L17,19 Z M17,17 L18,17 L18,18 L17,18 Z M16,16 L17,16 L17,17 L16,17 Z M16,15 L17,15 L17,16 L16,16 Z M15,14 L16,14 L16,15 L15,15 Z M15,13 L16,13 L16,14 L15,14 Z M14,12 L15,12 L15,13 L14,13 Z M13,11 L14,11 L14,12 L13,12 Z M13,9 L14,9 L14,10 L13,10 Z M12,8 L13,8 L13,9 L12,9 Z M10,29 L11,29 L11,30 L10,30 Z M7,28 L8,28 L8,29 L7,29 Z M6,27 L7,27 L7,28 L6,28 Z M5,26 L6,26 L6,27 L5,27 Z M4,25 L5,25 L5,26 L4,26 Z M3,24 L4,24 L4,25 L3,25 Z M3,22 L4,22 L4,23 L3,23 Z M4,21 L5,21 L5,22 L4,22 Z M5,19 L6,19 L6,20 L5,20 Z M9,24 L10,24 L10,25 L9,25 Z M8,24 L9,24 L9,25 L8,25 Z M10,24 L11,24 L11,25 L10,25 Z M11,24 L12,24 L12,25 L11,25 Z M12,24 L13,24 L13,25 L12,25 Z M13,24 L14,24 L14,25 L13,25 Z M6,18 L7,18 L7,19 L6,19 Z M6,17 L7,17 L7,18 L6,18 Z M6,16 L7,16 L7,17 L6,17 Z" />
                <path fill="#FAD61F" d="M6,18 L7,18 L7,19 L6,19 Z M6,17 L7,17 L7,18 L6,18 Z" />
                <path fill="#EB222A" d="M7,15 L8,15 L8,16 L7,16 Z M7,14 L8,14 L8,15 L7,15 Z M7,13 L8,13 L8,14 L7,14 Z M8,12 L9,12 L9,13 L8,13 Z M8,11 L9,11 L9,12 L8,12 Z M9,10 L10,10 L10,11 L9,11 Z M11,9 L12,9 L12,10 L11,10 Z M12,7 L13,7 L13,8 L12,8 Z M6,29 L7,29 L7,30 L6,30 Z M5,28 L6,28 L6,29 L5,29 Z M4,27 L5,27 L5,28 L4,28 Z M3,26 L4,26 L4,27 L3,27 Z M2,25 L3,25 L3,26 L2,26 Z M1,24 L2,24 L2,25 L1,25 Z M2,23 L3,23 L3,24 L2,24 Z M1,22 L2,22 L2,23 L1,23 Z M2,21 L3,21 L3,22 L2,22 Z M3,19 L4,19 L4,20 L3,20 Z M3,20 L4,20 L4,21 L3,21 Z M4,18 L5,18 L5,19 L4,19 Z M4,17 L5,17 L5,18 L4,18 Z M3,15 L4,15 L4,16 L3,16 Z M2,18 L3,18 L3,19 L2,19 Z M1,19 L2,19 L2,20 L1,20 Z M4,16 L5,16 L5,17 L4,17 Z M5,15 L6,15 L6,16 L5,16 Z M5,14 L6,14 L6,15 L5,15 Z M4,12 L5,12 L5,13 L4,13 Z M3,11 L4,11 L4,12 L3,12 Z M5,13 L6,13 L6,14 L5,14 Z M6,12 L7,12 L7,13 L6,13 Z M6,11 L7,11 L7,12 L6,12 Z M7,10 L8,10 L8,11 L7,11 Z M8,9 L9,9 L9,10 L8,10 Z M9,8 L10,8 L10,9 L9,9 Z M10,8 L11,8 L11,9 L10,9 Z M10,7 L11,7 L11,8 L10,8 Z M10,6 L11,6 L11,7 L10,7 Z M10,5 L11,5 L11,6 L10,6 Z M10,4 L11,4 L11,5 L10,5 Z M11,3 L12,3 L12,4 L11,4 Z" />
                <path fill="#F16325" d="M11,3 L12,3 L12,4 L11,4 Z M11,4 L12,4 L12,5 L11,5 Z M11,5 L12,5 L12,6 L11,6 Z M11,6 L12,6 L12,7 L11,7 Z M11,7 L12,7 L12,8 L11,8 Z M11,8 L12,8 L12,9 L11,9 Z M10,9 L11,9 L11,10 L10,10 Z M9,9 L10,9 L10,10 L9,10 Z M8,10 L9,10 L9,11 L8,11 Z M7,11 L8,11 L8,12 L7,12 Z M6,13 L7,13 L7,14 L6,14 Z M6,14 L7,14 L7,15 L6,15 Z M6,15 L7,15 L7,16 L6,16 Z M5,16 L6,16 L6,17 L5,17 Z M5,17 L6,17 L6,18 L5,18 Z M5,18 L6,18 L6,19 L5,19 Z M4,19 L5,19 L5,20 L4,20 Z M4,20 L5,20 L5,21 L4,21 Z M3,21 L4,21 L4,22 L3,22 Z M2,22 L3,22 L3,23 L2,23 Z M3,23 L4,23 L4,24 L3,24 Z M2,24 L3,24 L3,25 L2,25 Z M3,25 L4,25 L4,26 L3,26 Z M4,26 L5,26 L5,27 L4,27 Z M5,27 L6,27 L6,28 L5,28 Z M6,28 L7,28 L7,29 L6,29 Z M7,29 L8,29 L8,30 L7,30 Z M8,30 L9,30 L9,31 L8,31 Z M9,30 L10,30 L10,31 L9,31 Z M10,30 L11,30 L11,31 L10,31 Z M11,30 L12,30 L12,31 L11,31 Z M12,30 L13,30 L13,31 L12,31 Z M13,30 L14,30 L14,31 L13,31 Z M14,29 L15,29 L15,30 L14,30 Z M15,28 L16,28 L16,29 L15,29 Z M16,27 L17,27 L17,28 L16,28 Z M17,26 L18,26 L18,27 L17,27 Z M18,25 L19,25 L19,26 L18,26 Z M18,24 L19,24 L19,25 L18,25 Z M18,23 L19,23 L19,24 L18,24 Z M19,22 L20,22 L20,23 L19,23 Z M18,21 L19,21 L19,22 L18,22 Z M18,20 L19,20 L19,21 L18,21 Z M19,19 L20,19 L20,20 L19,20 Z M18,18 L19,18 L19,19 L18,19 Z M18,17 L19,17 L19,18 L18,18 Z M17,16 L18,16 L18,17 L17,17 Z M17,15 L18,15 L18,16 L17,16 Z M16,14 L17,14 L17,15 L16,15 Z M16,13 L17,13 L17,14 L16,14 Z M15,12 L16,12 L16,13 L15,13 Z M14,11 L15,11 L15,12 L14,12 Z M13,10 L14,10 L14,11 L13,11 Z M14,9 L15,9 L15,10 L14,10 Z M13,8 L14,8 L14,9 L13,9 Z M13,7 L14,7 L14,8 L13,8 Z M12,6 L13,6 L13,7 L12,7 Z M12,5 L13,5 L13,6 L12,6 Z M7,12 L8,12 L8,13 L7,13 Z" />
                <path fill="#EB222A" d="M11,2 L12,2 L12,3 L11,3 Z M12,4 L13,4 L13,5 L12,5 Z M12,3 L13,3 L13,4 L12,4 Z M12,2 L13,2 L13,3 L12,3 Z M11,1 L12,1 L12,2 L11,2 Z M13,6 L14,6 L14,7 L13,7 Z M13,5 L14,5 L14,6 L13,6 Z M14,7 L15,7 L15,8 L14,8 Z M14,8 L15,8 L15,9 L14,9 Z M15,9 L16,9 L16,10 L15,10 Z M14,10 L15,10 L15,11 L14,11 Z M15,11 L16,11 L16,12 L15,12 Z M16,12 L17,12 L17,13 L16,13 Z M17,13 L18,13 L18,14 L17,14 Z M17,14 L18,14 L18,15 L17,15 Z" />
                <path fill="#FFF" d="M8,20 L9,20 L9,21 L8,21 Z M8,19 L9,19 L9,20 L8,20 Z M9,19 L10,19 L10,20 L9,20 Z M12,20 L13,20 L13,21 L12,21 Z M12,19 L13,19 L13,20 L12,20 Z M13,19 L14,19 L14,20 L13,20 Z M14,20 L15,20 L15,21 L14,21 Z M14,21 L15,21 L15,22 L14,22 Z M8,21 L9,21 L9,22 L8,22 Z M12,21 L13,21 L13,22 L12,22 Z M9,21 L10,21 L10,22 L9,22 Z M10,21 L11,21 L11,22 L10,22 Z M10,20 L11,20 L11,21 L10,21 Z M13,21 L14,21 L14,22 L13,22 Z" />
                <path d="M9,20 L10,20 L10,21 L9,21 Z M13,20 L14,20 L14,21 L13,21 Z" />
                <path fill="#FAD61F" d="M12,8 L13,8 L13,9 L12,9 Z M11,9 L12,9 L12,10 L11,10 Z M12,7 L13,7 L13,8 L12,8 Z M12,6 L13,6 L13,7 L12,7 Z" />
                <path fill="#FFEA7D" d="M12,6 L13,6 L13,7 L12,7 Z M13,12 L14,12 L14,13 L13,13 Z M12,11 L13,11 L13,12 L12,12 Z M12,7 L13,7 L13,8 L12,8 Z M12,8 L13,8 L13,9 L12,9 Z M14,13 L15,13 L15,14 L14,14 Z M14,14 L15,14 L15,15 L14,15 Z M15,15 L16,15 L16,16 L15,16 Z M16,17 L17,17 L17,18 L16,18 Z M17,19 L18,19 L18,20 L17,20 Z M19,16 L20,16 L20,17 L19,17 Z M20,15 L21,15 L21,16 L20,16 Z M18,12 L19,12 L19,13 L18,13 Z M17,22 L18,22 L18,23 L17,23 Z M16,24 L17,24 L17,25 L16,25 Z M16,25 L17,25 L17,26 L16,26 Z M15,26 L16,26 L16,27 L15,27 Z M14,27 L15,27 L15,28 L14,28 Z M12,28 L13,28 L13,29 L12,29 Z M11,28 L12,28 L12,29 L11,29 Z M9,28 L10,28 L10,29 L9,29 Z" />
                <path fill="#FFEA7D" d="M9,28 L10,28 L10,29 L9,29 Z M8,28 L9,28 L9,29 L8,29 Z M7,27 L8,27 L8,28 L7,28 Z M6,26 L7,26 L7,27 L6,27 Z M5,25 L6,25 L6,26 L5,26 Z M4,24 L5,24 L5,25 L4,25 Z M4,23 L5,23 L5,24 L4,24 Z M4,22 L5,22 L5,23 L4,23 Z M5,21 L6,21 L6,22 L5,22 Z M5,20 L6,20 L6,21 L5,21 Z M6,19 L7,19 L7,20 L6,20 Z M6,18 L7,18 L7,19 L6,19 Z M6,17 L7,17 L7,18 L6,18 Z M3,14 L4,14 L4,15 L3,15 Z M2,15 L3,15 L3,16 L2,16 Z M0,17 L1,17 L1,18 L0,18 Z M7,16 L8,16 L8,17 L7,17 Z M8,15 L9,15 L9,16 L8,16 Z M8,14 L9,14 L9,15 L8,15 Z M8,13 L9,13 L9,14 L8,14 Z M9,12 L10,12 L10,13 L9,13 Z M9,11 L10,11 L10,12 L9,12 Z M10,10 L11,10 L11,11 L10,11 Z M11,9 L12,9 L12,10 L11,10 Z M10,28 L11,28 L11,29 L10,29 Z M13,28 L14,28 L14,29 L13,29 Z" />
                <path fill="#EB222A" d="M10,0 L11,0 L11,1 L10,1 Z" />
              </svg>
              Use on Hot Page
            </a>
          </span>
        </div>
      </footer>
    `
    this
      .shadowRoot
      .querySelector('button.html')
      .addEventListener('click', () => this.toggleHTML())
  }
}

customElements.define('fx-hot-demo', FXHotDemo)
