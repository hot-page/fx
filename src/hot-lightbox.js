/*
 *
 * TODO:
 *  - dot indicators
 *  - updates the list of images if one is added or removed from the DOM
 *  - something like an animation that indicates that you cant scroll past the end
 *  - or it hides the button when youre at the end? or somehow shows it as disabled?
 */

document.head.insertAdjacentHTML('afterbegin', `
  <style>
    [hot-lightbox] {
      cursor: pointer;
    }
  </style>
`)

document.addEventListener('click', event => {
  const el = event.target.closest('[hot-lightbox]')
  if (!el) return
  event.preventDefault()
  const lightbox = document.querySelector('hot-lightbox')
  const elems = document.querySelectorAll('[hot-lightbox]')
  const index = Array.from(elems).indexOf(el)
  lightbox.show(index)
})

class HotLightbox extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' });
  }
 
  connectedCallback() {
    this.#render()
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
    const close = () => {
      dialog.close()
      dialog.removeEventListener('animationend', close)
    }
    dialog.addEventListener('animationend', close)
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

  #render() {
    this.shadowRoot.innerHTML = `
      <link rel="stylesheet" href="${import.meta.url}/../hot-lightbox.css">
      <dialog>
        <div id="close">
          <svg width="1em" height="1em" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
            <path d="m671.25 600 203.75-203.75c20-20 20-51.25 0-71.25s-51.25-20-71.25 0l-203.75 203.75-203.75-202.5c-20-20-51.25-20-71.25 0s-20 51.25 0 71.25l203.75 202.5-202.5 203.75c-20 20-20 51.25 0 71.25 10 10 22.5 15 35 15s25-5 35-15l203.75-203.75 203.75 203.75c10 10 22.5 15 35 15s25-5 35-15c20-20 20-51.25 0-71.25z"/>
          </svg>
        </div>
        <div id="previous">
          <slot name="previous-button">
            <svg width="1em" height="1em" version="1.1" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" fill="currentColor" transform="scale(-1, 1)">
             <path d="m456 1008c-12 0-24-4.8008-33.602-14.398-19.199-19.199-19.199-49.199 0-68.398l325.2-325.2-325.2-326.4c-19.199-19.199-19.199-49.199 0-68.398 19.199-19.199 49.199-19.199 68.398 0l360 360c9.6016 9.6016 14.398 21.602 14.398 33.602 0 13.199-4.8008 25.199-14.398 33.602l-360 360c-10.801 10.801-22.801 15.602-34.801 15.602z"/>
            </svg>
          </slot>
        </div>
        <div id="content"></div>
        <div id="next">
          <slot name="next-button">
            <svg width="1em" height="1em" version="1.1" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
             <path d="m456 1008c-12 0-24-4.8008-33.602-14.398-19.199-19.199-19.199-49.199 0-68.398l325.2-325.2-325.2-326.4c-19.199-19.199-19.199-49.199 0-68.398 19.199-19.199 49.199-19.199 68.398 0l360 360c9.6016 9.6016 14.398 21.602 14.398 33.602 0 13.199-4.8008 25.199-14.398 33.602l-360 360c-10.801 10.801-22.801 15.602-34.801 15.602z"/>
            </svg>
          </slot>
        </div>
      </dialog>
    `
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
    this.shadowRoot.querySelector('#content').innerHTML = Array
      .from(document.querySelectorAll('[hot-lightbox]'))
      .map(el => `<div class="slide-wrapper">${el.outerHTML}</div>`)
      .join('')
  }
}

customElements.define('hot-lightbox', HotLightbox)
