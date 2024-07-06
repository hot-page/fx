import * as d3 from 'https://cdn.jsdelivr.net/npm/d3-interpolate@3.0.1/+esm'

const interpolatorOptions = [
  "interpolateCubehelix",
  "interpolateCubehelixLong",
  "interpolateHcl",
  "interpolateHclLong",
  "interpolateHsl",
  "interpolateHslLong",
  "interpolateHue",
  "interpolateLab",
  "interpolateRgb",
]

const defaultTemplate = document.createElement('template')
defaultTemplate.innerHTML = `
  <style>
    :host {
      position: relative;
    }

    :first-child {
      position: relative;
    }

    * {
      position: absolute;
      top: 0;
      margin: 0;
      color: var(--color);
      z-index: calc(var(--length) - var(--index));
      left: calc(var(--index) * var(--horizontal-offset, 1px));
      -webkit-text-stroke: 1px black;
      text-shadow: 4px 4px 3px rgba(0, 0, 0, .2);
      animation:
        bounce
        var(--speed, 1.5s)
        calc(var(--index) * var(--delay, 50ms))
        ease-in-out
        infinite;
    }

    @keyframes bounce {
      0%, 100% {
        transform: none;
      }
      50% {
        transform: translateY(var(--vertical-offset, 100%))
      }
    }
  </style>
`


class HotFXSlinky extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' });
    setTimeout(() => this.#render(), 100)
    this.addEventListener('slotchange', () => this.#render)
  }

  get stops() {
    if (this.hasAttribute('colors')) {
      return JSON.parse(this.getAttribute('colors'))
    } else if (this.hasAttribute('n')) {
      if (/\D/.test(this.getAttribute('n'))) {
        throw TypeError(`Invalid n attribute for <hotfx-slinky>: "${this.getAttribute('n')}". Expected a positive integer.`)
      }
      const n = parseInt(this.getAttribute('n'))
      if (this.hasAttribute('colorStart') && this.hasAttribute('colorEnd')) {
        const interpolatorName = this.hasAttribute('interpolate')
          ? this.getAttribute('interpolate')
          : 'interpolateRGB'
        if (
          this.hasAttribute('interpolate') &&
          !interpolatorOptions.includes(interpolatorName)
        ) {
          throw TypeError(`Invalid interpolate attribute for <hotfx-slinky>: "${interpolatorName}"`)
        }
        const interpolator = d3[interpolatorName](
          this.getAttribute('colorStart'),
          this.getAttribute('colorEnd'),
        )
        return Array(n).fill().map((_,i) => interpolator(i/(n-1)))
      }
      return Array(n).fill()
    }
    return ['white', '#D49C3D', '#D14B3D', '#CF52EB', '#44A3F7', '#5ACB3C', '#DEBF40']
  }

  #render() {
    this.style.setProperty('--length', this.stops.length)
    const node = Array.from(this.children).find(el => el.tagName != 'TEMPLATE')
    this.shadowRoot.innerHTML = ''
    this.shadowRoot.append(
      ...this.stops.map((color, i) => {
        const copy = node.cloneNode(true)
        if (color) copy.style.setProperty('--color', color)
        copy.setAttribute('part', 'copy')
        copy.style.setProperty('--index', i)
        return copy
      })
    )
    const template = Array.from(this.children).find(
      el => el.tagName == 'TEMPLATE'
    ) || defaultTemplate
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }
}

customElements.define('hotfx-slinky', HotFXSlinky)
