const sheet = new CSSStyleSheet()
sheet.replaceSync(`
  hotfx-mouse-move {
    display: block;
  }
`)

class HotFXMouseMove extends HTMLElement {

  constructor() {
    super()
    window.addEventListener('mousemove', this.#handleMouseMove)
    window.addEventListener('wheel', this.#handleMouseMove)
    this.style.setProperty('--hotfx-mouse-x', 0.0)
    this.style.setProperty('--hotfx-mouse-y', 0.0)
  }

  connectedCallback() {
    const root = this.getRootNode()
    if (root.adoptedStyleSheets.includes(sheet)) return
    root.adoptedStyleSheets = [...root.adoptedStyleSheets, sheet]
  }

  #handleMouseMove = (event) => {
    const rect = this.getBoundingClientRect()
    this.style.setProperty(
      '--hotfx-mouse-x',
      Math.min(Math.max((event.clientX - rect.left) / rect.width, 0), 1),
    )
    this.style.setProperty(
      '--hotfx-mouse-y',
      Math.min(Math.max((event.clientY - rect.top) / rect.height, 0), 1),
    )
  }
}

customElements.define('hotfx-mouse-move', HotFXMouseMove)
