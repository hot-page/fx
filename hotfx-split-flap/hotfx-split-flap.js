// Create a custom element by extending `HTMLElement`.
export class HotFXSplitFlap extends HTMLElement {
  // The internal state of the component is handled in private instance 
  // variables, which in JavaScript become private when they start with `#`.
  //
  // `hasAnimated` is a flag that keeps track of whether the animation has
  // already completed.
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
    ['width', 'height', 'duration'].forEach(name => {
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
          .map(char => char.getAnimations({ subtree: true }))
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
  // causing it to lose all of it's life force.
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
    if (['width', 'height', 'duration'].includes(name)) {
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

  // Getter for `.height` property similar to above for `width`, but returning
  // the number of lines in the text content instead of the longest line.
  get height() {
    if (this.#currentGrid) return this.#currentGrid.length
    if (this.hasAttribute('height')) {
      const height = parseInt(this.getAttribute('height'))
      if (Number.isInteger(height) && height > 0) return height
    }
    return this.textContent.split('\n').length
  }

  // Setter for `.height` property, same as above for `width`.
  set height(value) {
    if (!Number.isInteger(value) || value <= 0) this.#printNumberError('height')
    this.setAttribute('height', value)
    this.#render()
    if (this.#isVisible) this.#animate()
  }

  // Get the duration of the animation which is how long it takes for one flap
  // to fall down from top to bottom.
  get duration() {
    // The duration defaults to 150 milliseconds or 0.15 seconds for each flap
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

  // Setter for duration that reflects to the attribute with valdiation logic.
  set duration(value) {
    if (typeof value !== 'number' || value <= 0) return this.#printNumberError('duration')
    this.setAttribute('duration', value)
  }

  // Getter for `.characters` property. This is the alphabet used for the flaps.
  // Here we're just pulling from the attribute which has the current value or
  // using the default Latin alphabet.
  get characters() {
    return this.getAttribute('characters') || ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!.,:?"\'/$'
  }

  // Setter for `.characters` property that reflects to the attribute.
  set characters(value) {
    this.setAttribute('characters', value)
  }

  // Helper function that turns the text of this element into the grid of
  // letters that we're going to animate towards. The grid is stored as a
  // two-dimensional array of characters.
  #updateTargetGrid() {
    // Split the text on newline to get an array of lines.
    const lines = this.textContent.split('\n')
    // Note that we're using the `.width` and `.height` properties because the
    // dimensions of the grid could have been set explicitly using attributes.
    this.#targetGrid = Array.from({ length: this.height }).map((_, row) => {
        const line = lines[row] || ''
        return Array.from({ length: this.width }).map(
          (_, col) => line[col]?.toUpperCase() || ' ',
        )
      })
  }

  // Render the grid of letters into the shadow DOM.
  #render() {
    // First set `#currentGrid` to null because it will be used to calculate the 
    // width and height of the next grid and we need to start fresh.
    this.#currentGrid = null
    // The `#currentGrid` is the current state of the letters displayed. Since
    // we're starting over fresh here, we just make it all space characters.
    this.#currentGrid = Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => ' ')
    )
    this.#updateTargetGrid()

    this.shadowRoot.innerHTML = [`
      <style>
        :host {
          display: inline-block;
          font-family: Arial, sans-serif;
        }

        #container {
          display: grid;
          grid-template-columns: repeat(${this.width}, auto);
          grid-template-rows: repeat(${this.height}, auto);
          gap: var(--hotfx-split-flap-grid-gap, .1em);
          perspective: 1000px;
        }`,
        // Each character has height and width set explicitly which is not ideal
        // but that way we have a grid of same-sized objects. If a given font
        // has very wide characters, this can be overwritten using the
        // `::part(char)` pseudo-element.
        `.char {
          position: relative;
          width: 1em;
          height: 1.2em;
          transform-style: preserve-3d;
        }`,
        // These are the flaps that rotate to reveal each character. They are
        // four elements positioned on top of each other, two for the current
        // character and two for the next character -- each split into top
        // and bottom halves.
        `.top, .bottom, .top-next, .bottom-next {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          color: white;
          background: black;`,
          // backface-visibility is important to hide the back of the flap when
          // it is rotated more than 90 degrees.
          `backface-visibility: hidden;
        }`,
        // The top flaps have their bottoms cut off and the bottom flaps have
        // their tops cut off.
        `.top, .top-next {
          clip-path: polygon(0 0, 100% 0, 100% 50%, 0 50%);
        }

        .bottom, .bottom-next {
          clip-path: polygon(0 50%, 100% 50%, 100% 100%, 0 100%);
        }`,
        // The divider is the line in the middle of the flap.
        `.divider {
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
      </style>
      <div id="container">`,
        // Create the grid of characters by mapping over the `#currentGrid`
        // (in both dimensions)
        this.#currentGrid.map((row, rowNumber) => {
          // Row and column numbers used in `::part()` start at 1 as per CSS
          // convention, e.g. `nth-child(1)`
          rowNumber += 1
          return row.map((char, columnNumber) => {
            columnNumber += 1
            const currentChar = char === ' ' ? '&nbsp;' : char
            // Each character and its flaps have several part= attribute values
            // so they can be addressed in CSS, for example
            // - `::part(char-1)` for all the characters in the first column
            // - `::part(flap-3-4)` for the flaps in the third row and
            //   fourth column
            return `
              <span
                class=char
                part="char char-${columnNumber} char-${rowNumber}-${columnNumber}">
                <span
                  class=top-next
                  part="flap flap-${columnNumber} flap-${rowNumber}-${columnNumber}"
                  aria-hidden=true>
                  ${currentChar}
                  <span
                    class=divider
                    part="divider flap-${columnNumber} divider-${rowNumber}-${columnNumber}">
                  </span>
                </span>
                <span
                  class=bottom-next
                  part="flap flap-${columnNumber} flap-${rowNumber}-${columnNumber}"
                  aria-hidden=true>
                  ${currentChar}
                  <span
                    class=divider
                    part="divider flap-${columnNumber} divider-${rowNumber}-${columnNumber}">
                  </span>
                </span>
                <span
                  class=top
                  part="flap flap-${columnNumber} flap-${rowNumber}-${columnNumber}">
                  ${currentChar}
                  <span 
                    class=divider
                    part="divider flap-${columnNumber} divider-${rowNumber}-${columnNumber}">
                  </span>
                </span>
                <span
                  class=bottom
                  part="flap flap-${columnNumber} flap-${rowNumber}-${columnNumber}"
                  aria-hidden=true>
                  ${currentChar}
                  <span
                    class=divider
                    part="divider flap-${columnNumber} divider-${rowNumber}-${columnNumber}">
                  </span>
                </span>
              </span>
            `
          }).join('')
        }).join(''),
      `</div>`
    ].join('')
  }

  // To animate, the element must rotate each flap, then swap out the characters
  // in the DOM and then repeat through the whole alphabet until it arrives at
  // the correct end character.
  #animate() {
    // If the animation has already run, don't run it again.
    this.#hasAnimated = true

    // Create a copy of the target grid so that we can check if it since been
    // updated and the animation should be aborted (since another one will
    // be triggered).
    const targetGrid = this.#targetGrid

    // Animate each character.
    this.shadowRoot.querySelectorAll('.char').forEach((char, index) => {
      // Find the index of this charcter in the grid.
      const row = Math.floor(index / this.width)
      const col = index % this.width

      // The index of the target character in our alphabet.
      const targetCharIndex = this.characters.includes(targetGrid[row][col])
        ? this.characters.indexOf(targetGrid[row][col])
        : 0

      // The current character index in the alphabet.
      let currentCharIndex = this.characters.indexOf(this.#currentGrid[row][col])

      // If the indexes are the same, it's already finished and this character
      // should not be animated at all
      if (currentCharIndex == targetCharIndex) return

      // This function will run one flap and wait for it to finsih before
      // calling itself again to animate the next flap.
      const flap = async () => {
        // If the target grid has changed since we started animating, abort
        // this animation since another one will be triggered.
        if (targetGrid != this.#targetGrid) return

        // Find the index of the character following the current one, wrapping
        // around to the start if needed.
        const nextCharIndex = currentCharIndex < this.characters.length - 1
          ? currentCharIndex + 1
          : 0

        // The next character to animate towards
        const nextChar = this.characters[nextCharIndex]

        // Set the text content of the top and bottom flaps to the next character
        char.querySelector('.top-next').childNodes[0].textContent = nextChar
        char.querySelector('.bottom-next').childNodes[0].textContent = nextChar

        // Animate the top flap and the bottom of the next flap to fall from the
        // top. Using `await Promise.all()` to wait for both animations to
        // finish.
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

        // Swap out the top and bottom flaps and set the `currentCharIndex` value 
        // so that the next character is now the currect character.
        char.querySelector('.top').childNodes[0].textContent = nextChar
        char.querySelector('.bottom').childNodes[0].textContent = nextChar
        currentCharIndex = nextCharIndex
        // Update the #currentGrid with the new character.
        this.#currentGrid[row][col] = this.characters[currentCharIndex]
        // If the new currrent character is still not the target character,
        // continue animating by calling this `flap()` function again.
        if (currentCharIndex !== targetCharIndex) flap()
      }

      // Trigger the first animation for this character.
      flap()
    })
  }

  // Helper function to print errors for invalid attributes.
  #printNumberError(name) {
    console.error(`<hotfx-split-flap> ${name} attribute must be a positive integer; got  "${this.getAttribute(name)}"`)
  }

}

// Checks for a `?define` query parameter in the URL that was used to load this
// script. So, for instance, if you load the script with `<script type="module" src="https://cdn.jsdelivr.net/npm/@hot-page/hotfx-counter@0.0.0?define=false">`,
// this variable will contain the text "false".
const define = new URL(import.meta.url).searchParams.get("define")
// By default we register the above class as a custom element so that we can
// use it in HTML with the `<hotfx-counter>` tag. That is, unless called with
// the query parameter to prevent this.
if (define != 'false') customElements.define('hotfx-split-flap', HotFXSplitFlap)
