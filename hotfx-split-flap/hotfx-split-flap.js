// Create a custom element by extending `HTMLElement`.
export class HotFXSplitFlap extends HTMLElement {
  // The internal state of the component is handled in private instance 
  // variables, which in JavaScript become private when they start with `#`.
  //
  // `hasAnimated` is a flag for 
  #hasAnimated = false
  // `isVisible` is a flag that keeps track of whether the element is currently
  // visible in the viewport.
  #isVisible = false
  // The `IntersectionObserver` fires a callback that lets us know if the element
  // is visible in the window or not.
  #intersectionObserver
  // The `MutationObserver` tells the element when it's content changes, so we
  // can re-render the grid and animate it again.
  #mutationObserver
  // The `#currentGrid` is the current state of the text. The characters are 
  // stored as a two-dimensional array: each row is an array of characters and
  // the grid is an array of rows.
  #currentGrid
  // The `#targetGrid` shows the ultimate destination of the 
  #targetGrid

  // Here we tell the browser to fire `attributeChangedCallback` when one of
  // the `width`, `height`, or `duration` attributes changes.
  static get observedAttributes() {
    return ['width', 'height', 'duration', 'characcters']
  }

  constructor() {
    // Always call your `super()` or the landlord will be mad.
    super()
    // Create a shadow DOM for this element that will hold all the elements and
    // stlyes needed to create the flaps.
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    // First do some validation on the attributes. Although all of them are
    // optional, they are required to be positive integers if set.
    ['width','height','duration'].forEach(name => {
      if (!this.hasAttribute(name)) return
      const value = parseInt(this.getAttribute(name))
      if (isNaN(value) || value <= 0) this.#printNumberError(name)
    })

    // If this element has already been mounted elsewhere the `#hasAnimated`
    // flag may be set even though we're coming in fresh here. Let's reset it.
    this.#hasAnimated = false
    // The `#render()` function will create the grid and the flaps inside the
    // shadow DOM.
    this.#render()

    // Setup our `IntersectionObserver`, which will fire a callback function
    // when this element scrolls into view.
    this.#intersectionObserver = new IntersectionObserver(
      (entries) => {
        // Since we are only observing one element, the callback should always
        // fire with one value in `entries`.
        this.#isVisible = entries[0].isIntersecting
        // The animation should only run the first time that we scoll onto it
        // so only trigger the animation it if #hasAnimated is false.
        if (this.#isVisible && !this.#hasAnimated) this.#animate()
      },
      // Fire the callback when 50% of this element has scrolled into view.
      { threshold: 0.5 }
    )
    // Observe this element
    this.#intersectionObserver.observe(this)

    // Setup the `MutationObserver` that will re-run the animation when the
    // text inside this element changes.
    this.#mutationObserver = new MutationObserver(async () => {
      // The `#targetGrid` is the string of text that the element will animate
      // towards.
      this.#updateTargetGrid()
      // First wait for the current animations to finish so there's no glitch
      // when the new animations start.
      await Promise.all(
        Array.from(this.shadowRoot.querySelectorAll('.char'))
          .map(char => char.getAnimations())
          .flat()
          .map(animation => animation.finish())
      )
      // If the element is currently in view, start the animation.
      if (this.#isVisible) this.#animate()
    })
    // Observe this element, along with the entire tree under it.
    this.#mutationObserver.observe(
      this,
      { childList: true, characterData: true, subtree: true },
    )
  }

  // Clean up the observers so that memory doesn't leak out of the browser,
  // causing it to lose all of it's will to continue living and rendering pages.
  disconnectedCallback() {
    this.#intersectionObserver?.disconnect()
    this.#intersectionObserver = undefined
    this.#mutationObserver?.disconnect()
    this.#mutationObserver = undefined
  }

  // The browser will call this when one of the `observedAttributes` changes.
  attributeChangedCallback(name, oldValue, newValue) {
    // Do some validation of the new value to warn the page author if they've
    // added an invalid value.
    if (['width','height','duration'].includes(name)) {
      const value = parseInt(this.getAttribute(name))
      if (isNaN(value) || value <= 0) return this.#printNumberError(name)
    }
    // If the attribute that was changed is `duration` we don't neeed to do
    // anything because it will be picked up in the next animation.
    if (name == 'duration' || oldValue == newValue) return
    // If `width` or `height` change, we will need to re-render the structure
    // of the shadow DOM to account for the new size.
    this.#render()
    // Finally, restart the animation if this element is currently in the
    // viewport. After rendering, the tiles are all on the first letter which is
    // the space character by default.
    if (this.#isVisible) this.#animate()
  }

  // Getter for `width` property called when reading `element.width`.
  get width() {
    // If there is a `#currentGrid`, report this size.
    if (this.#currentGrid) return this.#currentGrid[0].length
    // Otherwise, try to use the attribute if set.
    if (this.hasAttribute('width')) {
      const width = parseInt(this.getAttribute('width'))
      if (Number.isInteger(width) && width > 0) return width
    }
    // Finally, if there is no grid and no attribute, we default to the size of
    // the text inside this element, specifically the longest line.
    return Math.max(...this.textContent.split('\n').map(line => line.length))
  }

  // Reflect the `.width` property back to the `width=` attribute.
  set width(value) {
    // Validate the new value which should be a positive integer.
    if (!Number.isInteger(value) || value <= 0) this.#printNumberError('width')
    // Reflect the new value to the attribute and re-render the shadow DOM
    this.setAttribute('width', value)
    this.#render()
    // If the element is in the viewport, run the animation now.
    if (this.#isVisible) this.#animate()
  }

  // Getter for `height` property called when reading `element.height`.
  get height() {
    // If there is a `#currentGrid`, report this size.
    if (this.#currentGrid) return this.#currentGrid.length
    // Otherwise, try to use the attribute if set.
    if (this.hasAttribute('height')) {
      const height = parseInt(this.getAttribute('height'))
      if (Number.isInteger(height) && height > 0) return height
    }
    // Finally, if there is no grid and no attribute, we default to the size of
    // the text inside this element, specifically the number of lines.
    return this.textContent.split('\n').length
  }

  // Same as above, reflect the `.height` property back to the `height=` attribute.
  set height(value) {
    if (!Number.isInteger(value) || value <= 0) this.#printNumberError('height')
    this.setAttribute('height', value)
    this.#render()
    if (this.#isVisible) this.#animate()
  }

  // Get the duration of the animation which is how long it takes for one flap
  // to fall down from top to bottom.
  get duration() {
    // The duration defaults to 150 milliseconds or .15 seconds for each flap
    // to fall once.
    let duration = 150
    // Check if there's a `duration` attribute and use that value if it's a 
    // positive integer.
    if (this.hasAttribute('duration')) {
      const durationAttr = parseInt(this.getAttribute('duration'))
      if (Number.isInteger(durationAttr) && durationAttr > 0) duration = durationAttr
    }
    return duration
  }

  set duration(value) {
    if (typeof value !== 'number' || value <= 0) return this.#printNumberError('duration')
    this.setAttribute('duration', value)
  }

  get characters() {
    return this.getAttribute('characters') || ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!.,:?"\'/$'
  }

  set characters(value) {
    this.setAttribute('characters', value)
  }

  #updateTargetGrid() {
    const lines = this.textContent.split('\n')
    this.#targetGrid = Array.from({ length: this.height }, (_, row) => {
      const line = lines[row] || ''
      return Array.from({ length: this.width }, (_, col) => line[col]?.toUpperCase() || ' ')
    })
  }

  #render() {
    this.#currentGrid =  null
    this.#currentGrid = Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => ' ')
    )
    this.#updateTargetGrid()

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
          font-family: Arial, sans-serif;
        }

        #container {
          display: grid;
          gap: var(--hotfx-split-flap-grid-gap, .1em);
          perspective: 1000px;
          grid-template-columns: repeat(${this.width}, auto);
          grid-template-rows: repeat(${this.height}, auto);
        }

        .char {
          position: relative;
          width: 1em;
          height: 1.2em;
          transform-style: preserve-3d;
        }

        .divider {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background-color: currentColor;
          color: #999;
          z-index: 10;
          transform: translateY(-50%);
        }

        .top, .bottom, .top-next, .bottom-next {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          color: white;
          background: black;
          backface-visibility: hidden;
        }

        .top, .top-next {
          clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);
        }

        .bottom, .bottom-next {
          clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0 100%);
        }

        .top-next {
          z-index: -1;
        }

      </style>
      <div id="container">
        ${this.#currentGrid.map((row) =>
          row.map((char) => {
            const currentChar = char === ' ' ? '&nbsp;' : char
            return `
              <div class="char">
                <span class="top" part="flap">${currentChar}</span>
                <span class="bottom" part="flap">${currentChar}</span>
                <span class="top-next" part="flap">${currentChar}</span>
                <span class="bottom-next" part="flap">${currentChar}</span>
                <div class="divider" part="divider"></div>
              </div>
            `
          }).join('')
        ).join('')}
      </div>
    `
  }

  #animate() {
    this.#hasAnimated = true

    const targetGrid = this.#targetGrid

    this.shadowRoot.querySelectorAll('.char').forEach((char, index) => {
      const row = Math.floor(index / this.width)
      const col = index % this.width

      const targetCharIndex = this.characters.includes(targetGrid[row][col])
        ? this.characters.indexOf(targetGrid[row][col])
        : 0

      let currentCharIndex = this.characters.indexOf(this.#currentGrid[row][col])

      if (currentCharIndex == targetCharIndex) return

      const flap = async () => {
        if (targetGrid != this.#targetGrid) {
          console.log('target grid changed, aborting animation')
          return
        }

        const nextCharIndex = currentCharIndex < this.characters.length - 1
          ? currentCharIndex + 1
          : 0

        const nextChar = this.characters[nextCharIndex] == ' '
          ? '&nbsp;'
          : this.characters[nextCharIndex]

        char.querySelector('.top-next').innerHTML = nextChar
        char.querySelector('.bottom-next').innerHTML = nextChar

        const options = { duration: this.duration, easing: 'ease-in' }
        await Promise.all([
          char.querySelector('.top').animate([
            { transform: 'rotateX(0deg)' },
            { transform: 'rotateX(-180deg)' }
          ], options).finished,
          char.querySelector('.bottom-next').animate([
            { transform: 'rotateX(180deg)' },
            { transform: 'rotateX(0deg)' }
          ], options).finished
        ])

        char.querySelector('.top').innerHTML = nextChar
        char.querySelector('.bottom').innerHTML = nextChar
        currentCharIndex = nextCharIndex
        this.#currentGrid[row][col] = this.characters[currentCharIndex]
        if (currentCharIndex !== targetCharIndex) flap()
      }

      flap()
    })
  }

  #printNumberError(name) {
    console.error(`<hotfx-split-flap> ${name} attribute must be a positive integer; got  "${this.getAttribute(name)}"`)
  }

}

const define = new URL(import.meta.url).searchParams.get("define")
if (define != 'false') customElements.define('hotfx-split-flap', HotFXSplitFlap)
