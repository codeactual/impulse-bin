module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-shell');

  var mochaShelljsOpt = {stdout: true, stderr: false};

  grunt.initConfig({
    jshint: {
      src: {
        files: {
          src: ['index.js', 'lib/**/*.js']
        }
      },
      bin: {
        files: {
          src: ['bin/*']
        }
      },
      grunt: {
        files: {
          src: ['Gruntfile.js']
        }
      },
      tests: {
        files: {
          src: ['test/lib/**/*.js']
        }
      },
      json: {
        files: {
          src: ['*.json']
        }
      }
    },
    uglify: {
      dist: {
        options: {
          compress: false,
          mangle: false,
          beautify: true
        },
        files: {
          'dist/impulse-bin.js': 'dist/impulse-bin.js'
        }
      }
    },
    shell: {
      options: {
        failOnError: true
      },
      build: {
        command: 'component install --dev && component build --standalone impulseBin --name impulse-bin --out dist --dev'
      },
      dist: {
        command: 'component build --standalone impulseBin --name impulse-bin --out dist'
      },
      shrinkwrap: {
        command: 'npm shrinkwrap'
      },
      test_lib: {
        options: mochaShelljsOpt,
        command: 'mocha --colors --recursive --reporter spec test/lib'
      },
      dox_lib: {
        command: 'gitemplate-dox --input lib/impulse-bin/index.js --output docs/ImpulseBin.md'
      }
    }
  });

  grunt.registerTask('default', ['jshint']);
  grunt.registerTask('dox', ['shell:dox_lib']);
  grunt.registerTask('build', ['default', 'shell:build']);
  grunt.registerTask('dist', ['default', 'shell:dist', 'uglify:dist', 'shell:shrinkwrap', 'dox']);
  grunt.registerTask('test', ['build', 'shell:test_lib']);
};
