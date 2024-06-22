class HotFXNPMPermalink extends HTMLElement {
  #link

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.#render()
  }

  copy() {
    const el = document.createElement('pre')
    el.style.width = '1px'
    el.style.height = '1px'
    el.style.position = 'fixed'
    el.style.top = '5px'
    el.textContent = this.#link
    document.body.appendChild(el)
    const selection = getSelection()
    selection.removeAllRanges()
    const range = document.createRange()
    range.selectNodeContents(el)
    selection.addRange(range)
    document.execCommand('copy')
    selection.removeAllRanges()
    document.body.removeChild(el)
    this.shadowRoot.querySelector('#container').classList.add('copied')
    setTimeout(() => {
      this.shadowRoot.querySelector('#container').classList.remove('copied')
    }, 2000)
  }

  async #render() {
    const pkg = this.getAttribute('package')
    const response = await fetch(`https://registry.npmjs.org/${pkg}/latest`)
    const data = await response.json()
    const file = this.getAttribute('file') ? '/' + this.getAttribute('file') : ''
    this.#link = `https://cdn.jsdelivr.net/npm/${pkg}@${data.version}${file}`
    this.shadowRoot.innerHTML = `
      <style>
        #link {
          word-break: break-word;
        }

        #copy {
          cursor: pointer;
        }

        svg {
          height: 1.2em;
          width: 1.2em;
          position: relative;
          top: 0.1em;
        }

        #success {
          display: none;
        }

        #container.copied #success {
          display: inline;
        }

        #container.copied #copy {
          display: none;
        }
      </style>
      <div id="container">
        <span id="link" part="link">${this.#link}</span>
        <svg id="success" fill="currentColor" viewBox="0 0 448 512" height="200px" width="200px" xmlns="http://www.w3.org/2000/svg"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path></svg>
        <svg id="copy" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>
      </div>
    `
    this.shadowRoot.querySelector('#copy').addEventListener('click', () => this.copy())
  }
}

customElements.define('hotfx-npm-permalink', HotFXNPMPermalink)
