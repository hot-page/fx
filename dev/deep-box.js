
class DeepBox extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
  }

  connectedCallback() {
    const defaultDepth = '100px'
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          width: fit-content;
          transform-style: preserve-3d;
        }

        .container {
          position: relative;
          height: 100%;
          width: 100%;
          transform-style: preserve-3d;
        }

        .front, .top, .right, .bottom, .left, .back {
          position: absolute;
          border: var(--border, 1px solid currentColor);
        }

        .front {
          position: relative;
          height: 100%;
          inset: 0;
          background: var(--front-background, var(--background, white));
          transform-style: preserve-3d;
        }

        .top {
          top: 0;
          right: 0;
          left: 0;
          height: var(--depth, ${defaultDepth});
          transform-origin: top center;
          transform: rotateX(-90deg);
          background: var(--top-background, var(--background, white));
        }

        .right {
          top: 0;
          right: 0;
          bottom: 0;
          width: var(--depth, ${defaultDepth});
          transform-origin: center left;
          transform: translate(100%) rotateY(90deg);
          background: var(--right-background, var(--background, white));
        }

        .bottom {
          right: 0;
          bottom: 0;
          left: 0;
          height: var(--depth, ${defaultDepth});
          transform-origin: bottom center;
          transform: rotateX(90deg);
          background: var(--bottom-background, var(--background, white));
        }

        .left {
          top: 0;
          bottom: 0;
          left: 0;
          width: var(--depth, ${defaultDepth});
          transform-origin: center right;
          transform: translate(-100%) rotateY(-90deg);
          background: var(--left-background, var(--background, white));
        }

        .back {
          inset: 0;
          z-index: -1;
          transform: translateZ(calc(-1 * var(--depth, ${defaultDepth}))) rotateY(180deg);
          background: var(--back-background, var(--background, white));
        }
      </style>
      <div class="container">
        <div class="front">
          <slot></slot>
        </div>
        <div class="top"></div>
        <div class="right"></div>
        <div class="bottom"></div>
        <div class="left"></div>
        <div class="back"></div>
      </div>
    `
  }
}

customElements.define('deep-box', DeepBox)
