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
  var source = path.resolve('./', 'source')
  var target = path.join(source, 'catalog.yml')
  var catalog
  try {
    catalog = yaml.safeLoad(fs.readFileSync(target, 'utf8'));
  } catch (e) {
    console.error(e);
  }
  console.log(catalog)
  cb(null, site)
}

