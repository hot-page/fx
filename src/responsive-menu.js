
class ResponsiveMenu extends HTMLElement {
  static observedAttributes = ["media"];
  #matchedMedia

  constructor() {
    super()
    this.attachShadow({ mode: 'open' });
    this.#matchedMedia = window.matchMedia(this.#media)
    this.#matchedMedia.addEventListener('change', this.#onChangeMedia)
    this.state = this.#matchedMedia.matches ? 'closed' : 'visible'
  }
 
  attributeChangedCallback() {
    this.#matchedMedia.removeEventListener('change', this.#onChangeMedia)
    this.#matchedMedia = window.matchMedia(this.#media)
    this.#render()
  }

  connectedCallback() {
    this.#render()
  }

  get state() {
    return this.getAttribute('state');
  }
  
  set state(state) {
    this.setAttribute('state', state);
  }

  open() {
    if (this.state == 'visible') return
    this.state = 'open'
  }

  close() {
    if (this.state == 'visible') return
    this.state = 'close'
  }

  toggle() {
    if (this.state == 'visible') return
    this.state = this.state == 'open' ? 'closed' : 'open'
  }

  get #media() {
    return this.getAttribute('media') || '(max-width: 800px)'
  }

  #onChangeMedia = (event) => {
    this.state = event.target.matches ? 'closed' : 'visible'
  }

  #onClickIcon = (event) => {
    this.state = this.state == 'closed' ? 'open' : 'closed'
  }

  #onClickMenu = (event) => {
    if (this.state == 'visible' || !event.target.closest('a')) return
    this.state = 'closed'
  }

  #render() {
    // Icon from https://codepen.io/shephero/pen/LYVrdjX (thank you!)
    this.shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: border-box;       
        }

        #icon {
          display: none;
          width: 2rem;
          stroke: currentColor;
          stroke-width: .6;
          fill: rgba(0,0,0,0);
          stroke-linecap: round;
        }

        #icon path {
          transition: d 300ms ease-out;
        }

        :host([state="open"]) #icon path {
          d: path('M3,3L5,5L7,3M5,5L5,5M3,7L5,5L7,7');
        }

        #menu {
          display: flex;
          flex-flow: row nowrap;
        }

        #mask {
          opacity: 0;
          position: fixed;
          inset: 0;
          background: rgba(0 0 0 / 70%);
          transition: opacity 300ms ease-out, visibility 300ms 0s;
        }

        :host([state="visible"]) #mask {
          display: none;
        }

        :host([state="open"]) #mask {
          opacity: 1;
          visibility: visible;
        }

        :host([state="closed"]) #mask {
          opacity: 0;
          visibility: hidden;
        }

        @media ${this.#media} {
          #icon {
            display: block;
            position: relative;
            z-index: 5;
          }

          #menu {
            position: fixed;
            top: 0;
            right: 0;
            height: 100vh;
            padding: 64px 32px 32px 32px;
            overflow: scroll;
            flex-flow: column nowrap;
            align-items: start;
            background: white;
            z-index: 4;
            transform: translateX(100%);
          }
        }

        /* putting this transition here prevents it from showing briefly when
         * the breakpoint changes */
        :host(:not([state="visible"])) #menu {
          transition: transform 300ms ease-out;
        }

        :host([state="open"]) #menu {
          transform: none;
        }
      </style>
      <svg id="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
        <path d="M2,3L5,3L8,3M2,5L8,5M2,7L5,7L8,7" />
      </svg>
      <div id="mask"></div>
      <div id="menu">
        <slot></slot>
      </div>
    `
    this
      .shadowRoot
      .querySelector('svg')
      .addEventListener('click', this.#onClickIcon)
    this
      .shadowRoot
      .querySelector('#menu')
      .addEventListener('click', this.#onClickMenu)
    this
      .shadowRoot
      .querySelector('#mask')
      .addEventListener('click', () => this.close())
  }
}

customElements.define('responsive-menu', ResponsiveMenu)
