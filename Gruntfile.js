var repo = 'https://github.com/nikolaswise/the-king-in-yellow';

module.exports = function(grunt) {

  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    'acetate': {
      build: {
        config: 'acetate.conf.js'
      },
      watch: {
        config: 'acetate.conf.js',
        options: {
          watch: true,
          server: true
        }
      }
    },

    'watch': {
      js: {
        files: ['source/assets/js/**/*'],
        tasks: ['copy:js']
      },
      sass: {
        files: ['source/assets/css/**/*'],
        tasks: ['sass']
      },
      img: {
        files: ['source/assets/img/**/*'],
        tasks: ['newer:imagemin']
      },
      layout: {
        files: ['source/layouts/**/*'],
        tasks: ['acetate:build']
      }
    },

    // Build site sass
    'sass': {
      expanded: {
        options: {
          style: 'expanded',
          sourcemap: 'none',
          loadPath: 'bower_components'
        },
        files: {
          'build/assets/css/style.css': 'source/assets/css/style.scss'
        }
      }
    },

    // Optimize images
    'imagemin': {
      doc: {
        files: [{
          expand: true,
          cwd: 'source/assets/img',
          src: ['**/*.{png,jpg,svg}'],
          dest: 'build/assets/img/'
        }]
      }
    },

    'copy': {
      js: {
        expand: true,
        cwd: 'source/',
        src: 'assets/js/**/*',
        dest: 'build/'
      }
    },

    'gh-pages': {
      options: {
        base: 'build',
        repo: repo
      },
      src: ['**']
    }
  });

  grunt.registerTask('default', ['newer:imagemin', 'sass', 'acetate:watch', 'watch']);
  grunt.registerTask('deploy', ['acetate:build', 'sass', 'newer:imagemin', 'gh-pages']);
};