// All of the logic and DOM structure for the menu is handled in this
// class. Extending `HTMLElement` let's us define a custom element to use
// anywherew in HTML.
class HotFXResponsiveMenu extends HTMLElement {
  // The `width` attribute is used to control the breakpoint where the menu
  // will switch from showing the menu items in a row to moving them to the
  // drawer. This is the width of the browser window where the change will be
  // made, set with a media query with `max-width`.
  static observedAttributes = ["width"];
  // If no `width` attribute is set, the element will use 800 pixels as the
  // default breakpoint.
  static #defaultWidth = '800'
  // The element's media query, which will trigger it to re-render itself when
  // the browser width crosses the breakpoint.
  #mediaQuery

  constructor() {
    super()

    // Call an internal function to create the #mediaQuery which listens for
    // our breakpoint.
    this.#createMediaQuery()

    // The `keydown` handler is for hitting the <kbd>Esc</kbd> key to close the
    // menu.
    this.addEventListener('keydown', this.#handleKeyDown)

    // Create the shadow DOM and render our component there, slotting in the 
    // links or other content that the user has provided as light DOM.
    this.attachShadow({ mode: 'open' })
    this.#render()
  }
 
  // When the `width` attribute is changed we need to recreate
  // `this.#mediaQuery` so that it responds at the new breakpoint.
  attributeChangedCallback() {
    this.#createMediaQuery()
  }

  // Our `hashchange` listener will close the menu when navigating internal links.
  connectedCallback() {
    window.addEventListener('hashchange', this.#handleHashChange)
  }

  // Removes the `hashchange` listener when disconnected from the DOM so that we
  // don't leak memory all over the place and create a big mess on the reader's 
  // lap.
  disconnectedCallback() {
    window.removeEventListener('hashchange', this.#handleHashChange)
  }

  // The `.open()` public method that allows you to imperatively open or close
  // the menu, perhaps with another button besides the hamburger icon. Use it
  // like this:
  //
  // ````javascript
  // document.querySelector('hotfx-responsive-menu').open()
  // ````
  open() {
    // If the menu is not in the drawer state, we had better do nothing because
    // there are side effects here that will be quite bad otherwise --
    // especially preventing all scrolling of the page.
    if (!this.#mediaQuery.matches) return
    // Set the `open` attribute which is used internally for styling
    this.setAttribute('open', '')
    // We prevent scrolling of the entire page while the menu is open. It might
    // have been nice to use the `overscroll-behavior` but it wasn't working to
    // prevent scrolling on the #backdrop element.
    document.body.style.overflow = 'hidden'
    // The `aria-expanded` attribute on the drawer indicates to screen readers
    // that the `<nav>` is visible.
    this.shadowRoot.querySelector('nav').setAttribute('aria-expanded', 'true')
  }

  // The `.close()` method will imperatively close the menu. You could use this,
  // for example, to add another button to the menu itself to close it. So
  // something like this:
  //
  // ````html
  // <button onClick="this.closest('hotfx-responsive-menu').close()">
  //   Close
  // </button>
  // ````
  close() {
    // Remove the `open` attribute is what will trigger the transition closing 
    // the drawer in CSS.
    this.removeAttribute('open')
    // Removes the scrolling lock that we added to the `<body>` in `open()`.
    document.body.style.overflow = ''
    // Resets the `aria-expanded` attribute on our `<nav>` element.
    this.shadowRoot.querySelector('nav').setAttribute('aria-expanded', 'false')
  }

  // Another imperative handle that toggles the state of the menu from open to
  // closed or closed to open. This is used internally as the click handler on
  // the button because the same button both opens and closes the menu.
  toggle() {
    this.hasAttribute('open') ? this.close() : this.open()
  }

  // Here we create `this.#mediaQuery` which makes the menu respond as the
  // browser width crosses the breakpoint.
  #createMediaQuery() {
    // First clean up the existing event listener if it exists. This method is
    // called everytime the `width` attribute is changed so we have to cleanup
    // or we'll leak memory.
    this.#mediaQuery?.removeEventListener('change', this.#handleChangeMedia)
    // We validate that the `width` attribute is a positive integer before using
    // it or the media query might be invalid and the menu will never turn into a
    // drawer.
    const widthAttributeIsValid = this.hasAttribute('width') && !/\D/.test(this.getAttribute('width'))
    if (this.hasAttribute('width') && !widthAttributeIsValid) {
      console.error(`
        The <hotfx-responsive-menu> element received an invalid value for the \
        width attribute. "${this.getAttribute('width')}" is not a valid number. The \
        default value (${HotFXResponsiveMenu.#defaultWidth}) will be used instead.`
        // This `replace()` just cleans up the whitespace in the message
        .replace(/\s+/g, ' '),
      )
    }
    const width = widthAttributeIsValid
      ? this.getAttribute('width')
      : HotFXResponsiveMenu.#defaultWidth
    this.#mediaQuery = window.matchMedia(`(max-width: ${width}px)`)
    // Listening to the `change` event will fire our handler when the browser's
    // width has crossed the breakpoint, allowing us to re-render
    this.#mediaQuery.addEventListener('change', this.#handleChangeMedia)
  }

  // The handler for the media query breakpoint that we set in the line above.
  #handleChangeMedia = (event) => {
    // The drawer might be open right now, which means that we must call
    // `close()` before re-rendering everything as a static menu. In the
    // `open()` method we prevent scrolling on the body, so if we don't call
    // this to reverse it, the user will not be able to scroll the page at all!
    if (!event.target.matches) this.close()
    // Either way, we must re-render the component's DOM structure to respond
    // to the change in the breakpoint
    this.#render()
  }

  // The `hashchange` event signals a navigation to a link internal to the page.
  // Since the user has clicked a link in the menu, we close it so since they're
  // likely done using it and want to see the content for the link they've cliked
  // on.
  #handleHashChange = () => this.close()

  // This `keydown` handler will only be fired if the focus is inside the menu,
  // but that's actually fairly likely given that they just used the button to
  // open the menu.
  #handleKeyDown = (event) => {
    if (event.key == 'Escape') this.close()
  }

  // The component's DOM has two completely different structures based on the
  // breakpoint. Here we render one or the other to our `shadowRoot`.
  #render() {
    // If the `max-width` media query is not matched, then the layout for this
    // element is really quite simple. The hamburger is not shown and the menu
    // items should be always visible so this is really just a passthrough. It
    // might not even need shadow DOM at all but we need it in the other state.
    if (!this.#mediaQuery.matches) {
      // Setting the state attribute lets the user style links or other menu
      // light DOM content in a different way when it is static or slotted into
      // the drawer. Use them like this:
      //
      // ````css
      // hotfx-responsive-menu[state="static"] a {
      //   color: cornflowerblue;
      // }
      // ````
      this.setAttribute('state', 'static')
      this.shadowRoot.innerHTML = [`
        <style>
          :host {
            display: block;
          }`,
          // Flexbox is pretty much the perfect way to layout options for a
          // static.
          `nav {
            display: flex;
            gap: 32px;
          }
        </style>`,
        // Here we add `part="static"` to allow styling of the menu itself
        // in it's non-drawer state with `:part(static)`. The user may wish to
        // override the `gap` property set above.
        `<nav part="static" aria-label="Site navigation">
          <slot></slot>
        </nav>
      `].join('')
    } else {
      // Set the state to drawer
      this.setAttribute('state', 'drawer')
      // Here we render the menu whith our hamburger icon and the drawer that 
      // pops in from the side. This is the where the real meat of the
      // component takes shape.
      this.shadowRoot.innerHTML = [`
        <style>
          :host {
            display: flex;
            flex-flow: row nowrap;
            justify-content: flex-end;
          }`,
          // Our hamburger icon uses the HTML `<button>` element so that it 
          // properly handles focus, keyboard commands and accessibility.
          // However, this element brings a lot of default styling so we've got
          // to clean it up back to nothing basically.
          `button {
            border: none;
            padding: 0;
            background: none;
            cursor: pointer;
            position: relative;
            z-index: 5;
          }`,
          // Setting the stroke to currentColor let's the user change the color
          // of the menu with the CSS `color` property.
          `button svg {
            display: block;
            width: 2rem;
            stroke: currentColor;
            stroke-width: .6;
            fill: rgba(0,0,0,0);
            stroke-linecap: round;
          }`,
          // The hamburger icon is from [a CodePen by Owen Shepherd](https://codepen.io/shephero/pen/LYVrdjX) -- thank you, Owen!
          //
          // Changing the `d` attribute here in CSS does the cool morph thing
          // using `transition`.
          `button path {
            transition: d 300ms ease-out;
          }
          `,
          // Note that in order for this morph effect to work the path must
          // have the same number of anchor points and they must be of the 
          // same type.
          `:host([open]) button path {
            d: path('M3,3L5,5L7,3M5,5L5,5M3,7L5,5L7,7');
          }`,
          // Here we style the drawer as a `position: fixed` element. It also
          // sets up a Flexbox column so that links, which are inline by default,
          // are shown vertically. The default padding and background color
          // are easily overidden by the user.
          `nav {
            position: fixed;
            top: 0;
            right: 0;
            height: 100vh;
            transition: transform 300ms ease-out;
            transform: translateX(100%);
            display: flex;
            flex-flow: column nowrap;
            z-index: 4;
            gap: 8px;
            padding: 64px 32px 32px 32px;
            background: white;
          }`,
          // This CSS rule with three properties is the only thing needed to
          // move the drawer to left side when you set the
          // `position=left` attribute.
          `:host([position="left"]) nav {
            left: 0;
            right: initial;
            transform: translateX(-100%);
          }

          :host([open]) nav {
            transform: none;
          }`,
          // The backdrop appears behind the drawer while it's open to obscure
          // the page. It's a translucent black color by default.
          `#backdrop {
            position: fixed;
            inset: 0;
            visibility: hidden;
            opacity: 0;
            background: rgba(0 0 0 / 70%);`,
            // Note that the transition on visibility basically functions as a
            // delay which keeps the menu visibile until the end of the 300ms
            `transition: opacity 300ms ease-out, visibility 300ms;
          }

          :host([open]) #backdrop {
            visibility: visible;
            opacity: 1;
          }
        </style>`,
        // Our hamburger button can be replaced by an element in light DOM with
        // `slot=icon`, letting the user add their own icon. The `part=` attribute
        // let them style the button itself using CSS with the `::part(button)`
        // selector.
        `<button part="button">
          <slot name="icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 10 10">
              <path d="M2,3L5,3L8,3M2,5L8,5M2,7L5,7L8,7" />
            </svg>
          </slot>
        </button>`,
        // You can style the drawer using the `::part(drawer)` selector.
        `<nav part="drawer" aria-label="Site navigation" aria-expanded="false">
          <slot></slot>
        </nav>`,
        // Finally, use `::part(backdrop)` to style the grey background that
        // appears
        `<div part="backdrop" id="backdrop"></div>`,
      ].join('')
      // The same hamburger button turns into an X and will toggle the menu
      // open or closed.
      this
        .shadowRoot
        .querySelector('button')
        .addEventListener('click', () => this.toggle())
      // Add an event handler to the backdrop will close the menu.
      this
        .shadowRoot
        .querySelector('#backdrop')
        .addEventListener('click', () => this.close())
    }
  }
}

// Registering the above class as a custom element let's us use it in HTML,
// like `<hotfx-responsive-menu>`
customElements.define('hotfx-responsive-menu', HotFXResponsiveMenu)
