class FXGyroscope extends HTMLElement {
  #start

  constructor() {
    super()
    window.addEventListener('deviceorientation', this.#onDeviceOrientation)
  }

  #onDeviceOrientation = (event) => {
    if (!this.#start) {
      const { alpha, beta, gamma } = event
      this.#start = { alpha, beta, gamma }
      this.setAttribute('working', '')
    }
    this.style.setProperty('--alpha', Math.round(event.alpha - this.#start.alpha))
    this.style.setProperty('--beta', Math.round(event.beta - this.#start.beta))
    this.style.setProperty('--gamma', Math.round(event.gamma - this.#start.gamma))
  }
}

customElements.define('fx-gyroscope', FXGyroscope)
