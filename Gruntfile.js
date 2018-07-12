module.exports = function(grunt) {

  grunt.initConfig({
    responsive_images: {
      dev: {
        options: {
          engine: 'im',
          sizes: [{
            width: 480,
            suffix: '_1x',
            quality: 12
          }, {
            width: 480,
            suffix: '_2x',
            quality: 12
          }, {
            width: 540,
            suffix: '_1x',
            quality: 12
          }, {
            width: 540,
            suffix: '_2x',
            quality: 12
          },{
            width: 800,
            suffix: '_1x',
            quality: 12
          }, {
            width: 800,
            suffix: '_2x',
            quality: 12
          }]
        },
        files: [{
          expand: true,
          src: ['*.{gif,jpg,png}'],
          cwd: 'img/',
          dest: 'images/'
        }]
      }
    },
  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.registerTask('default', ['responsive_images']);

};
