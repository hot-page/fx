class HotPageSnippet extends HTMLElement {

  constructor() {
    super()
    this.addEventListener('pointerdown', this.#handlePointerDown)
    this.addEventListener('pointermove', this.#handlePointerMove)
    this.addEventListener('pointerup', this.#handlePointerUp)
    this.style.cursor = 'grab'
    this.innerHTML = `<svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 24 24" class="sc-iRpAgA dREbnZ" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path fill="none" d="M0 0h24v24H0z"></path><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0 6h4v-4h-4v4z"></path></svg>`
  }

  #handlePointerDown = event => {
    event.preventDefault()
    this.setPointerCapture(event.pointerId);
    window.top?.postMessage({
      name: 'dragStart',
      dataTransfer: {
        'text/html': document.querySelector(this.getAttribute('target')).outerHTML,
      }
    }, '*')
  }

  #handlePointerMove = event => {
    window.top?.postMessage({
      name: 'dragMove',
      x: event.clientX,
      y: event.clientY,
    }, '*')
  }

  #handlePointerUp = event => {
    window.top?.postMessage({
      name: 'dragEnd',
      x: event.clientX,
      y: event.clientY,
      dataTransfer: {
        'text/html': document.querySelector(this.getAttribute('target')).outerHTML,
      }
    }, '*')
  }

}

customElements.define('hot-page-snippet', HotPageSnippet)
