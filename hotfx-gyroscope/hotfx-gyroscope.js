
class HotFXGyroscope extends HTMLElement {
  #initialValue
  // The `ElementInternals` object will let us add custom states to this element
  // that can be read in CSS with the `:state()` pseudo class.
  #internals

  constructor() {
    super()
    window.addEventListener('deviceorientation', this.#onDeviceOrientation)
    this.#internals = this.attachInternals()
  }

  #onDeviceOrientation = (event) => {
    const { alpha, beta, gamma } = event
    if (alpha === null || beta === null || gamma === null) {
      return 
    } else if (!this.#initialValue) {
      this.#initialValue = { alpha, beta, gamma }
      this.#internals.states.add('working')
    }
    this.style.setProperty('--alpha', Math.round(event.alpha - this.#initialValue.alpha))
    this.style.setProperty('--beta', Math.round(event.beta - this.#initialValue.beta))
    this.style.setProperty('--gamma', Math.round(event.gamma - this.#initialValue.gamma))
  }
}

// Checks for a `?define` query parameter in the URL that was used to load this
// script. So, for instance, if you load the script with `<script type="module" src="https://cdn.jsdelivr.net/npm/@hot-page/hotfx-gyroscope@0.0.0?define=false">`,
// this variable will contain the text `false`.
const define = new URL(import.meta.url).searchParams.get("define")
// By default we register the above class as a custom element so that we can use
// it in HTML with the `<hotfx-gyroscope>` tag. That is, unless called with the query
// parameter to prevent this.
if (define != 'false') customElements.define('hotfx-gyroscope', HotFXGyroscope)
