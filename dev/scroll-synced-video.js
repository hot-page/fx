import animate from './animate'
import icon from './audio-icon.js'

class ScrollSyncedVideo extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('click', () => this.toggleMute())
    this.attachShadow({ mode: 'open' });
    const observer = new IntersectionObserver(
      this._intersectionCallback.bind(this),
      { rootMargin: '0px', threshold: 0 },
    )
    observer.observe(this)
  }

  toggleMute() {
    const video = this.querySelector('video')
    if ('muted' in this.attributes) {
      window.localStorage.hotPageMute = 'false'
      this.transitionVolume()
    } else {
      window.localStorage.hotPageMute = 'true'
      this.setAttribute('muted','')
      if (this._tween) this._tween.cancel()
      video.volume = 0
    }
  }

  transitionVolume() {
    if (this._tween) this._tween.cancel()
    const video = this.querySelector('video')
    if (JSON.parse(window.localStorage.hotPageMute)) return
    video.muted = false
    // issue here is you can't unmute if the user hasn't already interacted with
    // the document
    const paused = () => {
      // console.log('paused callback')
      video.muted = true
      this.setAttribute('muted', '')
      video.play()
    }
    video.addEventListener('pause', paused)
    setTimeout(() => video.removeEventListener('pause', paused), 100)
    this.removeAttribute('muted')
    const ease = animate.cubicIn(0, 1)
    this._tween = animate({
      duration: 1000, 
      tick: (v) => video.volume = ease(v),
    })
  }

  async play() {
    try {
      const video = this.querySelector('video')
      video.volume = 0
      await video.play()
      this.transitionVolume()    
    } catch(error) {
      console.error(error)
    }
  }

  pause() {
    this.querySelector('video').pause()
  }

  _intersectionCallback(entries) {
    // console.log('togglePlayPause')
    const [entry] = entries
    if (entry.isIntersecting) {
      this.play()
    } else {
      this.pause()
    }
  }

  connectedCallback() {
    this.shadowRoot.innerHTML =`
      <div class="container">
        ${icon}
        <slot></slot>
      </div>
      <style>
        :host {
          display: block;
        }

        ::slotted(video) {
          display: block;
        }

        .container {
          position: relative;
        }

        svg {
          position: absolute;
          bottom: 0;
          right: 0;
          width: 60px;
          fill: currentColor;
        }

        :host([muted]) svg #on {
          display: none;
        }

        :host(:not([muted])) svg #off {
          display: none;
        }
      </style>
    `
    const video = this.querySelector('video')
    video.loop = true
    video.muted = true
    this.setAttribute('muted','')
  }
}

customElements.define('scroll-synced-video', ScrollSyncedVideo)
