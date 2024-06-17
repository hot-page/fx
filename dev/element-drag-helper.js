/*
 * Add two attributes: [draggable=true] and [hot-element=JSON for your element]
 */

document.head.insertAdjacentHTML('afterbegin', `
  <style>
  </style>
`)

document.addEventListener('dragstart', event => {
  if (event.target.hasAttribute('hot-element')) {
    event.dataTransfer.setData(
      'application/x-hot-page-nodes',
      event.target.getAttribute('hot-element'),
    )
    event.dataTransfer.effectAllowed = 'copy'
  }
})
