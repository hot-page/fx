// This is the selector for lightbox images that will be used if there isn't
// one supplied explicitly with the `selector` attribute.
const defaultSelector = '[hotfx-lightbox-slide]'

// This script is designed to be zero configuration by default, so here we add
// a click handler onto the document that will create a lightbox element even
// if there isn't one specifically added to the page.
document.addEventListener('click', event => {
  // This is using event delegation so it will be called for every click. If this wasn't a click inside one of our elements, just ignore it by returning early
  const el = event.target.closest(defaultSelector)
  if (!el) return
  // If there already is a lightbox, similarly abort early because the element will add it's own click handler according to the user's configuration.
  let lightbox = document.querySelector('hotfx-lightbox')
  if (lightbox) return
  // Prevent default prevents selection or other unintended effects.
  event.preventDefault()
  // Create a new lightbox element and add it to the document.
  lightbox = document.createElement('hotfx-lightbox')
  document.body.appendChild(lightbox)
  // We clean up by removing the lightbox as soon as it's closed.
  lightbox.addEventListener('close', () => lightbox.remove())
  // To show the image that was clicked, we use it's index in document order.
  const elems = document.querySelectorAll(defaultSelector)
  const index = Array.from(elems).indexOf(el)
  lightbox.show(index)
})

// Change the cursor on the images that makes up the lightbox so readers will
// know they can click to open the lightbox.
document.head.insertAdjacentHTML('beforeend', `
  <style>
    ${defaultSelector} {
      cursor: pointer;
    }
  </style>
`)

