import mustache from 'https://cdn.jsdelivr.net/npm/mustache@4.2.0/+esm'

class HotFXTemplatedSheet extends HTMLElement {

  constructor() {
    super()
    this.#fetch()
  }

  async #fetch() {
    const spreadsheetId = this.getAttribute('spreadsheet-id')
    const range = this.getAttribute('sheet')
    const apiKey = this.getAttribute('api-key')
    const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${apiKey}`)
    const data = await response.json()
    const columns = data.values.shift()
    const templateData = data.values.map(d =>
      Object.fromEntries(columns.map((c,i) => [c,d[i]]))
    ).filter(r => r.Habilitado == 'TRUE')
    console.log('datos', templateData)
    const template = this.getAttribute('template')
    this.innerHTML = templateData.map(d => mustache.render(template, d)).join('')
  }
}

customElements.define('hotfx-templated-sheet', HotFXTemplatedSheet)
