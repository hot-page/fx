// All it does is turn Ctrl to ⌘ on MacOS

class HotFXCommandOrControl extends HTMLElement {

  constructor() {
    super()
    const isMac = window.navigator.userAgent.indexOf('Macintosh') >= 0
    this.innerHTML = isMac ? '⌘' : 'Ctrl'
  }

}

customElements.define('hotfx-command-or-control', HotFXCommandOrControl)
