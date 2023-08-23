
document.head.insertAdjacentHTML('beforeend', `
<style>
  hot-form {
    position: relative;
  }

  hot-form .hot-form-submitted {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  hot-form.submitted .hot-form-submitted {
    display: block;
  }
  hot-form.submitted form {
    visibility: hidden;
  }

  hot-form button {
    position: relative;
  }

  hot-form.loading button {
    color: transparent;
    pointer-events: none;
  }

  hot-form.loading button:before {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    content: '';
    border: solid 3px #999;
    border-top-color: #666;
    border-radius: 50%;
    width: 1em;
    height: 1em;
    animation: hot-form-button-loading infinite 0.6s linear;
  }

  @keyframes hot-form-button-loading {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
`)


class HotForm extends HTMLElement {
  constructor() {
    super()
    this.addEventListener('submit', async event => {
      event.preventDefault()
      this.classList.add('loading')
      event.submitter.disabled = true
      const data = Array.from(event.target.elements).reduce((data, element) => {
        if (element.name) data[element.name] = element.value
        return data
      }, {})
      await fetch(event.target.action, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data) 
      })
      this.classList.remove('loading')
      this.classList.add('submitted')
      event.target.reset()
      event.submitter.disabled = false
    })
    this.addEventListener('click', async event => {
      if (event.target.closest('[x-hot-form-reset]')) {
        this.classList.remove('submitted')
      }
    })
  }
}

customElements.define('hot-form', HotForm)
