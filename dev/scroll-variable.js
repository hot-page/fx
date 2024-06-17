class ScrollVariable extends HTMLElement {
  #intersectionObserver

  static get observedAttributes() { return ['position'] }

  constructor() {
    super()
    this.#createIntersectionObserver()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.#onScroll()
  }

  #createIntersectionObserver() {
    if (this.#intersectionObserver) this.#intersectionObserver.disconnect()
    this.#intersectionObserver = new IntersectionObserver(this.#intersectionCallback)
    const target = this.hasAttribute('target') ?
      document.querySelector(this.getAttribute('target')) :
      this
    this.#intersectionObserver.observe(target)
  }

  #onScroll = () => {
    const rect = this.getBoundingClientRect()
    if (this.getAttribute('position') == 'top') {
      const scroll = (-rect.top / rect.height)
      this.style.setProperty('--scroll', Math.max(0, Math.min(1, scroll)))
    } else {
      const scroll = (window.innerHeight - rect.top) / (rect.height + window.innerHeight)
      this.style.setProperty('--scroll', Math.max(0, Math.min(1, scroll)))
    }
  }

  #intersectionCallback = (entries) => {
    if (entries[0].isIntersecting) {
      this.#onScroll()
      window.addEventListener('scroll', this.#onScroll)
    } else {
      window.removeEventListener('scroll', this.#onScroll)
    }
  }
}

customElements.define(
  'scroll-variable',
  ScrollVariable,
)
