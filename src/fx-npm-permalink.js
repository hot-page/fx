class FXNPMPermalink extends HTMLElement {
  #link

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.#render()
  }

  copy() {
    const node = document.createElement('pre')
    node.style.width = '1px'
    node.style.height = '1px'
    node.style.position = 'fixed'
    node.style.top = '5px'
    node.textContent = this.#link
    document.body.appendChild(node)
    const selection = getSelection()
    selection.removeAllRanges()
    const range = document.createRange()
    range.selectNodeContents(node)
    selection.addRange(range)
    document.execCommand('copy')
    selection.removeAllRanges()
    document.body.removeChild(node)
    this.shadowRoot.querySelector('#container').classList.add('copied')
    setTimeout(() => {
      this.shadowRoot.querySelector('#container').classList.remove('copied')
    }, 2000)
  }

  async #render() {
    const pkg = this.getAttribute('package')
    const response = await fetch(`https://registry.npmjs.org/${pkg}/latest`)
    const data = await response.json()
    const file = this.getAttribute('file') || data.main
    this.#link = `https://cdn.jsdelivr.net/npm/${pkg}@${data.version}/${file}`
    this.shadowRoot.innerHTML = `
      <style>
        #link {
          word-break: break-word;
        }

        #copy {
          cursor: pointer;
        }

        svg {
          height: 1em;
          width: 1em;
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
        <svg id="copy" fill="currentColor" viewBox="0 0 384 512" height="200px" width="200px" xmlns="http://www.w3.org/2000/svg"><path d="M192 0c-41.8 0-77.4 26.7-90.5 64H64C28.7 64 0 92.7 0 128V448c0 35.3 28.7 64 64 64H320c35.3 0 64-28.7 64-64V128c0-35.3-28.7-64-64-64H282.5C269.4 26.7 233.8 0 192 0zm0 64a32 32 0 1 1 0 64 32 32 0 1 1 0-64zM112 192H272c8.8 0 16 7.2 16 16s-7.2 16-16 16H112c-8.8 0-16-7.2-16-16s7.2-16 16-16z"></path></svg>
      </div>
    `
    this.shadowRoot.querySelector('#copy').addEventListener('click', () => this.copy())
  }
}

customElements.define('fx-npm-permalink', FXNPMPermalink)
