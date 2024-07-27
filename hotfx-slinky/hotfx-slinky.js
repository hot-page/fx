// We use the D3 color interpolation functions for transitioning between two
// colors.
import { interpolateHslLong, interpolateHsl } from 'd3-interpolate'

// This are the default styles that are similar to the original
// [CodePen by Mateus Generoso](https://codepen.io/mtsgeneroso/pen/mdJRpxX).
const defaultTemplate = document.createElement('template')
defaultTemplate.innerHTML = [`
  <style>
    :host {
      position: relative;
    }

    :first-of-type {
      position: relative;
    }`,
    // Each element is positioned absolutely to take it out of the document's
    // flow, meaning that the browser doesn't create space for it on the page.A
    // Then we apply colors, a text-stroke and a slight shadow. Each is slightly
    // offset to the right by positioning the left edge a few pixels over.
    `* {
      position: absolute;
      top: 0;
      margin: 0;
      color: var(--color);
      -webkit-text-stroke: 1px black;
      text-shadow: 4px 4px 3px rgba(0, 0, 0, .2);
      left: calc(var(--index) * var(--horizontal-offset, 1px));
      z-index: calc(var(--length) - var(--index));
      animation:
        bounce
        var(--speed, 1.5s)
        calc(var(--index) * var(--delay, 50ms))
        ease-in-out
        infinite;
    }`,
    // These keyframes have the element bounce up and down
    `@keyframes bounce {
      0%, 100% {
        transform: none;
      }
      50% {
        transform: translateY(var(--vertical-offset, 100%))
      }
    }
  </style>
`].join('')

// The HotFXSlinky is a custom element. Extending the HTMLElement class allows
// us to register this with the browser so it can be used in page markup.
class HotFXSlinky extends HTMLElement {
  // Changes to the attributes listed in `observedAttributes` trigger a callback
  // and allow us to re-render the element's shadow DOM.
  static observedAttributes = ['length', 'color-start', 'color-end', 'rainbow']

  constructor() {
    super()
    this.attachShadow({ mode: 'open' });
    this.#render()
    // We use a `MutationObserver` to re-render the element when any
    // of the light DOM changes. This is similar to listening to the 
    // `slotchange` event but it works for the subtree and text as
    // well.
    const observer = new MutationObserver(() => this.#render())
    observer.observe(
      this,
      { subtree: true, childList: true, characterData: true },
    )
  }

  // Re-render the when any of the observed attributes are changed.
  attributeChangedCallback() {
    this.#render()
  }

  // The `.stops` property is an array of color strings. It is calculated by
  // using the `length` attribute and a 
  get stops() {
    if (this.hasAttribute('length')) {
      // Do some error checking on the length attribute. This should be a
      // positive integer.
      if (/\D/.test(this.getAttribute('length'))) {
        throw TypeError(`Invalid length attribute for <hotfx-slinky>: "${this.getAttribute('length')}". Expected a positive integer.`)
      }
      const length = parseInt(this.getAttribute('length') || 7)
      // If we've been given the color-start and color-end attributes, we can 
      // do a transition between the colors.
      if (this.hasAttribute('color-start') && this.hasAttribute('color-end')) {
        // If the `rainbow` attribute is set, use the long version of the 
        // interpolate function, which takes the longer way around the color
        // wheel.
        const fn = this.hasAttribute('rainbow')
          ? interpolateHslLong
          : interpolateHsl
        const interpolator = fn(
          this.getAttribute('color-start'),
          this.getAttribute('color-end'),
        )
        // Fill our array with all of the interpolated values.
        return Array(length).fill().map((_,i) => interpolator(i/(length-1)))
      }
      // Without the color attributes we just return an array of the given
      // length.
      return Array(length).fill()
    }
    return ['#FFFFFF', '#D49C3D', '#D14B3D', '#CF52EB', '#44A3F7', '#5ACB3C', '#DEBF40']
  }

  #render() {
    // Setting the `--length` variable on the element itself will pass it down to
    // all of the shadow DOM children for styling
    this.style.setProperty('--length', this.stops.length)
    // The nodes to be copied. This means that you can have multiple children
    // and all of them will be copied.
    const nodes = Array.from(this.children).filter(el => el.tagName != 'TEMPLATE')
    // Clear the existing shadow DOM of elements.
    this.shadowRoot.innerHTML = ''
    // Create and append the copied elements to our shadow DOM.
    this.shadowRoot.append(
      // Loop through the colors
      ...this.stops.flatMap((color, i) => nodes.map(node => {
        const copy = node.cloneNode(true)
        if (color) copy.style.setProperty('--color', color)
        // Setting the part attribute let's the user style the elements with
        // the `::part(copy)` selector.
        copy.setAttribute('part', 'copy')
        // Setting `aria-hidden` will hide this content from screen readers.
        if (i > 0) copy.setAttribute('aria-hidden', 'true')
        // The `--index` custom property helps for styling these elements.
        copy.style.setProperty('--index', i)
        return copy
      }))
    )
    // Find the `<template>` element that is a direct child of this element. Or
    // use the default template which has all the default styles.
    const template = Array.from(this.children).find(
      el => el.tagName == 'TEMPLATE'
    )
    // The no-style attribute removes the default styles from the element
    || (this.hasAttribute('no-style')
      ? document.createElement('template')
      : defaultTemplate)
    // Clone the contents of the template and insert them into the shadow DOM.
    this.shadowRoot.appendChild(template.content.cloneNode(true))
  }
}

// Lastly, define the `<hotfx-slinky>` custom element using the above class so
// that we can use it anywhere in our HTML.
customElements.define('hotfx-slinky', HotFXSlinky)
