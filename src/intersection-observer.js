
// The <interection-observer> mimcs the JavaScript API of IntersectionObserver.

// TODO:
//   - add attributes for root, rootMargin, threshold
//   - allow multiple targets

class IntersectionObserverElement extends HTMLElement {

  static get observedAttributes() { return ['target'] }

  constructor() {
    super()
    this._createIntersectionObserver()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this._createIntersectionObserver()
  }

  _createIntersectionObserver() {
    if (this._intersectionObserver) this._intersectionObserver.disconnect()
    this._intersectionObserver = new IntersectionObserver(this._intersectionCallback.bind(this))
    const target = this.hasAttribute('target') ?
      document.querySelector(this.getAttribute('target')) :
      this
    this._intersectionObserver.observe(target)
  }

  _intersectionCallback(entries) {
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
