// A regular expression to validate the threshold values, which should be
// between 0 and 1
const thresholdRegex = /^(0(\.\d+)?|1(\.0*)?|\.\d+)$/

// A helper function to print the error message for invalid threshold values
const printThresholdError = (value) => console.error(
  `<hotfx-intersection-observer> threshold must be a number between 0 and 1, received "${value}".`
)

// Define the HotFXIntersectionObserver custom element. Extending HTMLElement
// is the way to create a new element that can be used in HTML.
class HotFXIntersectionObserver extends HTMLElement {
  // The private fields to hold the ElementInternals, which lets us set custom
  // states to be used in CSS like `:state(is-intersecting)`
  #internals
  // A private field to hold the IntersectionObserver, which will trigger
  // a callback when the element intersects with the viewport, err, browser
  // window.
  #observer
  // The default threshold value for the IntersectionObserver. The value 0 means
  // that the callback will be triggered as soon as even one pixel of the
  // element is visible in the viewport.
  #threshold = 0

  // The constructor method is called when the element is created. Here we
  // attach the ElementInternals to the element.
  constructor() {
    super()
    this.#internals = this.attachInternals()
  }

  // The observedAttributes static property tells the browser which attributes
  // we want to monitor for changes. In this case, we want to monitor the
  // 'threshold' attribute to update the IntersectionObserver accordingly.
  static observedAttributes = ['threshold']

  // The connectedCallback method is called when the element is added to the
  // DOM.
  connectedCallback() {
    // First, create the IntersectionObserver by calling the internal private
    // method.
    this.#createObserver()
    // Check if the threshold attribute is set and valid.
    if (this.hasAttribute('threshold')) {
      if (!thresholdRegex.test(this.getAttribute('threshold'))) {
        printThresholdError()
      } else {
        this.#threshold = parseFloat(this.getAttribute('threshold'))
      }
    }
  }

  // Disconnect the IntersectionObserver when the element is removed from the
  // DOM to prevent memory leaks.
  disconnectedCallback() {
    this.#observer?.disconnect()
  }


  // The attributeChangedCallback method is called whenever one of the
  // observed attributes changes. Here we check if the 'threshold' attribute
  // has changed and update the IntersectionObserver accordingly.
  attributeChangedCallback(name, oldValue, newValue) {
    // First validate the attribute using the regular expression defined above.
    if (!thresholdRegex.test(newValue)) {
      printThresholdError(newValue)
    } else {
      this.#threshold = parseFloat(newValue)
      this.#createObserver()
    }
  }

  // A private method to create or recreate the IntersectionObserver with the
  // current threshold value.
  #createObserver() {
    this.#observer?.disconnect()
    this.#observer = new IntersectionObserver(
      // This callback function will run whenever the intersection status
      // of the element changes.
      (entries) => {
        // Since we're only observeing one element, we can just check the first
        // entry in the entries array.
        if (entries[0].isIntersecting) {
          // If the element is intersecting, we add the 'is-intersecting' state.
          // We also add the 'has-intersected' state, which will remain even
          // after the element is no longer intersecting.
          this.#internals.states.add('is-intersecting')
          this.#internals.states.add('has-intersected')
        } else {
          // If the element is not intersecting, we remove the 'is-intersecting'
          // state.
          this.#internals.states.delete('is-intersecting')
        }
      },
      { threshold: this.threshold },
    )
    // Start observing the custom element.
    this.#observer.observe(this)
  }

  // Getter and setter for the threshold property to allow programmatic access.
  get threshold() {
    return this.#threshold
  }

  set threshold(value) {
    // Validate the value before setting it.
    if (typeof value == 'number' && value >= 0 && value <= 1) {
      this.#threshold = value
      this.#createObserver()
    } else {
      printThresholdError(value)
    }
  }
}


// Checks for a `?define` query parameter in the URL that was used to load this
// script. So, for instance, if you load the script with `<script type="module"
// src="https://cdn.jsdelivr.net/npm/@hot-page/hotfx-intersection-observer@0.0.0?define=false">`,
// this variable will contain the text `false`.
const define = new URL(import.meta.url).searchParams.get("define")
// By default we register the above class as a custom element so that we can
// use it in HTML with the `<hotfx-intersection-observer>` tag. That is, unless
// called with the query parameter to prevent this.
if (define != 'false') {
  customElements.define(
    'hotfx-intersection-observer',
    HotFXIntersectionObserver,
  )
}
