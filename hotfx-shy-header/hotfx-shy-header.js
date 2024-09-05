// Since this component doesn't use a shadow DOM, we need to add these basic
// styles directly to the document. This creates a [constructable style
// sheet](https://web.dev/articles/constructable-stylesheets) which provides a
// number of advantages over the typical method of appending `<style>` tags.
// The performance consideration for such a small component are negligble but
// this technique will also make it work with a restrictive Content Security
// Policies.
const sheet = new CSSStyleSheet()
sheet.replace(`
  hotfx-shy-header {
    display: flex;
    position: sticky;
    top: 0;
    transition: transform 0.3s ease-out;
  }

  hotfx-shy-header.hidden {
    transform: translateY(-100%);
  }
`)
document.adoptedStyleSheets.push(sheet)

// This is a custom HTML element so we must extend the `HTMLElement` class.
class HotFXShyHeader extends HTMLElement {
  // These are internal variables so they are defined as [private
  // properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties) with a pound sign, making them inaccessible from the DOM.
  //
  // `#lastScroll` keeps track of the page's scroll depth right before the
  // scroll event is fired, so we know which direction we're moving.
  #lastScroll = 0
  // `#lastMaxScroll` is the deepest that the reader has scrolled down recently.
  #lastMaxScroll = 0

  // Listening to scroll events on the document allows the element to know
  // which way the reader is scrolling. Scroll events from other regions do not 
  // bubble up the DOM so this will only fire for the top-level document scroll.
  connectedCallback() {
    document.addEventListener('scroll', this.#handleScroll)
  }

  // Clean up the scroll event listener when the element is removed from the
  // document.
  disconnectedCallback() {
    document.removeEventListener('scroll', this.#handleScroll)
  }

  // This is the scroll handler itself. Instead of the usual `#handleScroll() {`
  // function definition, this is a property with an inline function so
  // that `this` will always refer to the element instance itself. This saves
  // us from having to write something like
  // `this.method = this.method.bind(this)` in the constructor.
  #handleScroll = () => {
    // This conditional checks the direction of scroll. It will be true if the
    // user is scrolling down and has scrolled more than 300 pixels down the
    // page already. This prevents the header from immediately hiding itself as
    // the user begins to scroll down from the top of the page, which can be
    // distracting.
    if (window.scrollY > Math.max(300, this.#lastScroll)) {
      this.classList.add('hidden')
    // This conditional checks if the user has scrolled up more than 100px since
    // the last maximum depth. If that's true, we remove the `hidden` class to
    // reveal the header again.
    } else if (window.scrollY < this.#lastMaxScroll - 100) {
      this.classList.remove('hidden')
      // Since we're now scrolling up, reset the `#lastMaxScroll` property so
      // that we're ready to use it when scrolling down the next time.
      this.#lastMaxScroll = window.scrollY
    }
    // Sets `#lastScroll` to reference when handling the next scroll event.
    this.#lastScroll = window.scrollY
    // If we've scrolling down (past the previous maximum), also set
    // `#lastMaxScroll`.
    if (window.scrollY > this.#lastMaxScroll) {
      this.#lastMaxScroll = window.scrollY
    }
  }
}

// Finally, register the above class as a custom element so that we can use it
// in HTML with the `<hotfx-shy-header>` tag.
customElements.define('hotfx-shy-header', HotFXShyHeader)
