import Prism from 'prismjs'
import { marked } from 'marked'
import linkIcon from './link-icon.js'

class LiterateSource extends HTMLElement {

  constructor() {
    super()
    this.innerHTML = `
      <style>
        hotfx-js-docs div {
          border: 3px solid #eee;
          border-top-color: var(--primary-color);
          border-radius: 50%;
          width: 30px;
          height: 30px;
          margin: 0 auto;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg) }
        }
      </style>
      <div></div>
    `
    this.#render()
  }

  async #render() {
    const response = await fetch(this.getAttribute('src'))
    const code = await response.text()

    const tokens = Prism.tokenize(code, Prism.languages.javascript)
    const sections = tokens.reduce((sections, token, i) => {
      let section = sections[sections.length - 1]
      const nextToken = tokens[i + 1]
      // Create a comment section if we have a comment and the current one is
      // a code section
      if (section.type == 'code' && token.type == 'comment') {
        section = {type: 'comment', tokens: []}
        sections.push(section)
      } else if (
        section.type == 'comment' &&
        // This conditional is pretty wild but it's totally necessary.
        // Basically, the problem is that Prism will show the white space
        // between two comments as a plain string token and we need to prevent
        // creating a blank code block between two comment lines because it's
        // normal to wrap a paragraph of comment on many lines. BUT the white
        // space after a comment and before a piece of code needs to start a
        // new code block because that's crucial indentiation information. So,
        // we start a new code block if the string has non-whitespace text, or
        // if it's a highlighted thing, OR the next thing is a piece of code.
        (
          typeof token == 'string' && /\S/.test(token) ||
          typeof token == 'object' && token.type != 'comment' ||
          typeof nextToken == 'object' && nextToken.type != 'comment'
        ) 
      ) {
        section = {type: 'code', tokens: []}
        sections.push(section)
      }
      section.tokens.push(token)
      return sections
    }, [{type: 'comment', tokens: []}])

    const html = sections.map((section, i) => {
      if (section.type == 'comment') {
        const comment = section.tokens
          .map(t => typeof t == 'object' ? t.content : t)
          .join('')
          // Remove the `//`, `/*` and `*` at the begining of the line
          .replaceAll(/^\s*\/\* ?/mg, '')
          .replaceAll(/^\s*\*\s ?/mg, '')
          .replaceAll(/^\s*\/\/ ?/mg, '')
          // Remove */ at the end of a line
          .replaceAll(/\*\/\s*$/mg, '')
          // This would be great but it's doing it inside code so forget it (for now)
          // // opening singles
          // .replace(/(^|[\s(\["])'(?!$|\s)/g, '$1\u2018')
          // // closing singles & apostrophes
          // .replace(/'/g, '\u2019')
          // // opening doubles
          // .replace(/(^|[/\[(\u2018\s])"(?!$|\s)/g, '$1\u201c')
          // // closing doubles
          // .replace(/"/g, '\u201d')
          // // remove soft hyphens
          // .replace(/\u00ad/g, '')
          // en-dashes to em-dash. sad that this is necessary but it is.
          // .replace('\u2013', '\u2014')
          // em-dashes (disabled because css custom props are needed)
          // .replace(/--/g, '\u2014')
          .replace(/(\s|$)HTML([\s.])/g, '$1<abbr>HTML</abbr>$2')
          .replace(/(\s|$)CSS([\s.])/g, '$1<abbr>CSS</abbr>$2')
          .replace(/(\s|$)DOM([\s.])/g, '$1<abbr>DOM</abbr>$2')
          .replace(/(\s|$)URL([\s.])/g, '$1<abbr>URL</abbr>$2')
          .replace(/(\s|$)GET([\s.])/g, '$1<small>GET</small>$2')
          .replace(/(\s|$)POST([\s.])/g, '$1<small>POST</small>$2')
        return `
          <div class="hotfx-js-docs-row" id="section-${i/2}">
            <div class="comment-section">
              <a class="section-link" href="#section-${i/2}">${linkIcon}</a>
              ${marked.parse(comment)}
            </div>`
      } else if (section.type == 'code') {
        const code = Prism.Token.stringify(
          Prism.util.encode(section.tokens),
          'javascript',
        )
          // Remove new lines at the start of the code. You could do this with
          // trim() or even trimStart() but the idea is to keep spaces since
          // that's what's going to give us proper indentation
          .replace(/^\n/, '')
          // We remove spaces at the end of the code but preserve the newlines
          // so that any empty lines are included (it seems that `<pre>` will
          // chomp the last newline anyway)
          .replace(/[ ]*$/, '')
        return `
            <pre class="code-section" class="language-javascript"><code>${code}</code></pre>
          </div>` // closes <div> of the row opened in comment section
      }
    }).join('')

    // For the Prism theme, use a `layer()` so that we can easily override style
    // rules. In this case `pre { margin: 0; }` would not apply because it is
    // set inside that document
    this.innerHTML = html

    // Now highlight the code in comments using Prism
    Array.from(this.querySelectorAll('.hotfx-js-docs-row .comment-section code[class*="language-"]'))
      .forEach(el => Prism.highlightElement(el))
  }
}

customElements.define('literate-source', LiterateSource)
