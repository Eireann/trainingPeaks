module.exports = function(grunt) {
  grunt.initConfig({
    info: '<json:component.json>',
    meta: {
      banner: '/*!\n'+
              ' * <%= info.name %> - <%= info.description %>\n'+
              ' * v<%= info.version %>\n'+
              ' * <%= info.homepage %>\n'+
              ' * copyright <%= info.copyright %> <%= grunt.template.today("yyyy") %>\n'+
              ' * <%= info.license %> License\n'+
              '*/'
    },
    lint: {
      all: [
        'grunt.js',
        'component.json',
        'lib/*.js',
        'test/*.js'
      ]
    },
    concat: {
      dist: {
        src: [
          '<banner>',
          'lib/lazy.js'
        ],
        dest: 'dist/lazy.js'
      }
    },
    min: {
      dist: {
        src: [
          '<banner>', 
          'dist/lazy.js'
        ],
        dest: 'dist/lazy.min.js'
      }
    },
    mocha: {
      all: {
        src: 'test/index.html',
        run: true
      }
    },
    watch: {
      js: {
        files: '<config:lint.all>',
        tasks: 'default' 
      }
    },
    reloadr: {
      all: [
        '_dist/*',
        'test/*'
      ]
    },
    server:{
      port: 8000,
      base: '.'
    }
  });
  grunt.loadNpmTasks('grunt-mocha');
  grunt.loadNpmTasks('grunt-reloadr');
  grunt.registerTask('default', 'lint concat min');
  grunt.registerTask('test', 'mocha');
  grunt.registerTask('dev', 'server reloadr watch');
};
