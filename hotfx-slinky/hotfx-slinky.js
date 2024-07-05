/* based on a code pen by Mateus Generoso
 * https://codepen.io/mtsgeneroso/pen/mdJRpxX 
 * Thank you!
 *
 * TODO
 */

class HotFXSlinkyText extends HTMLElement {
  #rainbowStops = ['white', '#D49C3D', '#D14B3D', '#CF52EB', '#44A3F7', '#5ACB3C', '#DEBF40']

  constructor() {
    super()
    this.attachShadow({ mode: 'open' });
    this.#render()
    this.addEventListener('slotchange', () => this.#render)
  }

  #render() {
    this.shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: inherit;       
        }

        .container {
          box-sizing: border-box;
          position: relative;
        }

        .stop:first-child {
          position: relative;
          display: flow-root;
        }

        .stop {
          position: absolute;
          top: 0;
          width: max-content;
          z-index: calc(${this.#rainbowStops.length} - var(--index));
          left: calc(var(--index) * 1px);
          text-shadow:
            1px 1px 0 black,
            -1px 1px 0 black,
            1px -1px 0 black,
            -1px -1px 0 black,
            4px 4px 0 rgba(0, 0, 0, .2);

          animation: bounce-transform var(--hotfx-slinky-duration, 1.5s) ease-in-out infinite;
          animation-delay: calc(var(--index) * var(--hotfx-slinky-delay, 50ms));
        }

        @keyframes loop-offset {
          from {
            offset-distance: 0;
          }
          to {
            offset-distance: 100%;
          }
        }

        @keyframes bounce-transform {
          0%, 100% {
            transform: none;
          }
          50% {
            transform: translateY(var(--hotfx-slinky-distance, 0.7em))
          }
        }
      </style>
      <div class="container">
        ${this.#rainbowStops.map((s,i) => `
          <div class="stop" part="stop" style="color: ${s}; --index: ${i}">
            ${this.innerHTML}
          </div>`
        ).join('')}
      </div>
    `
  }
}

customElements.define('hotfx-slinky-text', HotFXSlinkyText)
