/* system */
const path = require('path');
const proj_name = path.resolve(__dirname, '.').split(path.sep).pop();

/* global */
const { src, dest, parallel, task } = require('gulp');
const gwatch = require('gulp').watch;
const browSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');

/* css */
const sass = require('gulp-sass');
const minifyCSS = require('gulp-cssnano');
const cssbeautify = require('gulp-cssbeautify');
const autoprefixer = require('gulp-autoprefixer');
const sassGlob = require('gulp-sass-glob');

/* js */
const jsuglify = require('gulp-uglify');
const jsbeautify = require('gulp-beautify');
const jsinclude = require('gulp-include')

/* html */
//const htmlconcat = require('');


function css(m=false) {
  let add_func;
  if(m == true){
    add_func = minifyCSS;
  } else {
    add_func = cssbeautify;
  } 
  
  return src("./" + proj_name + "/scss/main.scss")
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(add_func())
    .pipe(sourcemaps.write('../maps'))
    .pipe(dest("./" + proj_name + "/build/css"))
    .pipe(browSync.stream())
        
}

function js(m=false) {
  if(m == true){
    add_func = jsuglify;
  } else {
    add_func = jsbeautify;
  }

  return src("./" + proj_name + "/js/main.js", { sourcemaps: true })
    .pipe(sourcemaps.init())
    .pipe(jsinclude()).on('error', console.log)
    .pipe(add_func())
    .pipe(sourcemaps.write('../maps'))
    .pipe(dest('./' + proj_name + '/build/js', { sourcemaps: true }))
    .pipe(browSync.stream())
    
}

function html() {
  return;
}

function watch() {
  browSync.init({
    port: 3000, 
    server: {
      baseDir: './' + proj_name
    }
  });

  gwatch('./' + proj_name + '/scss/**/*.scss', css);
  gwatch('./' + proj_name + '/js/**/*.js', js);
  gwatch('./' + proj_name + '/*.html').on('change', browSync.reload).on('change', html);
}

task(proj_name + "_mj", function() { 
  return new Promise(function(resolve, reject) {
    css();
    js(true);
    console.log("js minified");
    resolve();
  });
});

task(proj_name + "_mc", function() { 
  return new Promise(function(resolve, reject) {
    css(true);
    js();
    console.log("css minified");
    resolve();
  });
});

task(proj_name + "_m", function() { 
  return new Promise(function(resolve, reject) {
    css();
    js();
    console.log("js and css minified");
    resolve();
  });
});

task(proj_name, function() { 
  return new Promise(function(resolve, reject) {
    css();
    js();
    html();
    watch();
    resolve();
  });
});