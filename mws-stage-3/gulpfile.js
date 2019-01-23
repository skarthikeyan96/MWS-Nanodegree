'use strict';

var autoprefixer = require('gulp-autoprefixer');
var csso = require('gulp-csso');
var gulp = require('gulp');
 
gulp.task('styles', function () {
  return gulp.src('./css/*.css')
    // Auto-prefix css styles for cross browser compatibility
    .pipe(autoprefixer())
    // Minify the file
    .pipe(csso())
    // Output
    .pipe(gulp.dest('./css/'))
});

// Gulp task to minify all files
gulp.task('default', ['styles']);