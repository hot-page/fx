// The <hotfx-counter> is a custom HTML element so we must extend the
// `HTMLElement` class.
export class HotFXCounter extends HTMLElement {
  // A flag to keep track of whether we've already animated this element. The
  // animation is triggered when the element is scrolled into the viewport -- but
  // only the first time.
  #hasAnimated = false
  // A flag to tell whether the element is currently in view or not.
  #isVisible = false
  // The value displayed as output
  #currentValue = 0
  // The end value that will be the end of the animation
  #targetValue
  // The MutationObserver lets the element respond to changes to the text
  // inside.
  #mutationObserver
  // The IntersectionObserver lets the element know when it has moved into the
  // viewport.
  #intersectionObserver
  // The identifier returned by requestAnimationFrame, which can be used to
  // cancel the animation if needed.
  #frameId = null

  constructor() {
    super()
    // The shadow DOM for this component is remarkably simple, just one <span>
    // tag with one style rule. But it will allow us to change the rendered 
    // value without touching the number in light DOM.
    this.attachShadow({ mode: 'open' })
    this.shadowRoot.innerHTML = `<span id="counter" style="font-variant-numeric: tabular-nums;">0</span>`
  }

  // This method is called when the element is added to the DOM. It's the perfect
  // place to set up our intersection observer and get the target value.
  connectedCallback() {
    // Parses the input number to #targetValue.
    this.#updateTarget()

    // Set up an IntersectionObserver to watch when this element comes into
    // the viewport.
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        this.#isVisible = entries[0].isIntersecting
        // If the element is indeed in the viewport and the animation still
        // hasn't run, run it now.
        if (this.#isVisible && !this.#hasAnimated) this.animate()
      },
      // This will trigger when 50% of the element has moved into the viewport.
      { threshold: 0.5 }
    )
    // Observer the <hotfx-counter> element itself.
    intersectionObserver.observe(this)

    // The MutationObserver will parse the input number again when it changes.
    // This lets page authors change the value if it needs to be updated after
    // the page loads.
    const mutationObserver = new MutationObserver(() => this.#updateTarget())
    mutationObserver.observe(this, { childList: true })
  }

  disconnectedCallback() {
    // Clean up observers or memory will leak everywhere and it will be very
    // messy
    this.#intersectionObserver?.disconnect()
    this.#intersectionObserver = null
    this.#mutationObserver?.disconnect()
    this.#mutationObserver = null
  }

  // Reflect the `duration=` attribute in the HTML to the `.duration` property
  // on this element.
  get duration() {
    // Default 1 second (1000 milliseconds) duration.
    let duration = 1000
    if (this.hasAttribute('duration')) {
      const durationAttr = parseInt(this.getAttribute('duration'))
      // Do some error checking before we use the value because the page author
      // could put anything there.
      if (isNaN(durationAttr)) {
        console.error(`<hotfx-counter> couldn't parse the duration "${this.getAttribute('duration')}"`)
      } else {
        duration = durationAttr
      }
    }
    return duration
  }

  // Reflect the `.duration` property on this element back to the HTML
  // `duration=` attribute.
  set duration(value) {
    this.setAttribute('duration', value);
  }

  // Public method to manually trigger the animation. This allows developers
  // to restart the animation imperatively if they so choose.
  run() {
    this.#currentValue = 0
    this.#hasAnimated = false
    this.animate()
  }

  // This parses the text inside the <hotfx-counter> element to a number that
  // we can use to transition towards.
  #updateTarget() {
    // Get the target value from the text inside this element and parse it as
    // an integer.
    const targetValue = parseFloat(this.textContent)

    // Validate the target number, aborting with an error message if it can't
    // be parsed
    if (isNaN(targetValue)) {
      console.error(`<hotfx-counter> couldn't process the text "${this.textContent}" as a number`)
      // This is an escape hatch that will just show the light DOM text inside
      // the shadow DOM if there's an error parsing it.
      this.shadowRoot.children[0].textContent = this.textContent
    } else {
      this.#targetValue = targetValue
      // If this is a new value, we want to reset the `#hasAnimated` flag so
      // that this will animate to the new value.
      this.#hasAnimated = false
      // Run the animation now if the element is currently visible.
      if (this.#isVisible) this.animate()
    }
  }

  // This is where the magic happens. Browsers typically run at 60 frames per
  // second, although sometimes faster or slower depending on your hardware.
  // The big idea here is to update the number we are animating to a new value
  // before each frame is rendered by calling `requestAnimationFrame()`. The
  // first call schedules the next call and so on until the animation is
  // complete.
  animate() {
    // Cancel any existing animation
    if (this.#frameId) cancelAnimationFrame(this.#frameId)

    // If the target value has a decimal part, we record how many decimal places
    // are visible.
    const decimals = this.textContent.includes('.')
      ? this.textContent.split('.')[1].trim().length
      : 0

    // We need to keep track of when the animation started so we can calculate
    // how far we have progressed and thus the correct value to display.
    let startTime

    // Keep track of the currentValue at the moment when the animation starts.
    // This will be zero on the first page load but if the value gets updated
    // manually it could be the previous value.
    const startValue = this.#currentValue

    // The element in our shadow DOM that will be used to display the output.
    const element = this.shadowRoot.children[0]

    // This function will be called on every frame while the animation is
    // running.
    const tick = (timestamp) => {
      // Initialize startTime on the first frame
      startTime = startTime || timestamp
      // The elapsed time is the time since the animation started. It's quite
      // important to use the time provided by the browser instead of counting
      // the frames because frames may be dropped and we want to always finish
      // within the given duration.
      const elapsedTime = timestamp - startTime
      // Calculate the progress of the animation as a percent (0 to 1)
      const progress = Math.min(elapsedTime / this.duration, 1)
      // This easing function makes the movement of the numbers feel more
      // natural. This cubic ease out function will start fast and then slow
      // down as it approaches the targetValue. This is the cubic ease-out
      // formula: 1 - (1 - t)³
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      // Calculate the value based on the eased progress
      this.#currentValue = startValue + (this.#targetValue - startValue) * easedProgress

      // Update the displayed number in the shadow DOM, formatting it to the
      // reader's locale and the correct number of decimal places.
      element.textContent = this.#currentValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      })

      // If the animation has not yet finished, continue by scheduling the
      // `tick()` function for the next frame.
      if (progress < 1) {
        this.#frameId = requestAnimationFrame(tick)
      // If the animation is finished, clean up.
      } else {
        this.#hasAnimated = true
        this.#frameId = null
        this.#currentValue = this.#targetValue
      }
    }

    // This is the line that starts the animation by scheduling the first
    // callback. `requestAnimationFrame()` is a much better choice than
    // `setInterval()` or `setTimeout()` because the browser knows to call it
    // at the right time during its rendering cycle. At 60fps, the browser only
    // has 16ms to render every frame and changing the DOM as we are doing at
    // the wrong time could really mess things up.
    this.#frameId = requestAnimationFrame(tick)
  }
}

// Checks for a `?define` query parameter in the URL that was used to load this
// script. So, for instance, if you load the script with `<script type="module" src="https://cdn.jsdelivr.net/npm/@hot-page/hotfx-counter@0.0.0?define=false">`,
// this variable will contain the text `false`.
const define = new URL(import.meta.url).searchParams.get("define")
// By default we register the above class as a custom element so that we can use
// it in HTML with the `<hotfx-form>` tag. That is, unless called with the query
// parameter to prevent this.
if (define != 'false') customElements.define('hotfx-form', HotFXForm)
