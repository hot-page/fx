
document.head.insertAdjacentHTML('beforeend', `
<style>
  paginator-parent {
    display: block;
    height: 100vh;
    width: 100vw;
    overflow: scroll;
  }

  paginator-page {
    display: block;
    position: sticky;
    min-height: 100vh;
    box-shadow: 3px 0px 10px rgba(51,51,51,0.5);
  }

  paginator-parent[snap] {
    scroll-snap-type: y proximity;
  }

  paginator-parent[snap] paginator-page {
    scroll-snap-align: start;
  }
</style>
`);

class PaginatorParent extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('scroll', () => {
      // how does this work....      
    })
  }
}

class PaginatorPage extends HTMLElement {
  constructor() {
    super()
    const resizeObserver = new ResizeObserver(this._resizeCallback.bind(this))
    resizeObserver.observe(this)
  }

  _resizeCallback() {
    this.style.top = window.innerHeight - this.offsetHeight + "px"
  }
}

customElements.define('paginator-parent', PaginatorParent)
customElements.define('paginator-page', PaginatorPage)
