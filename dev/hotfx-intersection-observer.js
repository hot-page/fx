// Runs a callback (onIsIntersecting) when the element comes into the viewport 
// and runs another one (onIsNotIntersecting) when it leaves

class HotFXIntersectionObserverElement extends HTMLElement {
  #hasFired = false

  constructor() {
    super()
    new IntersectionObserver(this.#callback).observe(this)
  }

  #callback = (entries) => {
    if (entries[0].isIntersecting && this.hasAttribute('onIsIntersecting')) {
      this.#hasFired = true
      new Function(this.getAttribute('onIsIntersecting')).call(this)
    } else if (this.#hasFired && this.hasAttribute('onIsNotIntersecting')) {
      new Function(this.getAttribute('onIsNotIntersecting')).call(this)
    }
  }
}

customElements.define('hotfx-intersection-observer', HotFXIntersectionObserverElement)
// // This was the old version which had a target= attribute
// // The <interection-observer> mimcs the JavaScript API of IntersectionObserver.
// // TODO:
// //   - add attributes for root, rootMargin, threshold
// //   - allow multiple targets (just needs querySelectorAll?
// class HotFXIntersectionObserverElement extends HTMLElement {
//   #intersectionObserver
//
//   static get observedAttributes() { return ['target'] }
//
//   constructor() {
//     super()
//     this.#createIntersectionObserver()
//   }
//
//   attributeChangedCallback(name, oldValue, newValue) {
//     this.#createIntersectionObserver()
//   }
//
//   #createIntersectionObserver() {
//     if (this.#intersectionObserver) this.#intersectionObserver.disconnect()
//     this.#intersectionObserver = new IntersectionObserver(this.#intersectionCallback)
//     const target = this.hasAttribute('target') ?
//       document.querySelector(this.getAttribute('target')) :
//       this
//     this.#intersectionObserver.observe(target)
//   }
//
//   #intersectionCallback = (entries) => {
//     if (entries[0].isIntersecting) {
//       this.classList.add('is-intersecting')
//     } else {
//       this.classList.remove('is-intersecting')
//     }
//   }
// }
//
// customElements.define('hotfx-intersection-observer', HotFXIntersectionObserverElement)
