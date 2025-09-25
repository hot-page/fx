// The <hotfx-form> is a custom HTML element so we must extend the `HTMLElement`
// class.
export class HotFXForm extends HTMLElement {
  // The `ElementInternals` object will let us add custom states to this element
  // that can be read in CSS with the `:state()` pseudo class.
  #internals

  constructor() {
    super()
    // These three event handlers represent the entire functionality of the
    // element.
    this.addEventListener(('submit'), this.#onSubmit)
    this.addEventListener(('reset'), this.#onReset)
    // Since the `invalid` event does not bubble, we need to grab it during the
    // capturing phase.
    this.addEventListener(('invalid'), this.#onInvalid, { capture: true })
    // ElementInternals must be enabled manually.
    this.#internals = this.attachInternals()
  }

  // The `submit` event is fired when the user clicks the button to submit the
  // form or hits enter while typing in an `<input>` element. This will only
  // fire if the form has passed validation, so we can assume the data is ready
  // to go.
  async #onSubmit(event) {
    // The default behavior of the form is to load a new page, so we always need
    // to call `preventDefault` on the `submit` event to make sure that doesn't
    // happen.
    event.preventDefault()
    // The event's `target` is the wrapped `<form>` element.
    const form = event.target
    // We require the `action=` attribute to be set on the form or we won't know
    // where to submit the data. This is an URL for the server that accepts your
    // data, such as a Zapier webhook.
    if (!this.action) {
      console.error('HotFX Form Error: missing the `action="https://...."` attribute on your <form>')
      return
    }
    // Before submitting the form, we clean up the state from any previous
    // attempt.
    this.#internals.states.delete('success')
    this.#internals.states.delete('failure')
    this.style.removeProperty('--hotfx-form-response')
    // This adds the `loading` state while we're waiting for a response from
    // the server. In the demo, this is used to show a spinner.
    this.#internals.states.add('loading')
    // `event.submitter` is the button that was clicked to submit the form. We
    // want to disable it for now so there are no double submissions.
    event.submitter.disabled = true
    // The browser APIs for forms are quite useful. The `FormData` class takes a
    // form element and turns it into an iterable list of fields and values.
    const data = new FormData(event.target)
    try {
      // The `response` variable is going to be the server's response to our
      // `fetch()` request.
      let response
      // There are several diferent ways we can submit the form depending on
      // the attributes set on it.
      //
      // A GET request adds the data as query parameters to the URL. So, for
      // example, it will create an URL like  `https://example.site/webhook?name=Foo&message=Bar`
      // with the form data added in the query string after `?`.
      if (this.method == 'get') {
        response = await fetch(`${this.action}?${new URLSearchParams(data)}`)
      // A form created like `<form enctype="multipart/form-data" ...>` is 
      // typically used for file uploads. It specifies a different way of
      // encoding the data that works for binary data like images.
      } else if (form.enctype == 'multipart/form-data') {
        response = await fetch(this.action, { method: 'POST', body: data })
      // The default for most forms sends the data as the body of a POST request
      // with the `content-type: application/x-www-form-urlencoded` header. The
      // body is an URL-encoded string like `name=Foo&message=Bar`, much the
      // same as the data encoded at the end of the URL in a GET request.
      } else {
        response = await fetch(this.action, {
          method: 'POST',
          body: new URLSearchParams(data),
        })
      }
      // Read the server's response as text and save it to a custom CSS
      // property. This can be used to show the server's response to the user
      // in a `::before` or `::after` element with `content:
      // var(--hotfx-form-response)`.
      const text = await response.text()
      this.style.setProperty('--hotfx-form-response', `"${text}"`)
      // An HTTP status code in the 200s is considered a success or okay.
      if (response.ok) {
        // This adds the `success` state, which can be used in CSS to show a
        // success message to the user.
        this.#internals.states.add('success')
      // Otherwise, add the `failure` state.
      } else {
        this.#internals.states.add('failure')
        // Also log the error to the console for developers who might be
        // looking there.
        console.error(
          `HotFX Form got a bad response from the server ${response.status}: "${text}"`,
        )
      }
    // If the server is unreachable, `fetch()` will throw an error.
    } catch(error) {
      // We add the error message to the same CSS variable as if it was the
      // response, so it can be shown on the form and the user knows what's up.
      this.style.setProperty('--hotfx-form-response', `"Couldn’t reach server: ${error.toString()}"`)
      this.#internals.states.add('failure')
      console.error('HotFX Form error:', error)
    } finally {
      // The `finally` block runs whether there was an error or not and we use
      // it here to clean up the form to be ready for the next submission,
      // removing the loading state and re-enabling the submit button.
      this.#internals.states.delete('loading')
      event.submitter.disabled = false
    }
  }

  // The `invalid` event is fired when the form is submitted by the user but one
  // of the fields doesn't pass validation. So, for example, if an element with
  // `<input required>` is empty, this event will fire instead of `submit` when
  // the user hits the submit button.
  #onInvalid(event) {
    // If we don't have the `validate` attribute on the form, the developer has
    // not opted-in to writing their own valiation messages and we return early.
    // In this case, the browser will show its own validation message using the
    // native styles.
    if (!this.hasAttribute('validate')) return
    // This adds the `failure` state so that error messages can be shown to the
    // user.
    this.#internals.states.add('failure')
    // Calling `preventDefault` prevents the browser from showing its own
    // validation message.
    event.preventDefault()
  }

  // The reset event is fired from a button with the `type="reset"` attribute.
  // This can be used to clear the form and remove any error messages and
  // states from the previous submission.
  #onReset() {
    // Here we just clean up our states and the response variable and it's like 
    // nothing ever happend here.
    this.style.removeProperty('--hotfx-form-response')
    this.#internals.states.delete('success')
    this.#internals.states.delete('failure')
  }

  get method() {
    return this.getAttribute('method') || 'get'
  }

  get action() {
    return this.getAttribute('action')
  }
}

// Checks for a `?define` query parameter in the URL that was used to load this
// script. So, for instance, if you load the script with `<script type="module" src="https://cdn.jsdelivr.net/npm/@hot-page/hotfx-form@0.0.0?define=false">`,
// this variable will contain the text `false`.
const define = new URL(import.meta.url).searchParams.get("define")
// By default we register the above class as a custom element so that we can use
// it in HTML with the `<hotfx-form>` tag. That is, unless called with the query
// parameter to prevent this.
if (define != 'false') customElements.define('hotfx-form', HotFXForm)
