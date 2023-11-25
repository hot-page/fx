document.head.insertAdjacentHTML('afterbegin', `
  <style>
    details {
      overflow: hidden;
      transition: height 0.2s ease-out;
    }

    summary {
      cursor: pointer;
      /* remove the triangle marker */
      list-style: none;
    }

    /* remove the triangle marker on Safari */
    summary::-webkit-details-marker{
      display: none;
    }
  </style>
`)

document.addEventListener('click', event => {
  const el = event.target
  if (el.tagName == 'SUMMARY') {
    event.preventDefault()
    const details = el.closest('details')
    const startHeight = details.offsetHeight
    const endState = !details.open
    if (!details.open) {
      details.open = true
    } else {
      details.setAttribute('closing','')
      details.open = false
    }
    const endHeight = details.clientHeight
    // even if the element is closing, we need to show the text inside so we
    // set it to open again (for now)
    details.open = true
    details.style.height = startHeight + 'px'
    details.offsetHeight // trigger reflow so the transition works
    details.style.height = endHeight + 'px'
    const reset = () => {
      details.style.height = ''
      details.open = endState
      details.removeAttribute('closing')
      details.removeEventListener('transitionend', reset)
    }
    details.addEventListener('transitionend', reset)
  }
})
