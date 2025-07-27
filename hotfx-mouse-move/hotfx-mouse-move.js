class HotFXMouseMove extends HTMLElement {

  constructor() {
    super()
    this.addEventListener('mousemove', this.#handleMouseMove)
  }

  #handleMouseMove(event) {
    const rect = this.getBoundingClientRect()
    this.style.setProperty('--hotfx-mouse-x', (event.clientX - rect.left) / rect.width)
    this.style.setProperty('--hotfx-mouse-y', (event.clientY - rect.top) / rect.height)
  }
}

customElements.define('hotfx-mouse-move', HotFXMouseMove)
