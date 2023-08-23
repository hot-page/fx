import animate from './animate.js'
import 'https://unpkg.com/hammerjs@2.0.8/hammer.js'

class FarOutCarousel extends HTMLElement {

  constructor() {
    super()
    this._resizeObserver = new ResizeObserver(() => this._setupChildren())
    this._intersectionObserver = new IntersectionObserver(this._intersecionCallback.bind(this))
    this._position = 0
    this._keyHandler = this._keyHandler.bind(this)
    this.attachShadow({ mode: 'open' });
    var hammertime = new Hammer(this, {});
    hammertime.on('pan', this._pan.bind(this))
    hammertime.on('panstart ', this._pan.bind(this))
    hammertime.on('swipe', this._swipe.bind(this))
    this._panStart = undefined
  }

  get currentIndex() {
    return Math.max(0, Math.min(this.children.length-1, Math.round(this._position)))
  }

  previous() {
    if (this.teaserTimeout) clearTimeout(this.teaserTimeout)
    if (this._tween) this._tween.cancel()
    if (this._position == 0) {
      return
    } else if (this._position < 0) {
      this._createTween(0)
    } else if (Math.ceil(this._position) - this._position > .7) {
      this._createTween(Math.max(0, Math.ceil(this._position) - 2))
    } else {
      this._createTween(Math.ceil(this._position) - 1)
    }

  }

  next() {
    if (this.teaserTimeout) clearTimeout(this.teaserTimeout)
    if (this._tween) this._tween.cancel()
    if (this._position < 0 || this._position >= this.children.length -1) {
      this._createTween(0)
    } else if (this._position - Math.floor(this._position) > .7) {
      this._createTween(
        Math.min(this.children.length -1, Math.floor(this._position) + 2)
      )
    } else {
      this._createTween(Math.floor(this._position) + 1)
    }
  }

  _intersecionCallback([entry]) {
    if (entry.isIntersecting) {
      window.addEventListener('keydown', this._keyHandler)
      this.dispatchEvent(new CustomEvent('visible', {
        detail: { index: this._position }, bubbles: false
      }))
      if (!this.classList.contains('visible') ) {
        this.teaserTimeout = setTimeout(() => {
          this.teaserTimeout = undefined
          this.classList.add('visible')
          this._createTween(.05, () => this._createTween(0))
        }, 5000)
      }
    } else {
      window.removeEventListener('keydown', this._keyHandler)
    }
  }

  _keyHandler(event) {
    if (event.key == 'ArrowLeft') {
      this.previous()
    } else if (event.key == 'ArrowRight') {
      this.next()
    }
  }

  _swipe(event) {
    if (event.pointerType == 'mouse') return
    if (event.deltaX > 0) {
      this.next()
    } else {
      this.previous()
    }
  }

  _pan(event) {
    if (event.pointerType == 'mouse') return
    if (this.teaserTimeout) clearTimeout(this.teaserTimeout)
    if (this._tween) this._tween.cancel()
    if (typeof this._panStart == 'undefined') {
      this._panStart = this._position
    }
    // last event
    if (event.isFinal) {
      this._panStart = undefined
      if (this._position < 0) this.next()
      else if (this._position > this.children.length-1) this.previous()
      else if (event.velocityX > 0) this.next()
      else if (event.velocityX < 0) this.previous()
      else if (event.deltaX > 0 && event.deltaX / this.clientWidth > .1) this.next()
      else if (event.deltaX < 0 && event.deltaX / this.clientWidth < .1) this.previous()
      else if (event.deltaX > 0) this.previous()
      else this.next()
      return
    }
    const newPosition = this._panStart + event.deltaX / this.clientWidth
    if (newPosition < 0) {
      this._position = 1-((1 - newPosition) ** .5)
    } else if (newPosition > this.children.length - 1) {
      this._position = this.children.length - ((this.children.length - newPosition) ** .2)
    } else {
      this._position = newPosition
    }
    this._render()
  }

