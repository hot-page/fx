/* based on a code pen by Mateus Generoso
 * https://codepen.io/mtsgeneroso/pen/mdJRpxX 
 * Thank you!
 */

class RainbowText extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.#render()
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

        div {
          color: white;
          position: relative;
          z-index: 10;
          animation: bounce 1.5s ease-in-out infinite;
          text-shadow:
            1px 1px 0 black,
            -1px 1px 0 black,
            1px -1px 0 black,
            -1px -1px 0 black,
            4px 4px 0 rgba(0, 0, 0, .2);
        }

        div.white ~ div {
          position: absolute;
          top: 0;
          width: max-content;
        }

        div.orange {
          color: #D49C3D;
          z-index: 9;
          animation-delay: 0.05s;
          left: 1px;
        }

        div.red {
          color: #D14B3D;
          z-index: 8;
          animation-delay: 0.1s;
          left: 2px;
        }

        div.violet {
          color: #CF52EB;
          z-index: 7;
          animation-delay: 0.15s;
          left: 3px;
        }

        div.blue {
          color: #44A3F7;
          z-index: 6;
          animation-delay: 0.2s;
          left: 4px;
        }

        div.green {
          color: #5ACB3C;
          z-index: 5;
          animation-delay: 0.25s;
          left: 5px;
        }

        div.yellow {
          color: #DEBF40;
          z-index: 4;
          animation-delay: 0.3s;
          left: 6px;
        }
 
        @keyframes bounce {
          0%, 100% {
            transform: translatey(0.7em); 
          }
          50% {
            transform: translatey(-0.7em);
          }
        }
      </style>
      <div class="container">
        <div class="white">${this.innerHTML}</div>
        <div class="orange">${this.innerHTML}</div>
        <div class="red">${this.innerHTML}</div>
        <div class="violet">${this.innerHTML}</div>
        <div class="blue">${this.innerHTML}</div>
        <div class="green">${this.innerHTML}</div>
        <div class="yellow">${this.innerHTML}</div>
      </div>
    `
  }
}

customElements.define('rainbow-text', RainbowText)
