function config(acetate) {
  acetate.global('config', {
    environment: 'dev',
  });

  acetate.layout('**/*', 'layouts/_layout:content');
  acetate.layout('blog/**/*', 'layouts/_post:body');

  acetate.layout('publications/books/**/*', 'layouts/_project:body');
  acetate.layout('publications/books/index.html', 'layouts/_layout:content');

  acetate.layout('publications/broadsides/**/*', 'layouts/_project:body');
  acetate.layout('publications/broadsides/index.html', 'layouts/_layout:content');

  acetate.layout('publications/ephemera/**/*', 'layouts/_project:body');
  acetate.layout('publications/ephemera/index.html', 'layouts/_layout:content');

  acetate.layout('commisions/design/**/*', 'layouts/_project:body');
  acetate.layout('commisions/design/index.html', 'layouts/_layout:content');

  acetate.page('blog/_index.html', 'blog', {
    groups: {
      blog: 'blog'
    }
  });
  acetate.group('blog','blog/*.md', {});


  acetate.metadata('publications/broadsides/**/*', {
    data: {
      items: 'data/broadsides.yml'
    }
  });

  acetate.metadata('publications/books/**/*', {
    data: {
      items: 'data/books.yml'
    }
  });

  acetate.metadata('publications/ephemera/**/*', {
    data: {
      items: 'data/ephemera.yml'
    }
  });

  acetate.metadata('commisions/design/**/*', {
    data: {
      items: 'data/design.yml'
    }
  });

  acetate.src = 'source';
  acetate.dest = 'www';
}

module.exports = config;