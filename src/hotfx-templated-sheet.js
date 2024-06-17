import mustache from 'https://cdn.jsdelivr.net/npm/mustache@4.2.0/+esm'
// going to use CSV because it's easier
// how about hotfx-csv-to-template
// use light dom because we need to style the output
// could either replace the template or the template is an attribute
//
// attributes:
//   csv-src=
//   template=
//
//  todo:
//   * rollup could bundle mustache and papaparse and this into one
//     file maybe
// 
// papa parse for CSV parsing, can take a URL https://www.papaparse.com/

class HotFXTemplatedSheet extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.#fetch()
  }
  
  async #fetch() {
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/1N9ZEByYyc5Nwi0qOQcXti66Lfclp5fypLT4C_JsxnoY/values/grants?alt=json&key=AIzaSyDJhzR4BAX_bznwnApvTOOLWA4kijWyjmw`)
    const data = await response.json()
    console.log(data)
    const template = this.querySelector('script[type="mustache-template"]').textContent
    this.shadowRoot.innerHTML = mustache.render(template, { name: 'holla' })
  }

}

customElements.define('hotfx-templated-sheet', HotFXTemplatedSheet)
