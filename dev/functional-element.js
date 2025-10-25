import { html, render } from 'https://esm.sh/lit-html'
import { Signal } from 'https://esm.sh/signal-polyfill'

// This was inspired by Ginger's post on Piccalilli:
// https://piccalil.li/blog/functional-custom-elements-the-easy-way/

export const lightElement = (fn) => define(fn, { useShadow: false })
export const shadowElement = (fn) => define(fn)

export function define(fn, { useShadow = true } = {}) {
  const elementName = fn.name.replaceAll(/(.)([A-Z])/g, '$1-$2').toLowerCase()

  if (!elementName.includes('-')) {
    throw new Error(`Function ${fn.name} must include at least one capital letter to be converted to a valid custom element name`)
  }

  if (customElements.get(elementName)) {
    throw new Error(`Custom element with name ${elementName} already defined`)
  }

  customElements.define(elementName, class extends HTMLElement {
    constructor() {
      super()
      if (useShadow) this.attachShadow({ mode: 'open' })

      const templateFn = fn.call(this, {
        html,
        internals: this.attachInternals(),
        state: (value) => new Signal.State(value),
      })

      this.template = new Signal.Computed(() => templateFn())

      const renderTemplate = () =>
        render(this.template.get(), useShadow ? this.shadowRoot : this)

      let renderPending = false
      const watcher = new Signal.subtle.Watcher(() => {
        if (renderPending) return
        queueMicrotask(() => {
          renderPending = false
          renderTemplate()
          watcher.watch()
        })
      })

      watcher.watch(this.template)

      renderTemplate()
    }
  })
}

/*

Use it like this:

import { shadowElement } from '@hot-page/functional-element'

shadowElement(function HueSlider({ html, state }) {
  const value = state(0)
  const callCount = state(0)

  function onInput(event) {
    // N.B. this will only call render one time even though we set two signals
    value.set(event.target.value)
    callCount.set(callCount.get() + 1)
  }

  return () => {
    this.hue = value.get()
    return html`
      <style>
        :host {
          display: block;
          padding: 16px;
          background: hsl(${value.get()}, 100%, 90%);
        }
      </style>
      <input type=range min=0 max=255 .value=${value.get()} @input=${onInput}>
      <p>Hue: ${value.get()}</p>
      <p>Update count: ${callCount.get()}</p>
    `
  }
})

To Do:
- cleanup function
- observed attributes and attribute reflection (first argument is an array of attribute names)
- methods
- context
- context provider?

What you give up:
- private methods

What you get:
- easy reactivity
- less boilerplate

*/
