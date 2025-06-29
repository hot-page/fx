export class HotFXSplitFlap extends HTMLElement {
  #hasAnimated = false
  #isVisible = false
  #intersectionObserver
  #mutationObserver
  #currentGrid

  static get observedAttributes() {
    return ['width', 'height', 'speed']
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    ['width','height','speed'].forEach(name => {
      if (!this.hasAttribute(name)) return
      const value = parseInt(this.getAttribute(name))
      if (isNaN(value) || value <= 0) this.#printNumberError(name)
    })

    this.#render()

    this.#intersectionObserver = new IntersectionObserver(
      (entries) => {
        this.#isVisible = entries[0].isIntersecting
        if (this.#isVisible && !this.#hasAnimated) this.#animate()
      },
      { threshold: 0.5 }
    )
    this.#intersectionObserver.observe(this)

    this.#mutationObserver = new MutationObserver(() => {
      this.#hasAnimated = false
      if (this.#isVisible) this.#animate()
    })
    this.#mutationObserver.observe(
      this,
      { childList: true, characterData: true, subtree: true },
    )
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (['width','height','speed'].includes(name)) {
      const value = parseInt(this.getAttribute(name))
      if (isNaN(value) || value <= 0) return this.#printNumberError(name)
    }
    if (!['width', 'height'].includes(name) || oldValue == newValue) return
    this.#render()
    this.#hasAnimated = false
    if (this.#isVisible) this.#animate()
  }

  disconnectedCallback() {
    this.#intersectionObserver?.disconnect()
    this.#intersectionObserver = null
    this.#mutationObserver?.disconnect()
    this.#mutationObserver = null
  }

  get width() {
    if (this.#currentGrid) return this.#currentGrid[0].length
    if (this.hasAttribute('width')) {
      const width = parseInt(this.getAttribute('width'))
      if (!isNaN(width) && width > 0) return width
    }
    return Math.max(...this.textContent.split('\n').map(line => line.length))
  }

  set width(value) {
    if (typeof value !== 'number' || value <= 0) return this.#printNumberError('width')
    this.setAttribute('width', value)
    this.#render()
    this.#hasAnimated = false
    if (this.#isVisible) this.#animate()
  }

  get height() {
    if (this.#currentGrid) return this.#currentGrid.length
    if (this.hasAttribute('height')) {
      const height = parseInt(this.getAttribute('height'))
      if (!isNaN(height) && height > 0) return height
    }
    return this.textContent.split('\n').length
  }

  set height(value) {
    if (typeof value !== 'number' || value <= 0) return this.#printNumberError('height')
    this.setAttribute('height', value)
    this.#render()
    this.#hasAnimated = false
    if (this.#isVisible) this.#animate()
  }

  get speed() {
    let speed = 150
    if (this.hasAttribute('speed')) {
      const speedAttr = parseInt(this.getAttribute('speed'))
      if (!isNaN(speedAttr) && speedAttr > 0) speed = speedAttr
    }
    return speed
  }

  set speed(value) {
    if (typeof value !== 'number' || value <= 0) return this.#printNumberError('speed')
    this.setAttribute('speed', value)
  }

  get characters() {
    return this.getAttribute('characters') || ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!.,:?"\'/$'
  }

  set characters(value) {
    this.setAttribute('characters', value)
  }

  #render() {
    this.#currentGrid = Array.from({ length: this.height }, () =>
      Array.from({ length: this.width }, () => ' ')
    )

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline-block;
        }

        #container {
          display: grid;
          gap: 8px;
          perspective: 1000px;
          grid-template-columns: repeat(${this.width}, 1fr);
          grid-template-rows: repeat(${this.height}, 1fr);
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
          background: #999;
          z-index: 10;
          pointer-events: none;
          transform: translateY(-50%);
        }

        .top, .bottom, .top-next, .bottom-next {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: Arial, sans-serif;
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
        ${this.#currentGrid.map((row, rowIndex) =>
          row.map((char, colIndex) => {
            const currentChar = char === ' ' ? '&nbsp;' : char
            const index = rowIndex * this.width + colIndex
            return `
              <div class="char" data-index="${index}">
                <span class="top" part="character">${currentChar}</span>
                <span class="bottom" part="character">${currentChar}</span>
                <span class="top-next" part="character">${currentChar}</span>
                <span class="bottom-next" part="character">${currentChar}</span>
                <div class="divider" part="divider"></div>
              </div>
            `
          }).join('')
        ).join('')}
      </div>
    `
  }

  #animate() {
    if (this.#hasAnimated) return
    this.#hasAnimated = true

    const lines = this.textContent.split('\n')
    const targetGrid = Array.from({ length: this.height }, (_, row) => {
      const line = lines[row] || ''
      return Array.from({ length: this.width }, (_, col) => line[col]?.toUpperCase() || ' ')
    })

    this.shadowRoot.querySelectorAll('.char').forEach((char, index) => {
      const row = Math.floor(index / this.width)
      const col = index % this.width

      const targetCharIndex = this.characters.includes(targetGrid[row][col])
        ? this.characters.indexOf(targetGrid[row][col])
        : 0

      let currentCharIndex = this.characters.indexOf(this.#currentGrid[row][col])

      if (currentCharIndex == targetCharIndex) return

      const flap = async () => {
        const nextCharIndex = currentCharIndex < this.characters.length - 1
          ? currentCharIndex + 1
          : 0

        const nextChar = this.characters[nextCharIndex] == ' '
          ? '&nbsp;'
          : this.characters[nextCharIndex]

        char.querySelector('.top-next').innerHTML = nextChar
        char.querySelector('.bottom-next').innerHTML = nextChar

        const options = { duration: this.speed, easing: 'ease-in-out' }
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