// The logic for our lightbox is encapsulated in a custom HTML element to
// provide separation from document styles and life cycle.
class HotFXLightbox extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    // This key handler requires that keyboard focus is inside the element but
    // since we're using the <dialog> event that's not a problem.
    this.addEventListener('keydown', this.#handleKeyDown)
    this.#render()
  }
 
  // As discussed above, we set a click handler on the whole document so that
  // we can listen to clicks on images that are included in the lightbox. Best
  // practices for custom elements set these global listeners in
  // `connectedCallback()` so that they can be cleaned up.
  connectedCallback() {
    document.addEventListener('click', this.#handleDocumentClick)
  }

  // Clean up the click event handler or memory will leak all over the place
  // and your mom will be very upset.
  disconnectedCallback() {
    document.removeEventListener('click',this.#handleDocumentClick)
  }

  // The show() method will open the lightbox and the supplied index is the 
  // image that will be shown. These are added in document order and our click
  // handler looks for the same.
  show(index) {
    // We re-render the images in the lightbox now so that they are in sync
    // with the images in the document.
    this.#renderContent()
    // The lightbox is a wrapper on the native <dialog> element, which has
    // magical powers of placing itself in the page's "top layer" which appears
    // above everything else, even `z-index: 1 million`.
    const dialog = this.shadowRoot.querySelector('dialog')
    dialog.showModal()
    // To show the right image, we need to scroll the content div to the right
    // position. The normal transitions are built using the native smooth
    // scroll and in order to scroll without that we must first disable it. For
    // some reason `scrollIntoView({ behavior: 'instant' })` doesn't work.
    const content = this.shadowRoot.querySelector('#content')
    content.style.scrollBehavior = 'auto'
    if (typeof index == 'number') content.children[index].scrollIntoView()
    // We need to call this explicitly because there's a bug when you click the
    // first image and since the content div never gets scrolled, the handler
    // never gets called and both buttons are disabled.
    this.#handleScroll()
    // This will enable smooth scrolling again by removing the declaration above.
    content.style.scrollBehavior = ''
    // This disables scrolling of the page underneath the lightbox.
    document.body.style.overflow = 'hidden'
    // Focus the next button once this is open. If we don't do this often the 
    // previous button will be focused becuase it's the first one in DOM order.
    setTimeout(() => this.shadowRoot.querySelector('#next').focus())
  }

  // `close()` will close the lightbox. This method can be called imperatively
  // and it's used in our own click handlers.
  close() {
    // This enables scrolling of the page again.
    document.body.style.overflow = ''
    // Instead of calling `dialog.close()` immediately, we first add the `closed`
    // class and wait for the animation to finish so that there's a nice
    // transition.
    const dialog = this.shadowRoot.querySelector('dialog')
    dialog.classList.add('closed')
    // `closeForReal()` is the function that will actually remove the dialog 
    // once it has visually disappeared.
    const closeForReal = () => {
      // This is what actually removes the dialog from view.
      dialog.close()
      // Clean up the closed class so that we can show the lightbox again.
      dialog.classList.remove('closed')
      // Clean up this very event listener so that it's not set over and over
      // again.
      dialog.removeEventListener('animationend', closeForReal)
      // Triggers a 'closed' event that bubbles up from this custom element.
      // This event is used in our zero-config click handler (shown above this
      // class at the top of the file).
      this.dispatchEvent(new CustomEvent('close', { bubbles: true }))
    }
    // The `animationend` event signals that the dialog has visually disappeared
    // from the window and we can run the function above that does it "for real."
    dialog.addEventListener('animationend', closeForReal)
  }

  // `next()` shows the next image in the lightbox.
  next() {
    // This is a functional way to loop through the slides that are in the
    // lightbox. We are looking for the first one that is offscreen to the
    // right, i.e. has the position of its left side greater than the width of
    // the window.
    Array
      .from(this.shadowRoot.querySelector('#content').children)
      .find(el => el.getBoundingClientRect().left >= window.innerWidth)
      ?.scrollIntoView()
  }

  // `previous()` shows the previous image in the lightbox.
  previous() {
    // Here we loop through the slides backwards, i.e. from right to left. We
    // are looking for the first one that is offscreen to the left, i.e. has
    // the position of its right side in a negative value.
    Array
      .from(this.shadowRoot.querySelector('#content').children)
      .reverse()
      .find(el => el.getBoundingClientRect().right <= 0)
      ?.scrollIntoView()
  }

  // This is the selector for the DOM elements that will be copied into the
  // lightbox. This looks at the attribute and if it's not set, returns the
  // default value set in the first line of this file.
  get #selector() {
    return this.getAttribute('selector') || defaultSelector
  }

  // Our document-leven click handler that uses event delegation to 
  #handleDocumentClick = event => {
    // `event.target` is the DOM element that was clicked and `closest()` allows
    // us to see if the element or one of it's parent elements matches the
    // selector for our slides.
    const el = event.target.closest(this.#selector)
    // If there's no match, return early to do nothing.
    if (!el) return
    // `preventDefault()` will keep the browser from selecting things which
    // can happen when the reader double clicks.
    event.preventDefault()
    // In order to open the lightbox on the correct image, we need to find its
    // index in the list of all the images that will be included in this
    // lightbox.
    const elems = document.querySelectorAll(this.#selector)
    const index = Array.from(elems).indexOf(el)
    // Finally, call `show()` to open the lightbox.
    this.show(index)
  }

  // A scroll handler that will add a `disabled` attribute to our next and
  // previous buttons when we reach the end and start of the lightbox slides,
  // respectively. This can be changed for `scrollend` event once the
  // [browser support](https://caniuse.com/mdn-api_element_scrollend_event)
  // for it improves.
  #handleScroll = () => {
    const content = this.shadowRoot.querySelector('#content')
    // Disables the prevoious button when content container is at the start.
    // Otherwise, make sure it's enabled.
    if (content.scrollLeft <= 0) {
      this.shadowRoot.querySelector('#previous').setAttribute('disabled', '')
    } else {
      this.shadowRoot.querySelector('#previous').removeAttribute('disabled')
    }
    // Disables the next button when content container is already scrolled to
    // the end.
    if (content.scrollLeft >= content.scrollWidth - window.innerWidth) {
      this.shadowRoot.querySelector('#next').setAttribute('disabled', '')
    } else {
      this.shadowRoot.querySelector('#next').removeAttribute('disabled')
    }
  }

  // This function enables navigation of the lightbox with arrow keys and
  // <kbd>Esc</kbd> to close it. Since this handler is hooked to this element,
  // we don't need to check if the lightbox is open or not. If it's not open,
  // this handler will never be triggered.
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

  // Our render method builds the shadow DOM of our element.
  #render() {
    this.shadowRoot.innerHTML = [`
      <style>`,
        // `box-sizing: border-box;` is a much saner way to think about
        // element sizes.
        `* {
          box-sizing: border-box;       
        }`,
        // The `<dialog>` element is the base of this component and provides
        // great fucntionality out of the box: access to the top layer, focus
        // traps, and accesibility. However, we'll need to change it's default
        // styling.
        `dialog {
          position: fixed;
          inset: 0;
          width: 100%;
          height: 100%;
          max-width: unset;
          max-height: unset;
          outline: none;
          border: none;
          padding: 0;
          background: none;
          opacity: 0;
          animation: fade-in 400ms ease-out forwards;
        }

        dialog.closed {
          animation: fade-out 400ms ease-out forwards;
        }`,
        // The `::backdrop` pseudo element will not be styleable by the user
        // because it's impossible to get a selector on it outside of the
        // shadow DOM.
        `::backdrop {
          display: none;
        }`,
        // We instead create our own backdrop element. It is shown when the 
        // dialog opens and fades out when it cloes.
        `#backdrop {
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
        }`,
        // These basic opacity animations are all the user is going to get for
        // now because adding more complex animations to these elements doesn't
        // appear possible. Although the user can select these elements with the
        // `::part()` pseudo elements, it appears that `keyframes` rules need
        // to be present within the shadow DOM.
        `@keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fade-out {
          from { opacity: 1; }
          to { opacity: 0; }
        }`,
        // The `button` selector includes all three of the lightbox buttons:
        // close, next and previous. Our buttons include icons with SVGs that
        // use `fill=currentColor`, we can change their color in CSS with the
        // `color` property. Also the width and height of the icons are set to
        // `1em` so their size can be controlled with `font-size`. All of these
        // properties can be changed on your page using the `::part()` pseudo
        // elements for the buttons.
        `button {
          position: fixed;
          background: none;
          border: none;
          padding: 0.2em;
          font-size: 3rem;
          color: rgba(255 255 255 / 70%);
          cursor: pointer;
        }

        button:hover {
          color: rgba(255 255 255 / 100%);
        }

        button:focus-visible {
          outline-color: rgba(255 255 255 / 60%);
        }

        button[disabled] {
          pointer-events: none;
          opacity: 50%;
        }

        #close {
          top: 1rem;
          right: 1rem;
        }

        #next, #previous {
          top: 50%;
          transform: translateY(-50%);
        }

        #previous {
          left: 1rem;
        }

        #next {
          right: 1rem;
        }`,
        // All three buttons use SVGs for their icons but SVGs are inline by
        // default and won't be centered inside the buttons that way.
        `svg {
          display: block;
        }`,
        // Our main content well is the container that includes all of the 
        // slides. Mandatory scroll snaps save us a <em>tonnnn</em> of logic
        // handling touch events in JavaScript.
        `#content {
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
        }`,
        // These rules make each slide take up the full width and height of the
        // browser window, with their content centered inside of them.
        `.slide-wrapper {
          flex: 0 0 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          scroll-snap-stop: always;
          scroll-snap-align: center;
        }`,
        // These rules will show images at their largest size without cropping
        // them, distorting them or scaling them up.
        `.slide-wrapper > * {
          width: auto;
          height: auto;
          max-width: 100%;
          max-height: 100%;
        }
      </style>`,
      // Our DOM conent consists of the three buttons and a well for the
      // content to be added later
      `<dialog role="region" aria-roledescription="carousel" aria-label="Image lightbox">
        <button id="previous" part="previous" aria-label="Previous">
          <slot name="previous">
            <svg width="1em" height="1em" version="1.1" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" fill="currentColor" transform="scale(-1, 1)">
             <path d="m456 1008c-12 0-24-4.8008-33.602-14.398-19.199-19.199-19.199-49.199 0-68.398l325.2-325.2-325.2-326.4c-19.199-19.199-19.199-49.199 0-68.398 19.199-19.199 49.199-19.199 68.398 0l360 360c9.6016 9.6016 14.398 21.602 14.398 33.602 0 13.199-4.8008 25.199-14.398 33.602l-360 360c-10.801 10.801-22.801 15.602-34.801 15.602z"/>
            </svg>
          </slot>
        </button>
        <div id="content"></div>
        <button id="next" part="next" aria-label="Previous">
          <slot name="next">
            <svg width="1em" height="1em" version="1.1" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
             <path d="m456 1008c-12 0-24-4.8008-33.602-14.398-19.199-19.199-19.199-49.199 0-68.398l325.2-325.2-325.2-326.4c-19.199-19.199-19.199-49.199 0-68.398 19.199-19.199 49.199-19.199 68.398 0l360 360c9.6016 9.6016 14.398 21.602 14.398 33.602 0 13.199-4.8008 25.199-14.398 33.602l-360 360c-10.801 10.801-22.801 15.602-34.801 15.602z"/>
            </svg>
          </slot>
        </button>
        <button id="close" part="close" aria-label="Close">
          <slot name="close">
            <svg width="1em" height="1em" viewBox="0 0 1200 1200" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
              <path d="m671.25 600 203.75-203.75c20-20 20-51.25 0-71.25s-51.25-20-71.25 0l-203.75 203.75-203.75-202.5c-20-20-51.25-20-71.25 0s-20 51.25 0 71.25l203.75 202.5-202.5 203.75c-20 20-20 51.25 0 71.25 10 10 22.5 15 35 15s25-5 35-15l203.75-203.75 203.75 203.75c10 10 22.5 15 35 15s25-5 35-15c20-20 20-51.25 0-71.25z"/>
            </svg>
          </slot>
        </button>
      </dialog>
      <div id="backdrop" part="backdrop"></div>`
    ].join('')
    // Now that the shadow DOM is built, we can add click handlers to our
    // buttons and the scroll handler to the content well.
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

  // This function renders the lightbox slides. This is a separate function so
  // that it can update the lightbox content each time it opens. Here we are
  // copying the DOM elements from the document into the shadow DOM.
  #renderContent() {
    this.shadowRoot.querySelector('#content').innerHTML = 
      // An array of the targetted elements let's us run the same process for
      // eacy of them.
      Array.from(document.querySelectorAll(this.#selector))
         .map(el => {
           // First deeply clone the node so we aren't messing up the page's
           // actual DOM.
           el = el.cloneNode(true)
           // We set a `part=slide` attribute on the element to allow the user
           // to customize 
           el.setAttribute('part', 'slide')
           // The most common use for the lightbox is images that are highly
           // detailed and thus can be quite large and perhaps slow to download.
           // Here we make a few optimizations for them.
           if (el.tagName == 'IMG') {
             // The web page author may have set a sizes attribute so that the
             // browser doesn't load a huge version of the image to show in a small
             // gallery. Since images in the lightbox will be shown at full-window
             // width and height, we remove the attribute so that the browser can
             // pick a higher quality image.
             el.removeAttribute('sizes')
             // We also add the `loading=lazy` attribute to images so that the
             // first one to appear loads faster.
             el.setAttribute('loading','lazy')
           }
           // Finally wrap the slide in another element that we can use to
           // make these full-width and full-height with the content centered.
           return `
             <div class="slide-wrapper" role="group" aria-roledescription="slide">
               ${el.outerHTML}
             </div>`
         })
         .join('')
  }

}

// Registering the lightbox as a custom element let's the user add it to the
// page explicitly as `<hotfx-lightbox>` in order to cutomize attributes or
// change the icons with slots.
customElements.define('hotfx-lightbox', HotFXLightbox)
