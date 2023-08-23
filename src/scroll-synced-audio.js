import animate from './animate'
import icon from './audio-icon'

function isMuted() {
  return !window.localStorage.hotPageMute || JSON.parse(window.localStorage.hotPageMute)
}

class ScrollSyncedAudio extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('click', () => this.togglePlayPause())
    this.attachShadow({ mode: 'open' });
    const observer = new IntersectionObserver(
      this._intersectionCallback.bind(this),
      { rootMargin: '0px', threshold: 0 },
    )
    observer.observe(this)
  }

  togglePlayPause() {
    if (this.querySelector('audio').paused) {
      window.localStorage.hotPageMute = 'false'
      this.play()
    } else {
      window.localStorage.hotPageMute = 'true'
      this.pause()
    }
  }

  async play() {
    try {
      const audio = this.querySelector('audio')
      await audio.play()
      audio.volume = 0
      const ease = animate.cubicIn(0, 1)
      animate({
        duration: 1000, 
        tick: (v) => audio.volume = ease(v),
      })
      this.setAttribute('playing','')
    } catch(error) {
      console.error(error)
    }
  }

  pause() {
    this.removeAttribute('playing')
    this.querySelector('audio').pause()
  }

  _intersectionCallback(entries) {
    if (isMuted()) return
    const [entry] = entries
    if (entry.isIntersecting) {
      this.play()
    } else {
      this.pause()
    }
  }

  connectedCallback() {
    this.shadowRoot.innerHTML =`
      ${icon}
      <style>
        svg {
          width: 60px;
          fill: currentColor;
        }
        :host([playing]) svg #off {
          display: none;
        }
        :host(:not([playing])) svg #on {
          display: none;
        }
      </style>
    `
  }
}

customElements.define('scroll-synced-audio', ScrollSyncedAudio)
