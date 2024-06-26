
document.head.insertAdjacentHTML('beforeend', `
<style>
  hotfx-form {
    position: relative;
  }

  hotfx-form .hotfx-form-submitted {
    display: none;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  hotfx-form.submitted .hotfx-form-submitted {
    display: block;
  }
  hotfx-form.submitted form {
    visibility: hidden;
  }

  hotfx-form button {
    position: relative;
  }

  hotfx-form.loading button {
    color: transparent;
    pointer-events: none;
  }

  hotfx-form.loading button:before {
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
    animation: fx-form-button-loading infinite 0.6s linear;
  }

  @keyframes fx-form-button-loading {
    from { transform: translate(-50%, -50%) rotate(0deg); }
    to { transform: translate(-50%, -50%) rotate(360deg); }
  }
`)


class HotFXForm extends HTMLElement {
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
      if (event.target.closest('[fx-form-reset]')) {
        this.classList.remove('submitted')
      }
    })
  }
}

customElements.define('hotfx-form', HotFXForm)
