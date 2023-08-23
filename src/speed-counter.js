import animate from './animate.js'

customElements.define('speed-counter', class SpeedCount extends HTMLElement {

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this.end = parseInt(this.innerHTML)
    this.current = 0
    const observer = new IntersectionObserver(
      this._intersectionCallback.bind(this),
      { rootMargin: '0px', threshold: 0 },
    )
    observer.observe(this)
  }

  _intersectionCallback() {
    const ease = animate.cubicOut(this.current, this.end)
    if (this._tween) this._tween.cancel()
    this._tween = animate({
      duration: 1500,
      tick: (x) => {
        this.shadowRoot.innerHTML = Math.round(ease(x)).toLocaleString()
      },
    })
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = 0
  }
})
