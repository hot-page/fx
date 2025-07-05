class HotFXMouseMove extends HTMLElement {

  constructor() {
    super()
    this.addEventListener('mousemove', this.#handleMouseMove)
  }

  #handleMouseMove(event) {
    this.style.setProperty('--x', event.clientX + 'px')
    this.style.setProperty('--y', event.clientY + 'px')
  }
}

customElements.define('hotfx-mouse-move', HotFXMouseMove)
