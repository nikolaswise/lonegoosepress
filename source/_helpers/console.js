yaml = require('js-yaml');
fs   = require('fs');
path = require('path');
urlify = require('urlify').create({
  spaces:"-",
  nonPrintable:"",
  trim:true
});

module.exports = function (site, cb) {
  var source = path.resolve('./', 'source')
  var target = path.join(source, 'catalog.yml')
  var catalog
  try {
    catalog = yaml.safeLoad(fs.readFileSync(target, 'utf8'));
  } catch (e) {
    console.error(e);
  }

  var array = ['0', '1', '2', '3', '4']

  function buildPage (page) {
    console.log(page)
    site.push({
      title: page,
      content: page,
      file: '/Users/nwiselocal/Personal/lonegoosepress/source/' + page,
      dest: '/Users/nwiselocal/Personal/lonegoosepress/www/' + page + '/index.html',
      url: '/' + page + '/',
      root: '../..',
      isMarkdown: false,
      data: {page: page}
    })
  }

  array.map(buildPage)

  site.forEach(function (page) {

    console.log(page)

  })

  console.log(site)

  cb(null, site)
}

