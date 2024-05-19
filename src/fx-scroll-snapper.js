// polyfill for 'scrollend' event
// import scrollyfills from 'https://cdn.jsdelivr.net/npm/scrollyfills@1.0.1/+esm'
 
/*
 *
 * TODO:
 *  - dot indicators
 */

class FxScrollSnapper extends HTMLElement {
  #thumbnailScrollResetTimeout
  #intersectionObserver 

  constructor() {
    super()
    this.attachShadow({ mode: 'open' });
    this.#intersectionObserver = new IntersectionObserver(this.#onIntersecion)
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          position: relative;
        }

        #default-next-button,
        #default-previous-button {
          font-size: 50px;
          cursor: pointer;
          position: absolute;
          top: 50%;
          translateY(-50%);
          z-index: 1;
        }

        #default-next-button {
          right: 0;
        }

      </style>
      <slot name="container"></slot>
      <slot name="next-button">
        <svg id="default-next-button" width="1em" height="1em" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" fill="currentColor"><path d="m456 1008c-12 0-24-4.8008-33.602-14.398-19.199-19.199-19.199-49.199 0-68.398l325.2-325.2-325.2-326.4c-19.199-19.199-19.199-49.199 0-68.398 19.199-19.199 49.199-19.199 68.398 0l360 360c9.6016 9.6016 14.398 21.602 14.398 33.602 0 13.199-4.8008 25.199-14.398 33.602l-360 360c-10.801 10.801-22.801 15.602-34.801 15.602z"/></svg>
      </slot>
      <slot name="previous-button">
        <svg id="default-previous-button" width="1em" height="1em" version="1.1" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" transform="scale(-1, 1)" fill="currentColor"><path d="m456 1008c-12 0-24-4.8008-33.602-14.398-19.199-19.199-19.199-49.199 0-68.398l325.2-325.2-325.2-326.4c-19.199-19.199-19.199-49.199 0-68.398 19.199-19.199 49.199-19.199 68.398 0l360 360c9.6016 9.6016 14.398 21.602 14.398 33.602 0 13.199-4.8008 25.199-14.398 33.602l-360 360c-10.801 10.801-22.801 15.602-34.801 15.602z"/></svg>
      </slot>
    `
    this.#intersectionObserver.observe(this)
    this.#containerSlot.addEventListener('scrollend', this.#onScrollEnd)
    this.#nextButton.addEventListener('click', this.#onClickNext)
    this.#previousButton.addEventListener('click', this.#onClickPrevious)
    setTimeout(() => this.#onScrollEnd())
  }

  get #containerSlot() {
    return this.querySelector('[slot="container"]')
  }

  get #nextButton() {
    return (
      this.querySelector('[slot="next-button"]') ||
      this.shadowRoot.querySelector('#default-next-button')
    )
  }

  get #previousButton() {
    return (
      this.querySelector('[slot="previous-button"]') ||
      this.shadowRoot.querySelector('#default-previous-button')
    )
  }

  get index() {
    const scrollLeft = this.#containerSlot.scrollLeft
    return Array.from(this.#containerSlot.children).findIndex(el => {
      return el.offsetLeft + el.clientWidth/2 + 2 >= scrollLeft + this.clientWidth/2
    })
  }

  set index(index) {
    const element = this.#containerSlot.children[index]
    const left = element.offsetLeft - window.innerWidth/2 + element.clientWidth/2
    // We must remove the scroll-snap temporarily or the scroll won't be
    // smooth :(
    this.#containerSlot.style.scrollSnapType = 'none'
    this.#containerSlot.scrollTo({ left, behavior: 'smooth' })
  }

  previous() {
    if (this.index <= 0) return
    this.index = this.index - 1
  }

  next() {
    if (this.index + 1 >= this.#containerSlot.children.length) return
    this.index = this.index + 1
  }

  #onScrollEnd = () => {
    this.#containerSlot.style.scrollSnapType = ''
    if (this.index + 1 >= this.#containerSlot.children.length) {
      this.#nextButton.setAttribute('disabled', '')
    } else {
      this.#nextButton.removeAttribute('disabled')
    }
    if (this.index <= 0) {
      this.#previousButton.setAttribute('disabled', '')
    } else {
      this.#previousButton.removeAttribute('disabled')
    }
  }

  #onClickNext = (event) => {
    event.preventDefault()
    this.next()
  }

  #onClickPrevious = (event) => {
    event.preventDefault()
    this.previous()
  }

  #onKeyDown = (event) => {
    if (event.key == 'ArrowRight') {
      event.preventDefault()
      this.next()
    } else if (event.key == 'ArrowLeft') {
      event.preventDefault()
      this.previous()
    }
  }

  #onIntersecion = ([entry]) => {
    if (entry.isIntersecting) {
      window.addEventListener('keydown', this.#onKeyDown)
      this.dispatchEvent(new CustomEvent('visible', {
        detail: { index: this._position }, bubbles: false
      }))
    } else {
      window.removeEventListener('keydown', this._keyHandler)
    }
  }
}

customElements.define('fx-scroll-snapper', FxScrollSnapper)
