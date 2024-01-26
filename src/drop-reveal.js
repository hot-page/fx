class DropReveal extends HTMLElement {
  constructor() {
    super()
    this.attachShadow({ mode: 'open' });
    this._intersectionObserver = new IntersectionObserver(this._intersectionCallback.bind(this))
    this._intersectionObserver.observe(this)
  }
  
  _intersectionCallback(entries) {
    setTimeout(() => {
      if (entries[0].isIntersecting) {
        this.reveal()
      } else {
        this.hide()
      }
    }, 100)
  }

  reveal() {
    this.shadowRoot.querySelector('.mask').classList.remove('reveal')
    void this.offsetHeight // trigger reflow
    this.shadowRoot.querySelector('.mask').classList.add('reveal')
  }

  hide() {
    this.shadowRoot.querySelector('.mask').classList.remove('reveal')
  }
  
  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }

        .mask {
          overflow: hidden;
        }

        .mask:before {
          content: '';
          display: block;
          width: 100%;
          position: absolute;
          border-top: 3px solid currentColor;
          transform: scaleX(0);
        }
    
        .mask.reveal:before {
          transition: transform 500ms ease-out;
          transform: scaleX(1);
        }

        
        :host([direction="up"]) .mask:before {
          top: 100%;
        }

        .container {
          display: flow-root;
          will-change: transform;
          transform: translateY(-100%);
        }
 
        :host([direction="up"]) .container {
          transform: translateY(100%);
        }
    
        :host .mask.reveal .container {
          transition: transform 500ms 500ms ease-out;
          transform: none;
        }
      </style>
      <div class="mask">
        <div class="container">
          <slot></slot>
        </div>
      </div>
    `
  }
}

customElements.define('drop-reveal', DropReveal)
