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
      if (floatRegex.test(value)) seed.push(parseFloat(value))
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
      console.error('<hotfx-pseudorandom> seed must be a number or an array of numbers')
      return
    }
    this.setAttribute('seed', value.join(' '))
  }

  #tick = (time) => {
    if (this.#seed.length === 1) {
      this.style.setProperty('--hotfx-pseudorandom', modifiedValueNoise(time, this.#seed[0]))
    } else {
      this.#seed.forEach((seed, index) => {
        this.style.setProperty(`--hotfx-pseudorandom-${index + 1}`, modifiedValueNoise(time, seed))
      })
    }
    this.#callbackID = requestAnimationFrame(this.#tick)
  }
}

customElements.define('hotfx-pseudorandom', HotFXPseudorandom)

function hash(n, seed) {
  n = Math.sin((n + seed * 100) * 12.9898 + seed * 45.164) * 43758.5453123
  return n - Math.floor(n)
}

function modifiedValueNoise(time, seed) {
  time = (time / 1000) * (seed / 10)
  const floorValue = Math.floor(time);
  const fraction = time - floorValue;

  const randomAtFloor = hash(floorValue, seed)
  const randomAtCeiling = hash(floorValue + 1, seed)

  // Smootherstep interpolation
  // const smoothFraction = fraction * fraction * fraction * (fraction * (fraction * 6 - 15) + 10)
  const smoothFraction = fraction * fraction * (3 - 2 * fraction);

  // Linear interpolation
  return randomAtFloor * (1 - smoothFraction) + randomAtCeiling * smoothFraction
}


// // two octave
// function modifiedValueNoise(time, seed) {
//   const slow = singleOctave(time, seed, 1.0)
//   const fast = singleOctave(time, seed * 1.234, 2.0)
//   const faster = singleOctave(time, seed * 2.34, 4.0)
//   return slow * 0.5 + fast * 0.3 + faster * 0.2
// }
//
// function singleOctave(time, seed, frequency) {
//   time = (time / 1000) * (seed / 10) * frequency
//   const floorValue = Math.floor(time)
//   const fraction = time - floorValue
//   const randomAtFloor = hash(floorValue, seed)
//   const randomAtCeiling = hash(floorValue + 1, seed)
//
//   const smoothFraction = fraction * fraction * fraction * (fraction * (fraction * 6 - 15) + 10)
//
//   return randomAtFloor * (1 - smoothFraction) + randomAtCeiling * smoothFraction
// }
