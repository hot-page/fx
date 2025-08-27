const styleSheet = new CSSStyleSheet()
styleSheet.replaceSync(`
  :host {
    display: block;
    width: calc(100% / var(--hotfx-scale, 1));
    min-width: 0;
    transform: scale(var(--hotfx-scale, 1));
    transform-origin: top left;
  }
`)

class HotFXScale extends HTMLElement {
  #resizeObserver

  connectedCallback() {
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.adoptedStyleSheets = [styleSheet]
    this.shadowRoot.innerHTML = `<slot></slot>`
    this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.#onSlotChange)
    this.#onSlotChange()
  }

  disconntedCallback() {
    this.#resizeObserver?.disconnect()
    this.#resizeObserver = null
  }

  #onSlotChange = () => {
    this.#resizeObserver?.disconnect()
    this.#resizeObserver = new ResizeObserver(this.#onResize)
    Array.from(this.children).forEach(el => this.#resizeObserver.observe(el))
  }

  #onResize = () => {
    const scale = window
      .getComputedStyle(this)
      .getPropertyValue('--hotfx-scale')
    if (scale) {
      const height = Array.from(this.children)
        .reduce((height, child) => height + child.offsetHeight, 0)
      this.style.height = `${height * scale}px`
    } else {
      this.style.height = ''
    }
  }

}

customElements.define('hotfx-scale', HotFXScale)
