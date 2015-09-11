if (window.FormData) {
  var form = document.getElementById('upload');
  var allFiles = [];

  /* TODO
    Validation.
    Progress
    Simple form
    Responsiveness
    leave warning
   */

  // EVENT HANDLING

  document.querySelector('.upload-button').addEventListener('click', onSubmit);
  document.querySelector('form').addEventListener('submit', onSubmit);

  each('.file-select', function(select) {
    select.addEventListener('click',function(e) {
      if (allFiles.length < 5)
        e.target.offsetParent.querySelector('.file-input').click();
    }, false);
  });
  // add files on file input change
  each('.file-input', function(input) {
    input.addEventListener('change',function(e) {
      for (var i=0, file; (file = this.files[i]) && allFiles.length < 5; i++)
        allFiles.push(file);
      renderFiles();
    }, false);
  });
  // update display on checkbox change
  each('.city-button .radio', function(input) {
    input.addEventListener('change', function(e) {
      each('.city-button', function(b) { removeClass(b,'checked'); })
      addClass(document.getElementById(e.target.id + '-city-button'), 'checked');
    })
  });

  document.querySelector('.all-files').addEventListener('click', function(e) {
    if (e.target.getAttribute && e.target.getAttribute('data-remove') != null) {
      allFiles.splice(e.target.getAttribute('data-remove')|0, 1);
      renderFiles();
    }
  })


  // RENDERING

  function renderFiles() {
    allFiles = allFiles.slice(0,5);
    var container = document.querySelector('.all-files');
    container.innerHTML = '';
    for (var i=0, file; file = allFiles[i]; i++)
      container.appendChild(fileTemplate(file,i));
    (allFiles.length ? addClass : removeClass)(document.body, 'has-files');
    (allFiles.length < 5 ? removeClass : addClass)(document.body, 'files-maxed');
  }

  function fileTemplate(file, i) {
    return el('div',{'class':'file-info'}, [
      el('span',{'class':'file-name'},file.name),
      el('span',{'class':'file-size'},bytes(file.size)),
      el('button',{'class':'remove-file', 'data-remove':i},'✕'),
      el('span',{'class':'file-progress'},[]),
      el('span',{'class':'file-time'},[])
    ]);
  }

  function el(name, atts, children) {
    var e = document.createElement(name);
    for (var k in atts) e.setAttribute(k,atts[k]);
    if (! Array.isArray( children ))
      e.appendChild(document.createTextNode(children));
    else
      for (var i=0,child; child=children[i]; i++) e.appendChild(child);
    return e;
  }

  // DRAG AND DROP

  var dropTarget = document.body;
  dropTarget.addEventListener("dragenter", cancel, false);
  dropTarget.addEventListener("dragover", cancel, false);
  dropTarget.addEventListener("drop", drop, false);

  function cancel(e) {
    if (allFiles.length < 5)
      e.dataTransfer.dropEffect = "copy";
    e.stopPropagation();
    e.preventDefault();
  }

  function drop(e) {
    cancel(e);

    var dt = e.dataTransfer;
    for (var i=0,file; file = dt.files[i]; i++)
      allFiles.push(file);
    renderFiles();
  }

  // SUBMISSION

  function onSubmit(e) {
    e.preventDefault();

    if (validate()) {
      var data = new FormData(form);
      for (var i=0, file; file = allFiles[i]; i++ ) {
        data.append('clip' + (2+i), file, file.name);
      }

      var request = new XMLHttpRequest();
      request.open("POST", form.getAttribute('action'), true);
      request.onload = function() { console.log(request, e); };
      request.send(data);
    }

    return false;
  }

  function validate() {}

  // MISC
  function bytes(n) {
    if (!n) return '0b';
    var units = 'b Kb Mb Gb Tb Pb'.split(' ');
    for (var i=0; n > 1024; i++) n /= 1024;
    return n.toFixed(1) + units[i];
  }

  function addClass(e,clss) {
    removeClass(e,clss);
    var oldClss = e.getAttribute('class');
    e.setAttribute('class', !oldClss ? clss : oldClss +' '+clss);
  }

  function removeClass(e,clss) {
    e.setAttribute('class',(e.getAttribute('class')||'').replace(clss,'').replace(/^\s+|\s+$/g,'').replace(/\s\s+/g,' '))
  }

  function each(selector, f) {
    for (var i=0, es=document.querySelectorAll(selector), e; e = es[i]; i++) f(e);
  }
}
