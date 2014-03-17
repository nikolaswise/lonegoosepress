module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    middleman: {
      options: {
        useBundle: true,
        clean: true
      },
      server: {
        options: {
          command: 'server'
        }
      },
      build: {
        options: {
          command: 'build'
        }
      }
    },

    'gh-pages': {
      options: {
        base: 'build',
        repo: 'https://github.com/nikolaswise/lonegoosepress.git'
      },
      src: ['**']
    }
  });

  // load npm tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

  // Tasks

  // Alias a bunch of common tasks under `docs`
  grunt.registerTask('serve', ['middleman:server']);
  grunt.registerTask('build', ['middleman:build']);

  grunt.registerTask('deploy', 'Deploy to github pages', function(n) {
    if(grunt.option('message')){
      grunt.config.set('gh-pages.options.message', grunt.option('message'));
    }
    grunt.task.run(['gh-pages']);
  });

  grunt.registerTask('default', ['serve']);
};