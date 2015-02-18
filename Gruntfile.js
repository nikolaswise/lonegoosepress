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
        tasks: ['newer:imagemin:work']
      },
      layout: {
        files: ['source/layouts/**/*'],
        tasks: ['acetate:build']
      },
      blog: {
        files: ['source/blog/images/**/*'],
        tasks: ['newer:imagemin:blog']
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
          'www/assets/css/style.css': 'source/assets/css/style.scss'
        }
      }
    },

    // Optimize images
    'imagemin': {
      work: {
        files: [{
          expand: true,
          cwd: 'source/assets/img',
          src: ['**/*.{png,jpg,svg}'],
          dest: 'www/assets/img/'
        }]
      },
      blog: {
        files: [{
          expand: true,
          cwd: 'source/blog/images',
          src: ['**/*.{png,jpg,svg}'],
          dest: 'www/blog/images/'
        }]
      },

    },

    'copy': {
      js: {
        expand: true,
        cwd: 'source/',
        src: 'assets/js/**/*',
        dest: 'www/'
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