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
  var source = path.resolve('./', 'source')
  var target = path.join(source, 'catalog.yml')
  var catalog

  try {
    catalog = yaml.safeLoad(fs.readFileSync(target, 'utf8'));
  } catch (e) {
    console.error(e);
  }

  function buildBook (project) {
    site.push({
      title: project.title,
      template: '_layouts/project.html',
      block: 'project',
      content: '',
      file: '/Users/nwiselocal/Personal/lonegoosepress/source/' + urlify(project.title),
      dest: '/Users/nwiselocal/Personal/lonegoosepress/build/publications/books/' + urlify(project.title) + '/index.html',
      url: '/' + urlify(project.title) + '/',
      root: '../..',
      isMarkdown: false,
      project: project,
      data: {project: project}
    })
  }
  function buildBroadside (project) {
    site.push({
      title: project.title,
      template: '_layouts/project.html',
      block: 'project',
      content: '',
      file: '/Users/nwiselocal/Personal/lonegoosepress/source/' + urlify(project.title),
      dest: '/Users/nwiselocal/Personal/lonegoosepress/build/publications/broadsides/' + urlify(project.title) + '/index.html',
      url: '/' + urlify(project.title) + '/',
      root: '../..',
      isMarkdown: false,
      project: project,
      data: {project: project}
    })
  }
  function buildEphemera (project) {
    site.push({
      title: project.title,
      template: '_layouts/project.html',
      block: 'project',
      content: '',
      file: '/Users/nwiselocal/Personal/lonegoosepress/source/' + urlify(project.title),
      dest: '/Users/nwiselocal/Personal/lonegoosepress/build/publications/ephemera/' + urlify(project.title) + '/index.html',
      url: '/' + urlify(project.title) + '/',
      root: '../..',
      isMarkdown: false,
      project: project,
      data: {project: project}
    })
  }

  function buildDesign (project) {
    site.push({
      title: project.title,
      template: '_layouts/project.html',
      block: 'project',
      content: '',
      file: '/Users/nwiselocal/Personal/lonegoosepress/source/' + urlify(project.title),
      dest: '/Users/nwiselocal/Personal/lonegoosepress/build/commisions/design/' + urlify(project.title) + '/index.html',
      url: '/' + urlify(project.title) + '/',
      root: '../..',
      isMarkdown: false,
      project: project,
      data: {project: project}
    })
  }

  function buildSupport (project) {
    site.push({
      title: project.title,
      template: '_layouts/project.html',
      block: 'project',
      content: '',
      file: '/Users/nwiselocal/Personal/lonegoosepress/source/' + urlify(project.title),
      dest: '/Users/nwiselocal/Personal/lonegoosepress/build/commisions/publishing/' + urlify(project.title) + '/index.html',
      url: '/' + urlify(project.title) + '/',
      root: '../..',
      isMarkdown: false,
      project: project,
      data: {project: project}
    })
  }

  function buildRealization (project) {
    site.push({
      title: project.title,
      template: '_layouts/project.html',
      block: 'project',
      content: '',
      file: '/Users/nwiselocal/Personal/lonegoosepress/source/' + urlify(project.title),
      dest: '/Users/nwiselocal/Personal/lonegoosepress/build/commisions/realization/' + urlify(project.title) + '/index.html',
      url: '/' + urlify(project.title) + '/',
      root: '../..',
      isMarkdown: false,
      project: project,
      data: {project: project}
    })
  }

  catalog.books.map(buildBook)
  catalog.broadsides.map(buildBroadside)
  catalog.ephemera.map(buildEphemera)
  catalog.design.map(buildDesign)
  catalog.publishing.map(buildSupport)
  catalog.realization.map(buildRealization)

  cb(null, site)
}

