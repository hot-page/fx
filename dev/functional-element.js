import { html, render } from 'https://esm.sh/lit-html'
import { Signal } from 'https://esm.sh/signal-polyfill'

// This was inspired by Ginger's post on Piccalilli:
// https://piccalil.li/blog/functional-custom-elements-the-easy-way/

export default function define(fn) {
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
      this.attachShadow({ mode: 'open' })

      const templateFn = fn.call(this, {
        html,
        internals: this.attachInternals(),
        state: (value) => new Signal.State(value),
      })

      this.template = new Signal.Computed(() => templateFn())

      render(this.template.get(), this.shadowRoot)

      let renderPending = false
      const watcher = new Signal.subtle.Watcher(() => {
        if (renderPending) return
        queueMicrotask(() => {
          renderPending = false
          render(this.template.get(), this.shadowRoot)
          watcher.watch()
        })
      })

      watcher.watch(this.template)
    }
  })
}

/*

Use it like this:

import define from '@hot-page/functional-element'

define(function MyButton({ html, state }) {
  const value = state(0)
  const callCount = state(0)

  function onInput(event) {
    // N.B. this will only call render one time even though we set two signals
    value.set(event.target.value)
    callCount.set(callCount.get() + 1)
  }

  return () => html`
    <style>
      :host {
        display: block;
        background: hsl(${value.get()}, 100%, 90%);
        padding: 16px;
      }
    </style>
    <input type=range min=0 max=255 .value=${value.get()} @input=${onInput}>
    <p>Value: ${value.get()}</p>
    <p>update count: ${callCount.get()}</p>
    <button @click=${() => value.set(1)}> set to 1</button >
    <button @click=${() => value.set(100)}> set to 100</button >
  `
})

*/
