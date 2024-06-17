// inspired by Typeset.js
// https://blot.im/typeset/

document.head.insertAdjacentHTML('beforeend', `
<style>
  .pull-single { margin-left:  -.2em }
  .push-single { margin-right: .2em }

  .pull-double { margin-left:  -.38em }
  .push-double { margin-right: .38em }

  .pull-triple { margin-left:  -.58em }
  .push-triple { margin-right: .58em }
</style>
`);


let replace = function(old, nu) {
  if (nu instanceof Node)
    old.parentNode.replaceChild(nu, old);
  else if (typeof nu === 'string') {
    var frag = document.createDocumentFragment();
    let temp = document.createElement('div');
    temp.innerHTML = nu;
    let child;
    while (child = temp.firstChild) {
      frag.appendChild(child);
    }
    old.parentNode.replaceChild(frag, old);
  }
};

let s = (klas, chr) => `<span class=${klas}>${chr}</span>`;

Array.from(document.querySelectorAll('p')).forEach((el) => {

  let first = true;
  textNodes(el).map(n => {
    const needsPush = (
      n.textContent.indexOf('‘') >= 0 ||
      n.textContent.indexOf('“') >= 0
    );

    if (needsPush) {
      let html = n.textContent;

      html = html.replace(/(^|\s)(“‘|‘“)/g, (m, p1, p2, offset, string) => {
        if (first && /^\s*$/.test(string.slice(0, offset)))
          return s('pull-triple', p2);
        else if (/\s/.test(string.slice(offset - 1, offset)))
          return s('push-triple','') + ' ' + s('pull-double', p2);
      });

      html = html.replace(/(^|\s)“/g, (m, p1, offset, string) => {
        if (first && /^\s*$/.test(string.slice(0, offset)))
          return s('pull-double','“');
        else
          return s('push-double','') + ' ' + s('pull-double','“')
      });

      html = html.replace(/(^|\s)‘/g, (m, p1, offset, string) => {
        if (first && /^\s*$/.test(string.slice(0, offset)))
          return s('pull-single','‘');
        else
          return s('push-single','') + ' ' + s('pull-single','‘')
      });

      replace(n, html);
    }

    if (/[^\s]/.test(n.textContent))
      first = false;

  });

});


// all text nodes from self and all descendants in reading order
function textNodes(el) {

  let textHarvester = (list, node) => {
    // it's a text node
    if (node.nodeType === 3)
      list.push(node);
    // it's an element, so descend tree and add children
    else if (node.nodeType === 1)
      Array.from(node.childNodes).reduce(textHarvester, list);
    return list;
  };

  return Array.from(el.childNodes).reduce(textHarvester, []);
};
