class HotFXBlur extends HTMLElement {

  static observedAttributes = ['steps', 'behind']

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.#render()
  }

  attributeChangedCallback() {
    console.log('attributeChangedCallback')
    this.#render()
  }

  #render() {
    if (this.hasAttribute('steps') && /\D/.test(this.getAttribute('steps'))) {
      throw TypeError(`Invalid steps attribute for <hotfx-blur>: "${this.getAttribute('steps')}". Expected a positive integer.`)
    }
    const steps = parseInt(this.getAttribute('steps') || 6)
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
        }

        #outer-container {
          display: grid;
          align-items: center;
          justify-items: center;
          position: absolute;
          inset: 0;
          pointer-events: none;
        }

        #inner-container {
          width: 100%;
          height: 100%;
          box-sizing: content-box;
          padding: var(--padding, calc(var(--blur, 8px) + 5px));
          position: absolute;
          --steps: ${steps};
        }

        .step {
          position: absolute;
          inset: 0;
          --width: calc(100% - var(--start, 20%));
          --begin: calc(
            var(--start, 20%) +
            (var(--width) * var(--index) / var(--steps))
          );
          --end: calc(
            var(--start, 20%) +
            (var(--width) * (var(--index) + 1) / var(--steps))
          );
          mask: linear-gradient(
            to right,
            rgba(0 0 0 / 0) 0%,
            rgba(0 0 0 / 0) var(--begin),
            rgba(0 0 0 / 1) var(--end),
            rgba(0 0 0 / 1) 100%
          );
          ${this.hasAttribute('debug') ? 'background: rgb(255 0 0 / 5%);' : ''}
          backdrop-filter: blur(var(--blur, 2px));
        }

        ${this.hasAttribute('behind') ? `
          #slot-container {
            position: relative;
            z-index: 1;
          }
        ` : ''}

        :host([direction=left]) .step {
          mask: linear-gradient(
            to left,
            rgba(0 0 0 / 0) 0%,
            rgba(0 0 0 / 0) var(--begin),
            rgba(0 0 0 / 1) var(--end),
            rgba(0 0 0 / 1) 100%
          );
        }

        :host([direction=top]) .step {
          mask: linear-gradient(
            to top,
            rgba(0 0 0 / 0) 0%,
            rgba(0 0 0 / 0) var(--begin),
            rgba(0 0 0 / 1) var(--end),
            rgba(0 0 0 / 1) 100%
          );
        }

        :host([direction=bottom]) .step {
          mask: linear-gradient(
            to bottom,
            rgba(0 0 0 / 0) 0%,
            rgba(0 0 0 / 0) var(--begin),
            rgba(0 0 0 / 1) var(--end),
            rgba(0 0 0 / 1) 100%
          );
        }
      </style>
      <div id="slot-container">
        <slot></slot>
      </div>
      <div id="outer-container">
        <div id="inner-container">
          ${Array(steps).fill().map((_, i) => `
            <div class="step" part="step" style="--index: ${i}"></div>
          `).join('')}
        </div>
      </div>
    `
  }
}

customElements.define('hotfx-blur', HotFXBlur)
