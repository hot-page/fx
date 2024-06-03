
/* TODO:
 *  - opens with spacebar or enter when the icon is focused
 *  - aria attributes
 *  - use dialog element like hot-lightbox or perhaps popover?
 *  - move the css properties for stroke-width etc to the svg inside #icon not on #icon itself
 *  - buggy behavior: set state() let's you set to 'open' or 'closed' even if the media query isn't set so the style gets all fucked up
 *  - the state could be represented as a custom pseudo class? https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_states_and_custom_state_pseudo-class_css_selectors
 */
class ResponsiveMenu extends HTMLElement {
  static observedAttributes = ["media"];
  static #defaultMedia = '(max-width: 800px)'
  #matchedMedia

  // We're going to create a shadow DOM etc etc
  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.#matchedMedia = window.matchMedia(this.#media)
    this.#matchedMedia.addEventListener('change', this.#onChangeMedia)
    this.state = this.#matchedMedia.matches ? 'closed' : 'visible'
  }
 
  attributeChangedCallback() {
    this.#matchedMedia.removeEventListener('change', this.#onChangeMedia)
    this.#matchedMedia = window.matchMedia(this.#media)
    this.#matchedMedia.addEventListener('change', this.#onChangeMedia)
    this.#render()
  }

  connectedCallback() {
    this.#render()
    this.querySelector('[slot=icon]')
      .addEventListener('click', this.#onClickIcon)
  }

  get state() {
    return this.getAttribute('state');
  }

  set state(state) {
    if (!['open','closed','visible'].includes(state)) {
      throw new TypeError(`Invalid state "${state}"`)
    }
    this.setAttribute('state', state);
  }

  open() {
    if (this.state == 'visible') return
    this.state = 'open'
  }

  close() {
    if (this.state == 'visible') return
    this.state = 'closed'
  }

  toggle() {
    if (this.state == 'visible') return
    this.state = this.state == 'open' ? 'closed' : 'open'
  }

  get #media() {
    return this.getAttribute('media') || ResponsiveMenu.#defaultMedia
  }

  #onChangeMedia = (event) => {
    this.state = event.target.matches ? 'closed' : 'visible'
  }

  #onClickIcon = () => {
    this.state = this.state == 'closed' ? 'open' : 'closed'
  }

  #onClickMenu = (event) => {
    if (this.state == 'visible' || !event.target.closest('a')) return
    this.state = 'closed'
  }

  #render() {
    this.shadowRoot.innerHTML = `
      <style>
        * {
          box-sizing: border-box;       
        }

        #icon {
          display: none;
        }

        #icon svg {
          width: 2rem;
          stroke: currentColor;
          stroke-width: .6;
          fill: rgba(0,0,0,0);
          stroke-linecap: round;
        }

        #icon path {
          transition: d 300ms ease-out;
        }

        /* Icon is from a CodePen by Owen Shepherd - thank you!
         * https://codepen.io/shephero/pen/LYVrdjX */
        :host([state="open"]) #icon path {
          d: path('M3,3L5,5L7,3M5,5L5,5M3,7L5,5L7,7');
        }

        #menu {
          display: flex;
          flex-flow: row nowrap;
          align-items: center;
        }

        #backdrop {
          opacity: 0;
          position: fixed;
          inset: 0;
          background: rgba(0 0 0 / 70%);
          transition: opacity 300ms ease-out, visibility 300ms 0s;
        }

        :host([state="visible"]) #backdrop {
          display: none;
        }

        :host([state="open"]) #backdrop {
          opacity: 1;
          visibility: visible;
        }

        :host([state="closed"]) #backdrop {
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
            overflow: auto;
            flex-flow: column nowrap;
            align-items: start;
            z-index: 4;
            transform: translateX(100%);
            padding: 64px 32px 32px 32px;
            background: white;
            overscroll-behavior: contain;
          }

          /* required for overscroll-behavior: contain; */
          #menu::before {
            content: '';
            position: absolute;
            top: 0;
            display: block;
            height: calc(100% + 1px);
            width: 1px;
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
      <div id="icon">
        <slot name="icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
            <path d="M2,3L5,3L8,3M2,5L8,5M2,7L5,7L8,7" />
          </svg>
        </slot>
      </div>
      <div part="backdrop" id="backdrop"></div>
      <div part="menu" id="menu">
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
      .querySelector('#backdrop')
      .addEventListener('click', () => this.close())
  }
}

customElements.define('responsive-menu', ResponsiveMenu)
