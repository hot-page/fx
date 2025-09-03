const floatRegex = /^-?\d*\.?\d+$/

class HotFXPseudorandom extends HTMLElement {
  #callbackID
  #seed = [1.04829898]

  static observedAttributes = ['seed']

  connectedCallback() {
    this.#callbackID = requestAnimationFrame(this.#tick)
  }

  disconnectedCallback() {
    cancelAnimationFrame(this.#callbackID)
  }

  attributeChangedCallback(name) {
    if (name == 'seed') this.#parseSeed()
  }

  #parseSeed() {
    if (!this.hasAttribute('seed')) return
    const seed = this.getAttribute('seed').trim().split(/\s+/).reduce((seed, value) => {
      if (floatRegex.test(value)) seed.push(value)
      else {
        console.error(
          `<hotfx-pseudorandom> could not parse seed value "${value}" from attribute "seed"`,
        )
      }
      return seed
    }, [])
    if (!seed.length) return
    this.#seed = seed
  }

  get seed() {
    return this.#seed
  }

  set seed(value) {
    if (typeof value === 'number') return this.setAttribute('seed', value)
    if (!Array.isArray(value) || !value.every(v => typeof v === 'number')) {
      console.error(`<hotfx-pseudorandom> seed must be a number or an array of numbers`)
      return
    }
    this.setAttribute('seed', value.join(' '))
  }

  #tick = (time) => {
    const rand = (seed) =>
      (Math.sin(time * .001 * seed) * Math.sin(time * .002 * seed) % 1 + 1) / 2

    if (this.#seed.length === 1) {
      this.style.setProperty(`--hotfx-pseudorandom`, rand(this.#seed[0]))
    } else {
      this.#seed.forEach((seed, index) => {
        this.style.setProperty(`--hotfx-pseudorandom-${index + 1}`, rand(seed))
      })
    }
    this.#callbackID = requestAnimationFrame(this.#tick)
  }
}

customElements.define('hotfx-pseudorandom', HotFXPseudorandom)