  _render() {
    ;([...this.children]).forEach((slide, i) => {
      const pos = i - this._position
      // already off screen
      if (pos < -1) {
        slide.style.transform = `translateX(10000px)`
      // moving right
      } else if (pos < 0) {
        slide.style.transform = `translate(${ (this._position - i) * 150 }vw, -50%)`
      // moving forward in 3d
      } else {
        // shows four slides and the rest are invisible
        slide.style.opacity = Math.max(0, Math.min(1, 1 - (pos / 4)))
        slide.style.transform = `
          translate3d(
            0,
            calc(${-100 * pos**1.3}px - 50%),
            ${ -300 * pos**1.3 }px
          )
          scale(${1-pos / (this.children.length - this._position) * .9})
          rotateX(${10 * pos}deg)`
      }
    })
  }

  _createTween(position, done) {
    const ease = animate.cubicOut(this._position, position)
    this._tween = animate({
      duration: 500,
      tick: (x) => {
        this._position = ease(x)
        this._render()
      },
      done: () => {
        if (this._position == Math.round(this._position)) {
          this.dispatchEvent(new CustomEvent('change', {
            detail: { index: this._position }, bubbles: false
          }))
        }
        if (done) done()
      },
    })
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          transform-style: preserve-3d;
        }

        :host(.visible) button.next {
          animation: grow 1s ease;
        }

        @keyframes grow {
          0% { transform: scale(1); }
          50% { transform: scale(1.5); }
          100% { transform: scale(1); }
        }

        .container {
          height: 100%;
          transform-style: preserve-3d;
        }
  
        ::slotted(*) {
          position: absolute;
          top: 50%;
          transform-origin: center center;
        }

        button.next,
        button.previous {
          height: 100px;
          position: absolute;
          z-index: 1;
          right: 0;
          top: 0;
          bottom: 0;
          margin: auto;
          cursor: pointer;
          background: none;
          border: none;
        }

        button.next svg,
        button.previous svg {
          display: block;
          font-size: 60px;
          color: #fef570;
          filter: drop-shadow(-5px 3px 0 #B660F5);
          transition: transform 300ms ease-out, color 300ms ease-out;
        }

        @media(hover: hover) and (pointer: fine) {
          button.next:hover svg,
          button.previous:hover svg {
            transform: scale(1.3);
            color: #ffd300;
          }
        }

        button.previous {
          right: initial;
          left: 0;
        }

        button.previous svg {
          filter: drop-shadow(5px 3px 0 #B660F5);
        }
      </style>
      <div class="container">
        <button class="next">
          <svg fill="currentColor" stroke-width="0" viewBox="0 0 24 24" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M15.5 5H11l5 7-5 7h4.5l5-7z"></path><path d="M8.5 5H4l5 7-5 7h4.5l5-7z"></path></svg>
        </button>
        <button class="previous">
          <svg fill="currentColor" stroke-width="0" viewBox="0 0 12 12" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M4.5,9.5h2.2L4.2,6l2.5-3.5H4.5L2,6L4.5,9.5z"></path><path d="M8,9.5h2.2L7.8,6l2.5-3.5H8L5.5,6L8,9.5z"></path></svg>
        </button>
        <slot></slot>
      </div>
    `
    this._setupChildren()
    setTimeout(() =>
      ([...this.children]).forEach(c => this._resizeObserver.observe(c)),
    )
    this._intersectionObserver.observe(this)
    this.shadowRoot.querySelector('button.next').addEventListener(
      'click',
      () => this.next(),
    )
    this.shadowRoot.querySelector('button.previous').addEventListener(
      'click',
      () => this.previous(),
    )
  }

  _setupChildren() {
    const height = Math.max(...[...this.children].map(slide => slide.offsetHeight))
    this.style.height = height + 'px'
    ;([...this.children]).forEach((slide, i) => {
      slide.style.zIndex = -1 * i
    })
    this._render()
  }
}

customElements.define('far-out-carousel', FarOutCarousel)
