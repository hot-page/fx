const thresholdRegex = /^(0(\.\d+)?|1(\.0*)?|\.?\d+)$/.test

const printThresholdError = (value) => console.error(
  `<hotfx-intersection-observer> threshold must be a number between 0 and 1, received "${value}".`
)

// Adds :state(intersecting) when the element is fully visible in the viewport
class HotFXIntersectionObserver extends HTMLElement {
  #internals
  #observer
  #threshold = 0.0

  constructor() {
    super()
    this.#internals = this.attachInternals()
  }

  static get observedAttributes() {
    return ['threshold']
  }

  connectedCallback() {
    this.#createObserver()
    if (this.hasAttribute('threshold')) {
      if (!thresholdRegex.test(this.getAttribute('threshold'))) {
        printThresholdError()
      } else {
        this.#threshold = parseFloat(this.getAttribute('threshold'))
      }
    }
  }

  disconnectedCallback() {
    this.#observer?.disconnect()
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (!thresholdRegex.test(newValue)) {
      printThresholdError(newValue)
    } else {
      this.#threshold = parseFloat(newValue)
      this.#createObserver()
    }
  }

  #createObserver() {
    this.#observer?.disconnect()
    this.#observer = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return
        this.#internals.states.add('intersecting')
      },
      { threshold: this.threshold },
    )
    this.#observer.observe(this)
  }

  get threshold() {
    return this.#threshold
  }

  set threshold(value) {
    if (typeof value == 'number' && value >= 0 && value <= 1) {
      this.#threshold = value
      this.#createObserver()
    } else {
      printThresholdError(value)
    }
  }
}

customElements.define('hotfx-intersection-observer', HotFXIntersectionObserver)
