class HotFXGyroscope extends HTMLElement {
  #start

  constructor() {
    super()
    window.addEventListener('deviceorientation', this.#onDeviceOrientation)
  }

  #onDeviceOrientation = (event) => {
    const { alpha, beta, gamma } = event
    if (alpha === null || beta === null || gamma === null) {
      return 
    } else if (!this.#start) {
      this.#start = { alpha, beta, gamma }
      this.setAttribute('working', '')
    }
    this.style.setProperty('--alpha', Math.round(event.alpha - this.#start.alpha))
    this.style.setProperty('--beta', Math.round(event.beta - this.#start.beta))
    this.style.setProperty('--gamma', Math.round(event.gamma - this.#start.gamma))
  }
}

customElements.define('hotfx-gyroscope', HotFXGyroscope)
