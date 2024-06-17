class TextDial extends HTMLElement {
  #intersectionObserver

  constructor() {
    super()
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.#render()
  }

  run() {
    this.shadowRoot.querySelector('.text').classList.remove('animate')
    this.offsetHeight
    this.shadowRoot.querySelector('.text').classList.add('animate')
  }

  #render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: inline;
          box-sizing: border-box;
        }

        * {
          box-sizing: inherit;       
        }

        .text {
          position: relative;
          display: inline-flex;
          flex-flow: row nowrap;
        }

        .mask {
          display: inline-block;
          position: relative;
          overflow: hidden;
          height: 100%;
        }

        .dial {
          position: absolute;
        }

        .text.animate .mask:nth-child(1) .dial {
          transition-delay: 0.1s;
        }

        .text.animate .mask:nth-child(2) .dial {
          transition-delay: 0.2s;
        }

        .text.animate .mask:nth-child(3) .dial {
          transition-delay: 0.3s;
        }

        .text.animate .dial {
          transform: translateY(-100%);
          transition: transform 0.3s ease-out;
        }

        .character {
          color: transparent;
        }
      </style>
      <span class="text animate">
        ${this.textContent.split('').map(character =>
          `<span class="mask">
            <span class="character">
              ${character}
            </span>
            <div class="dial">
              <div>${String.fromCharCode(character.charCodeAt(0) - 4)}</div>
              <div>${String.fromCharCode(character.charCodeAt(0) - 3)}</div>
              <div>${String.fromCharCode(character.charCodeAt(0) - 2)}</div>
              <div>${String.fromCharCode(character.charCodeAt(0) - 1)}</div>
              <div>${character}</div>
            </div>
          </span>`
        ).join('')}
      </span>
    `
  }

}

customElements.define('text-dial', TextDial)
