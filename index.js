var express = require('express');
var app = express();
var formidable = require('formidable');
var fs = require('fs');

var BASE_DIRECTORY = process.env['CAPTURE_DIRECTORY'] || './';

app.use(express.static('public'));

app.post('/clip/new', function(req, res) {
  var incomingForm = new formidable.IncomingForm();
  var clipIndex = 1;
  var city = 'c';
  var first = 'unknown';
  var last = 'unkonwn';
  var birth = '80';
  var index = 0;
  var uploaded = [];

  incomingForm.on('error', function(err){
    console.log('error', err);
  })

  incomingForm.on('field', function(name, value){
    if ( name == 'city' )
      city = value.toLowerCase();
    if ( name == 'first' )
      first = value.toLowerCase();
    if ( name == 'last' )
      last = value.toLowerCase();
    if ( name == 'birth' )
      birth = parseInt(birth) % 100;
  })

  incomingForm.on('fileBegin', function(name, file){
    var ext = ( file.name.match(/\.([^\.]+)$/) || ['','mov'])[1];
    console.log(ext);
    file.path = filename(ext);
    uploaded.push(file.path);
  })

  incomingForm.on('end', function() {
    uploaded.forEach(function(path) {
      try {
        var stats = fs.statSync(path);
        if (stats.size == 0) {
          fs.unlinkSync(path);
        }
      } catch (e) { }
    })

    res.sendStatus(200);
  });

  incomingForm.parse(req, function() {
    console.log("parse CB");
  })

  function filename(ext) {
    var prefix = [city,last,first,birth].join('_');
    for ( file = BASE_DIRECTORY+prefix+'_'+ (++index) +'.'+ext;
          fileExists(file);
          file = BASE_DIRECTORY+prefix+'_'+  (++index)  +'.'+ext);
    return file;
  }

  function fileExists(fileName) {
    try {
      fs.statSync(fileName);
      return true;
    } catch (e) {}
    return false;
  }
});

app.listen(8000);
