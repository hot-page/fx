// A regex to validate that a string is a valid floating point number, used
// when parsing the `seed` attribute.
const floatRegex = /^-?\d*\.?\d+$/

// Extend `HTMLElement`, which is the base class for all custom elements and
// wires us up to all of the attributes, styles, and lifecycle callbacks.
class HotFXPseudorandom extends HTMLElement {
  // Stores the ID returned by `requestAnimationFrame` so we can cancel the
  // animation loop when the element is removed from the page.
  #callbackID

  // The seed (or seeds) that drive the random number generator. Different seeds
  // produce different sequences of values, so multiple elements with different
  // seeds will animate independently. We default to a single seed so the
  // element works out of the box without any configuration.
  #seed = [1.04829898]

  // Tell the browser to fire callbacks when the `seed` attribute changes.
  static observedAttributes = ['seed']

  // Kick off the animation loop when the element is added to the page.
  connectedCallback() {
    this.#callbackID = requestAnimationFrame(this.#tick)
  }

  // Cancel the animation when the element is removed from the page. Without
  // this, the loop would keep running in the background even when it's doing
  // nothing.
  disconnectedCallback() {
    cancelAnimationFrame(this.#callbackID)
  }

  // Respond to changes in the `seed` attribute.
  attributeChangedCallback(name) {
    if (name == 'seed') this.#parseSeed()
  }

  // Parse the `seed` attribute, which accepts one or more space-separated
  // floating point numbers. Invalid values are skipped with a console error.
  #parseSeed() {
    if (!this.hasAttribute('seed')) return
    const seed = this.getAttribute('seed')
      .trim()
      .split(/\s+/)
      .reduce((seed, value) => {
        if (floatRegex.test(value)) seed.push(parseFloat(value))
        else {
          console.error(
            `<hotfx-pseudorandom> could not parse seed value "${value}" from attribute "seed"`,
          )
        }
        return seed
      }, [])
    // Only update the seed if we successfully parsed at least one valid value.
    if (!seed.length) return
    this.#seed = seed
  }

  // The `seed` getter lets JavaScript read the current seed value directly
  // from the element, e.g. `el.seed`. It returns a copy of the array rather
  // than the raw attribute string so callers always get a usable value.
  get seed() {
    return [...this.#seed]
  }

  // The `seed` setter lets us change the value directly on the element in
  // JavaScript, e.g. `el.seed = 2.5` or `el.seed = [1.2, 3.4]`. Rather than
  // updating the internal state directly, it writes to the HTML attribute so
  // there's a single source of truth — `attributeChangedCallback` will then
  // call `#parseSeed` to sync the internal state.
  set seed(value) {
    if (typeof value === 'number') return this.setAttribute('seed', value)
    if (!Array.isArray(value) || !value.every((v) => typeof v === 'number')) {
      console.error(
        '<hotfx-pseudorandom> seed must be a number or an array of numbers',
      )
      return
    }
    this.setAttribute('seed', value.join(' '))
  }

  // This is the animation loop. `requestAnimationFrame` calls this function
  // before every frame, passing in the current time in milliseconds. In the
  // loop we just update our CSS custom properties based on the new CSS
  #tick = (time) => {
    // With a single seed we write to `--hotfx-pseudorandom` for simplicity.
    if (this.#seed.length === 1) {
      this.style.setProperty(
        '--hotfx-pseudorandom',
        valueNoise(time, this.#seed[0]),
      )
      // With multiple seeds we write numbered properties like
      // `--hotfx-pseudorandom-1`, `--hotfx-pseudorandom-2`, etc. so the user
      // can reference each one independently in CSS.
    } else {
      this.#seed.forEach((seed, index) => {
        this.style.setProperty(
          `--hotfx-pseudorandom-${index + 1}`,
          valueNoise(time, seed),
        )
      })
    }

    // Schedule the next frame so that the animation continues.
    this.#callbackID = requestAnimationFrame(this.#tick)
  }
}

customElements.define('hotfx-pseudorandom', HotFXPseudorandom)

// A deterministic hash function based on a sine-based trick commonly used in
// GLSL shader code. Given the same inputs it always returns the same value in
// the range [0, 1), which makes it useful as a repeatable source of
// "randomness" that we can drive with time.
function hash(n, seed) {
  n = Math.sin((n + seed * 100) * 12.9898 + seed * 45.164) * 43758.5453123
  // Subtracting the floor strips the integer part, leaving only the fractional
  // part of the number, which is always between 0 and 1.
  return n - Math.floor(n)
}

// Produces a smooth, continuous random value by interpolating between two hashed
// values on either side of the current time position. The `seed` controls the
// speed and character of the animation — different seeds produce visually
// distinct but equally smooth sequences.
function valueNoise(time, seed) {
  // Scale `time` (in milliseconds) by the seed so different seeds animate at
  // different rates.
  time = (time / 1000) * (seed / 10)

  // Split `time` into its whole number and fractional parts. The whole number
  // tells us which pair of hash values to interpolate between, and the
  // fraction tells us how far between them we currently are.
  const floorValue = Math.floor(time)
  const fraction = time - floorValue

  // Get the hashed random values at the two surrounding integer positions.
  const randomAtFloor = hash(floorValue, seed)
  const randomAtCeiling = hash(floorValue + 1, seed)

  // Smoothstep maps the fraction from a straight line to an S-curve, which
  // means the interpolated value eases in and out instead of changing at a
  // constant rate. This avoids the abrupt direction changes you'd get from
  // plain linear interpolation.
  const smoothFraction = fraction * fraction * (3 - 2 * fraction)

  // Finally, linearly interpolate between the two hashed values using the
  // smoothed fraction as the blend weight.
  return randomAtFloor * (1 - smoothFraction) + randomAtCeiling * smoothFraction
}
