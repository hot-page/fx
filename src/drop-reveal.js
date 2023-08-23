class DropReveal extends HTMLElement {
  constructor() {
    super()
    console.log(this)
    this.attachShadow({ mode: 'open' });
    document.addEventListener('DOMContentLoaded', () => {
      this._intersectionObserver = new IntersectionObserver(this._intersectionCallback.bind(this))
      this._intersectionObserver.observe(this)
    })
  }
  
  _intersectionCallback(entries) {
    setTimeout(() => {
      if (entries[0].isIntersecting) {
        this.shadowRoot.querySelector('.mask').classList.add('reveal')
      } else {
        this.shadowRoot.querySelector('.mask').classList.remove('reveal')
      }
    }, 100)
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
