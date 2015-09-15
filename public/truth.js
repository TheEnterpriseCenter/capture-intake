(function() {
  var form = document.getElementById('upload');
  var allFiles = [];
  var uploading = false;

  /* TODO
    Progress
    Simple form
    Responsiveness
   */

  // EVENT HANDLING

  document.querySelector('.upload-button').addEventListener('click', onSubmit);
  document.querySelector('form').addEventListener('submit', onSubmit);

  each('.file-select', function(select) {
    select.addEventListener('click',function(e) {
      if (allFiles.length < 5)
        document.querySelector('#file-input').click();
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
      validateCity();
    })
  });
  document.querySelector('#first-name').addEventListener('change', function(e) {
    validateField('first');
  })
  document.querySelector('#last-name').addEventListener('change', function(e) {
    validateField('last');
  })

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
      el('span',{'class':'file-progress'},''),
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
    if (uploading) return;

    if (validate()) {
      uploading = true;
      addClass(document.body, 'uploading');

      var data = new FormData(form);
      for (var i=0, file; file = allFiles[i]; i++ ) {
        data.append('clip' + (2+i), file, file.name);
      }

      var request = new XMLHttpRequest();
      request.open("POST", form.getAttribute('action'), true);

      request.onreadystatechange = function() {
        if (request.readyState > 1) {
          if (request.status != 200)
            displayError(request.responseText);
          else
            uploadComplete();
        }
      }
      request.upload.onprogress = requestProgress;
      request.send(data);
    } else {
      document.body.scrollTop = 0;
    }

    return false;
  }

  function displayError(e) {
    var upload = document.querySelector('.upload-button');
    upload.innerHTML = '';
    addClass(upload, 'error');
    upload.appendChild(el('h4',{},'ERROR'));
    upload.appendChild(el('p',{},'There has been a problem with your submission. Please try again on a better connection or at a later time'));
  }

  function uploadComplete() {
    addClass(document.body, 'complete');
    document.body.scrollTop = 0;
  }

  function requestProgress(e) {
    var fileInfo = document.querySelectorAll('.file-info');
    for (var i=0, file, total=0; file = allFiles[i]; i++) {
      if (fileInfo[i]) {
        if (! fileInfo[i].querySelector('.done') ) {
          var progress = fileInfo[i].querySelector('.file-progress');
          if (e.loaded > total + file.size) {
            addClass(progress, 'fa fa-check done');
            progress.innerHTML = '';
          } else if (e.loaded > total) {
            progress.innerHTML = parseInt( 100 * (e.loaded - total) / file.size) + '%';
          } else {
            progress.innerHTML = '...';
          }
        }
        total += file.size;
      }
    }
    document.querySelector('.upload-button').innerHTML = parseInt( 100 * e.loaded / e.total) + '% complete';
  }


  function validate() {
    var valid = validateCity();
    valid = validateField('first') && valid;
    valid = validateField('last') && valid;

    return valid;
  }

  // MISC
  function bytes(n) {
    if (!n) return '0b';
    var units = 'b Kb Mb Gb Tb Pb'.split(' ');
    for (var i=0; n > 1024; i++) n /= 1024;
    return n.toFixed(1) + units[i];
  }

  function validateField(name) {
    var element = form[name], parent = element.parentNode;
    if (form[name].value.length == 0) {
      addClass(parent, 'error');
      return false;
    }
    removeClass(parent, 'error');
    return true;
  }

  function validateCity() {
    var cha = document.getElementById('cha');
    var kc = document.getElementById('kc');
    var parent = cha.parentNode.parentNode;
    if ( ! cha.checked && ! kc.checked ) {
      addClass(parent, 'error');
      return false;
    }
    removeClass(parent, 'error');
    return true;
  }

  function addClass(e,clss) {
    removeClass(e,clss);
    var oldClss = e.getAttribute('class');
    e.setAttribute('class', !oldClss ? clss : oldClss +' '+clss);
  }

  function removeClass(e,clss) {
    e.setAttribute('class',
      (e.getAttribute('class')||'').replace(new RegExp('(^|\\s+)'+clss+'($|\\s+)','g'),'$1'));
  }


  function each(selector, f) {
    for (var i=0, es=document.querySelectorAll(selector), e; e = es[i]; i++) f(e);
  }
})();
