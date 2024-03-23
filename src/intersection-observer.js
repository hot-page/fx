
// The <interection-observer> mimcs the JavaScript API of IntersectionObserver.
// TODO:
//   - add attributes for root, rootMargin, threshold
//   - allow multiple targets (just needs querySelectorAll?

class IntersectionObserverElement extends HTMLElement {
  #intersectionObserver

  static get observedAttributes() { return ['target'] }

  constructor() {
    super()
    this.#createIntersectionObserver()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.#createIntersectionObserver()
  }

  #createIntersectionObserver() {
    if (this.#intersectionObserver) this.#intersectionObserver.disconnect()
    this.#intersectionObserver = new IntersectionObserver(this.#intersectionCallback)
    const target = this.hasAttribute('target') ?
      document.querySelector(this.getAttribute('target')) :
      this
    this.#intersectionObserver.observe(target)
  }

  #intersectionCallback = (entries) => {
    if (entries[0].isIntersecting) {
      this.classList.add('is-intersecting')
    } else {
      this.classList.remove('is-intersecting')
    }
  }
}

customElements.define(
  'intersection-observer',
  IntersectionObserverElement,
)
