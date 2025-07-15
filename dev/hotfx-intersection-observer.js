// Adds :state(intersecting) when the element is fully visible in the viewport
class HotFXIntersectionObserver extends HTMLElement {
  #internals
  #observer

  constructor() {
    super()
    this.#internals = this.attachInternals()
  }

  connectedCallback() {
    this.#observer = new IntersectionObserver(this.#callback, {
      threshold: 1,
    }).observe(this)
  }

  disconnectedCallback() {
    this.#observer?.disconnect()
  }

  #callback = (entries) => {
    if (entries[0].isIntersecting) {
      console.log('Element is fully visible in the viewport')
      this.#internals.states.add('intersecting')
    }
  }
}

customElements.define('hotfx-intersection-observer', HotFXIntersectionObserver)
