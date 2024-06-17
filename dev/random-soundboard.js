
class RandomSoundboard extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('click', () => {
      const sources = this.querySelectorAll('source[type^="audio"]')
      const source = sources[Math.floor(Math.random() * sources.length)]
      const audio = document.createElement('audio')
      audio.replaceChildren(source.cloneNode())
      audio.play()
    })
  }
}

customElements.define('random-soundboard', RandomSoundboard)
