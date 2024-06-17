
document.head.insertAdjacentHTML('beforeend', `
<style>
  shy-header {
    display: block;
    position: sticky;
    top: 0;
    transition: transform 0.3s ease-out;
  }

  shy-header.hidden {
    transform: translateY(-100%);
  }
</style>
`)

class ShyHeader extends HTMLElement {
  #lastScroll = 0
  #lastMaxScroll = 0

  constructor() {
    super()
    window.addEventListener('scroll', this.#onScroll)
  }

  #onScroll = () => {
    if (window.scrollY > Math.max(100, this.#lastScroll)) {
      this.classList.add('hidden')
    } else if (window.scrollY < this.#lastMaxScroll - 100) {
      this.#lastMaxScroll = window.scrollY
      this.classList.remove('hidden')
    }
    this.#lastScroll = window.scrollY
    if (window.scrollY > this.#lastMaxScroll) {
      this.#lastMaxScroll = window.scrollY
    }
  }
}

customElements.define('shy-header', ShyHeader)
