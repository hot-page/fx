/* Prism is a great tiny client-side syntax highlighter. It's a bit dated now
 * and a long-awaited version 2 with ESM import support appears to be stalled
 * out. */
import 'https://cdn.jsdelivr.net/npm/prismjs@1.29.0/prism.min.js'
// [Marked](https://github.com/markedjs/marked) is a great markdown library
import { marked } from 'https://cdn.jsdelivr.net/npm/marked@12.0.2/lib/marked.esm.min.js'

class FXJSDocs extends HTMLElement {

  constructor() {
    super()
    this.#render()
  }

  // This is where the magic happens. We download the stuff and boooom
  // Second line
  async #render() {
    // We fetch the JavaScript source as text. This will require CORS headers
    // but your CDN should provide them
    const response = await fetch(this.getAttribute('src'))
    const code = await response.text()

    // We use Prism to parse the file
    const tokens = Prism.tokenize(code, Prism.languages.javascript)
    // Separate tokens into blocks of comments and code we turn these into and
    // section objects with `type: 'section'` or `type: 'code'`
    //
    // This is another paragraph
    const sections = tokens.reduce((sections, token, i) => {
      let lastSection = sections[sections.length - 1]
      const nextToken = tokens[i + 1]
      if (token.type == 'comment' && lastSection.type == 'code') {
        lastSection = {type: 'comment', tokens: []}
        sections.push(lastSection)
      } else if (
        // This conditional is kind of insane but it's really the only thing I
        // could find that works. The issue is that we want to include most 
        // white space as "code" because that provides indentation of the code.
        // However, Prism will also include white space between comments but
        // we don't want to add that as "code" or there will be empty lines of
        // "code" between for each line of a multi-line comment. Here we
        // start a "code" block if the token is not a comment and the next token
        // is also not a comment. That way a string between two comments will 
        // not create an empty code block.
        (
          (typeof token == 'object' && token.type != 'comment') ||
          (typeof nextToken == 'object' && nextToken.type != 'comment')
        ) &&
        lastSection.type == 'comment'
      ) {
        lastSection = {type: 'code', tokens: []}
        sections.push(lastSection)
      }
      lastSection.tokens.push(token)
      return sections
    }, [{type: 'comment', tokens: []}])

    const html = sections.map(section => {
      if (section.type == 'code') {
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
        return `<pre part="code" class="language-javascript"><code>${code}</code></pre>`
      } else if (section.type == 'comment') {
        const comment = section.tokens
          .map(t => typeof t == 'object' ? t.content : t)
          .join('')
          // Remove the `//`, `/*` and `*` at the begining of the line
          .replaceAll(/^\s*\/\*/mg, '')
          .replaceAll(/^\s*\*\s/mg, '')
          .replaceAll(/^\s*\/\//mg, '')
          // Remove */ at the end of a line
          .replaceAll(/\*\/\s*$/mg, '')
        return `<section part="comment">${marked.parse(comment)}</section>`
      }
    }).join('')

    // For the Prism theme, use a `layer()` so that we can easily override style
    // rules. In this case `pre { margin: 0; }` would not apply because it is
    // set inside that document
    this.innerHTML = html
  }
}

customElements.define('fx-js-docs', FXJSDocs)
