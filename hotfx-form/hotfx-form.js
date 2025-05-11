// Since this component doesn't use a shadow DOM, we need to add these basic
// styles directly to the document. This creates a [constructable style
// sheet](https://web.dev/articles/constructable-stylesheets) which provides a
// number of advantages over the typical method of appending `<style>` tags.
// The performance consideration for such a small component are negligble but
// this technique will also make it work with a restrictive Content Security
// Policies.
const sheet = new CSSStyleSheet()
sheet.replace(`
  hotfx-fetch-form {
    display: block;
  }
`)
document.adoptedStyleSheets.push(sheet)

// This is a custom HTML element so we must extend the `HTMLElement` class.
class HotFXForm extends HTMLElement {
  #internals

  constructor() {
    super()
    this.addEventListener(('submit'), this.#onSubmit)
    this.#internals = this.attachInternals();
  }

  #onSubmit = async (event) => {
    event.preventDefault()
    this.#internals.states.delete('success')
    const form = event.target
    if (
      !this.hasAttribute('novalidate') &&
      (
      (form.novalidate && Array.from(form.elements).map(el => el.checkValidity()).some(v => !v)) ||
      !form.checkValidity())
    ) {
      this.#internals.states.add('failure')
      return
    }
    this.#internals.states.delete('failure')
    event.submitter.disabled = true
    this.#internals.states.add('loading')
    const data = new FormData(event.target)
    try {
      const result =
        form.method == 'get'
          ? await fetch(`${form.action}?${new URLSearchParams(data)}`)
          : form.enctype == 'multipart/form-data'
            ? await fetch(form.action, { method: 'POST', body: data })
            : await fetch(form.action, { method: 'POST', body: new URLSearchParams(data) })
      const text = await result.text()
      if (result.ok) {
        this.style.setProperty('--hotfx-form-response', `"${text}"`)
        this.#internals.states.add('success');
      } else {
        this.style.setProperty('--hotfx-failure-response', `"${text}"`)
        this.#internals.states.add('failure');
        // sets this in a CSS variable that you can show in an ::after element (make it red and display block and boom)
        console.error(`HotFX Form got a bad response from the server ${result.status}: "${text}"`)
      }
    } catch(error) {
      this.#internals.states.add('failure');
      console.error(error)
    } finally {
      this.#internals.states.delete('loading');
      event.submitter.disabled = false
    }
  }

  reset() {
    this.querySelectorAll('form').forEach(f => f.reset())
    this.#internals.states.delete('success')
    this.#internals.states.delete('failure')
  }
}

// Finally, register the above class as a custom element so that we can use it
// in HTML with the `<hotfx-fetch-form>` tag.
customElements.define('hotfx-form', HotFXForm)
