// import * as d3 from 'https://cdn.jsdelivr.net/npm/d3-interpolate@3.0.1/+esm'
import * as d3 from 'd3-interpolate'

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
  static observedAttributes = ['n', 'color-start', 'color-end', 'interpolate-long']

  constructor() {
    super()
    this.attachShadow({ mode: 'open' });
    this.#render()
    const observer = new MutationObserver(() => this.#render())
    observer.observe(
      this,
      { subtree: true, childList: true, characterData: true },
    )
  }

  attributeChangedCallback() {
    this.#render()
  }

  get stops() {
    if (this.hasAttribute('colors')) {
      return JSON.parse(this.getAttribute('colors'))
    } else if (this.hasAttribute('n')) {
      if (/\D/.test(this.getAttribute('n'))) {
        throw TypeError(`Invalid n attribute for <hotfx-slinky>: "${this.getAttribute('n')}". Expected a positive integer.`)
      }
      const n = parseInt(this.getAttribute('n') || 1)
      if (this.hasAttribute('color-start') && this.hasAttribute('color-end')) {
        if (
          this.hasAttribute('interpolate-long')
        ) {
        }
        const fnName = 
          this.hasAttribute('interpolate-long') ? 
          'interpolateHslLong':
          'interpolateHsl'
        const interpolator = d3[fnName](
          this.getAttribute('color-start'),
          this.getAttribute('color-end'),
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
