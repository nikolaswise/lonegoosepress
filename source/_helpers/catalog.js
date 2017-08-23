yaml = require('js-yaml');
fs   = require('fs');
path = require('path');
urlify = require('urlify').create({
  toLower: true,
  spaces:"-",
  nonPrintable:"",
  trim:true
});

module.exports = function (site, cb) {
  console.log('this is the site')
  cb(null, site)
}

