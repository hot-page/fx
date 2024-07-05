class HotFXLoupe extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.#render()
    this.#image.addEventListener('mousemove', this.#handleMouseMove)
    this.#image.addEventListener('wheel', this.#handleMouseMove)
  }

  get #image() {
    return document.querySelector(this.getAttribute('target'))
  }

  #handleMouseMove = event => {
    const rect = this.#image.getBoundingClientRect()
    const loupe = this.shadowRoot.querySelector('img')
    const x = -1 * (event.clientX - rect.left) / this.#image.clientWidth * (loupe.clientWidth - this.clientWidth)
    const y = -1 * (event.clientY - rect.top) / this.#image.clientHeight * (loupe.clientHeight - this.clientHeight)
    loupe.style.transform = `translate(${x}px, ${y}px)`
  }

  #render() {
    if (!this.#image) {
      this.shadowRoot.innerHTML = `Canot find target: ${selector}`
      return
    }
    this.shadowRoot.innerHTML = `
      <style>
        #mask {
          height: 100%;
          width: 100%;
          background: #eee;
          overflow: clip;
        }
      </style>
      <div id="mask">
        ${this.#image.outerHTML}
      </div>
    `
  }

}

customElements.define('hotfx-loupe', HotFXLoupe)
