class HotFXCopyButton extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.addEventListener('click', this.#handleClick)
    this.#render()
  }

  #handleClick = async (event) => {
    event.preventDefault()
    if (!this.hasAttribute('target')) {
      console.error('Missing required attribute "target"')
    }
    const elem = document.querySelector(this.getAttribute('target'))
    if (!elem) {
      console.error(`Could not find target element ${this.getAttribute('target')}`)
      return
    }
    const data = {
      'text/plain': new Blob([elem.innerText], { type: 'text/plain' })
    }
    if (this.hasAttribute('as-html')) {
      data['text/html'] = new Blob([elem.innerHTML], { type: 'text/plain' })
    }
    try {
      await navigator.clipboard.write([new ClipboardItem(data)])
      this.classList.add('copied')
      setTimeout(() => this.classList.remove('copied'), 2000)
    } catch (error) {
      console.error('could not copy!', error)
    }
  }

  #render() {
    this.shadowRoot.innerHTML = `
      <style>
        button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
        }

        svg {
          width: 1.5em;
          height: 1.5em;
          line-height: 1;
        }

        #success {
          display: none;
        }

        :host(.copied) #copy {
          display: none;
        }

        :host(.copied) #success {
          display: block;
        }
      </style>
      <button>
        <svg id="copy" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"></path></svg>
        <svg id="success" fill="currentColor" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"></path></svg>
      </button>
    `
  }
}

customElements.define('hotfx-copy-button', HotFXCopyButton)
