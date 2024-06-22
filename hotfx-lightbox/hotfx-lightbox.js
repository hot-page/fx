document.addEventListener('click', event => {
  const el = event.target.closest('[hotfx-lightbox]')
  if (!el) return
  event.preventDefault()
  let lightbox = document.querySelector('hotfx-lightbox')
  if (!lightbox) {
    lightbox = document.createElement('hotfx-lightbox')
    document.querySelector('body').appendChild(lightbox)
    lightbox.addEventListener('close', () => lightbox.remove())
  }
  const elems = document.querySelectorAll('[hotfx-lightbox]')
  const index = Array.from(elems).indexOf(el)
  lightbox.show(index)
})

// Change the cursor on the images (or whatever) that makes up the lightbox
// so readers will know they can click to open the lightbox.
document.head.insertAdjacentHTML('beforeend', `
  <style>
    [hotfx-lightbox] {
      cursor: pointer;
    }
  </style>
`)

class HotFXLightbox extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.addEventListener('keydown', this.#handleKeyDown)
    this.#render()
  }
 
  connectedCallback() {
    this.#handleScroll()
  }

  show(index) {
    const dialog = this.shadowRoot.querySelector('dialog')
    dialog.classList.remove('closed')
    dialog.showModal()
    const content = this.shadowRoot.querySelector('#content')
    // for some reason scrollIntoView({ behavior: 'instant' }) doesn't work
    content.style.scrollBehavior = 'auto'
    content.children[index].scrollIntoView()
    content.style.scrollBehavior = ''
  }

  close() {
    const dialog = this.shadowRoot.querySelector('dialog')
    dialog.classList.add('closed')
    const closeForReal = () => {
      dialog.close()
      dialog.removeEventListener('animationend', closeForReal)
      this.dispatchEvent(new CustomEvent('close', { bubbles: true }))
    }
    dialog.addEventListener('animationend', closeForReal)
  }

  next() {
    const contentEl = this.shadowRoot.querySelector('#content')
    const contentRect = contentEl.getBoundingClientRect()
    Array.from(contentEl.children).find(el => {
      const rect = el.getBoundingClientRect()
      if (rect.left < contentRect.right) return
      el.scrollIntoView()
      return true
    })
  }

  previous() {
    const contentEl = this.shadowRoot.querySelector('#content')
    const contentRect = contentEl.getBoundingClientRect()
    Array.from(contentEl.children).reverse().find(el => {
      const rect = el.getBoundingClientRect()
      if (rect.right > contentRect.left) return
      el.scrollIntoView()
      return true
    })
  }

  #handleScroll = event => {
    const content = this.shadowRoot.querySelector('#content')
    if (content.scrollLeft <= 0) {
      this.shadowRoot.querySelector('#previous').setAttribute('disabled', '')
    } else {
      this.shadowRoot.querySelector('#previous').removeAttribute('disabled')
    }
    if (content.scrollLeft >= content.scrollWidth - window.innerWidth) {
      this.shadowRoot.querySelector('#next').setAttribute('disabled', '')
    } else {
      this.shadowRoot.querySelector('#next').removeAttribute('disabled')
    }
  }

  #handleKeyDown = event => {
    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault()
        this.next()
        break

      case 'ArrowLeft':
        event.preventDefault()
        this.previous()
        break

      case 'Escape':
        event.preventDefault()
        this.close()
        break
    }
  }

  #render() {
    this.shadowRoot.innerHTML = [`
      <style>
        * {
          box-sizing: border-box;       
        }

        dialog {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          outline: none;
          border: none;
          padding: 0;
          background: none;
          max-width: unset;
          max-height: unset;
          opacity: 0;
          animation: fade-in 400ms ease-out forwards;
        }

        dialog.closed {
          animation: fade-out 400ms ease-out forwards;
        }

        ::backdrop {
          display: none;
        }

        #backdrop {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0 0 0 / 60%);
          backdrop-filter: blur(3px);
          opacity: 0;
          animation: fade-in 400ms ease-out forwards;
          z-index: 2147483648;
        }

        dialog[open] + #backdrop {
          display: block;
        }

        dialog.closed + #backdrop {
          animation: fade-out 400ms ease-out forwards;
        }

        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }

        button {
          background: none;
          border: none;
        }

        button[disabled] {
          pointer-events: none;
          opacity: 50%;
        }

        svg {
          display: block;
        }

        #close {
          position: fixed;
          top: 1rem;
          right: 1rem;
          cursor: pointer;
          color: rgba(255 255 255 / 70%);
          font-size: 3rem;
        }

        #close:hover {
          color: rgba(255 255 255 / 100%);
        }

        #content {
          display: flex;
          flex-flow: row nowrap;
          width: 100%;
          height: 100%;
          overflow-y: clip;
          overflow-x: scroll;
          scroll-snap-type: x mandatory;
          scroll-behavior: smooth;
          overscroll-behavior: contain;
          scrollbar-width: none; 
        }

        #content::-webkit-scrollbar { 
          display: none;
        }

        .slide-wrapper {
          flex: 0 0 100%;
          height: 100%;
          scroll-snap-stop: always;
          scroll-snap-align: center;
          display: flex;
          flex-flow: column nowrap;
          justify-content: center;
          align-items: center;
        }

        .slide-wrapper > * {
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 100%;
        }

        #next, #previous {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          font-size: 3rem;
          cursor: pointer;
          display: flex;
          flex-flow: column nowrap;
          justify-content: center;
          color: rgba(255 255 255 / 70%);
        }

        #next svg, #previous svg {
          display: block;
        }

        #previous {
          left: 1rem;
        }

        #next {
          right: 1rem;
        }

        #next:hover, #previous:hover {
          color: rgba(255 255 255 / 100%);
        }
      </style>
      <dialog>
        <button id="close" part="close">
          <slot name="close">
            <svg width="1em" height="1em" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="m671.25 600 203.75-203.75c20-20 20-51.25 0-71.25s-51.25-20-71.25 0l-203.75 203.75-203.75-202.5c-20-20-51.25-20-71.25 0s-20 51.25 0 71.25l203.75 202.5-202.5 203.75c-20 20-20 51.25 0 71.25 10 10 22.5 15 35 15s25-5 35-15l203.75-203.75 203.75 203.75c10 10 22.5 15 35 15s25-5 35-15c20-20 20-51.25 0-71.25z"/>
            </svg>
          </slot>
        </button>
        <button id="previous" part="previous">
          <slot name="previous">
            <svg width="1em" height="1em" version="1.1" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" fill="currentColor" transform="scale(-1, 1)">
             <path d="m456 1008c-12 0-24-4.8008-33.602-14.398-19.199-19.199-19.199-49.199 0-68.398l325.2-325.2-325.2-326.4c-19.199-19.199-19.199-49.199 0-68.398 19.199-19.199 49.199-19.199 68.398 0l360 360c9.6016 9.6016 14.398 21.602 14.398 33.602 0 13.199-4.8008 25.199-14.398 33.602l-360 360c-10.801 10.801-22.801 15.602-34.801 15.602z"/>
            </svg>
          </slot>
        </button>
        <div id="content">`,
          Array.from(document.querySelectorAll('[hotfx-lightbox]'))
             .map(el => {
               el = el.cloneNode()
               el.setAttribute('part', 'slide')
               return `<div class="slide-wrapper">${el.outerHTML}</div>`
             })
             .join(''),
        `</div>
        <button id="next" part="next">
          <slot name="next">
            <svg width="1em" height="1em" version="1.1" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
             <path d="m456 1008c-12 0-24-4.8008-33.602-14.398-19.199-19.199-19.199-49.199 0-68.398l325.2-325.2-325.2-326.4c-19.199-19.199-19.199-49.199 0-68.398 19.199-19.199 49.199-19.199 68.398 0l360 360c9.6016 9.6016 14.398 21.602 14.398 33.602 0 13.199-4.8008 25.199-14.398 33.602l-360 360c-10.801 10.801-22.801 15.602-34.801 15.602z"/>
            </svg>
          </slot>
        </button>
      </dialog>
      <div id="backdrop" part="backdrop"></div>`
    ].join('')
    this
      .shadowRoot
      .querySelector('#close')
      .addEventListener('click', () => this.close())
    this
      .shadowRoot
      .querySelector('#next')
      .addEventListener('click', () => this.next())
    this
      .shadowRoot
      .querySelector('#previous')
      .addEventListener('click', () => this.previous())
    this
      .shadowRoot
      .querySelector('#content')
      .addEventListener('scroll', this.#handleScroll)
  }
}

customElements.define('hotfx-lightbox', HotFXLightbox)
