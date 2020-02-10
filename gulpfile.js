/* system */
const path = require('path');
const proj_name = path.resolve(__dirname, '.').split(path.sep).pop();
const fs = require('fs');

/* global */
const { src, dest, parallel, task } = require('gulp');
const gwatch = require('gulp').watch;
const browSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');
const ssh = require('gulp-ssh');
const built_folder = "built";
const ext_replace = require('gulp-ext-replace');

/* css */
const sass = require('gulp-sass');
const minifyCSS = require('gulp-cssnano');
const cssbeautify = require('gulp-cssbeautify');
const autoprefixer = require('gulp-autoprefixer');
const sassGlob = require('gulp-sass-glob');

/* js */
const ts = require('gulp-typescript');
const jsuglify = require('gulp-uglify');
const jsbeautify = require('gulp-beautify');
const jsinclude = require('gulp-include')


/* html */
//const htmlconcat = require('');


/* ssh */
const sshConfig = require('./../gulpfile.js').sshConfig;
var gulpSSH = new ssh({
  ignoreErrors: false,
  sshConfig: sshConfig
});

/*--------- files to compile ---------*/
const jsFiles = ['./' + proj_name + './ts/main.ts'];

browSync.init({
  port: 3000, 
  server: {
    baseDir: './' + proj_name,
  },
});

function getFileName(file) {
  let slashPos = file.lastIndexOf("/") + 1;
  let dotPos;

  file = file.substr(slashPos);
  dotPos = file.lastIndexOf(".")

  if(dotPos == -1)
    dotPos = file.length;

  return file.substr(0, dotPos);
}

function css() {
  return src("./" + proj_name + "/scss/**/*.{scss,css}")
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cssbeautify())
    .pipe(sourcemaps.write('../maps'))
    .pipe(dest("./" + proj_name + "/"+ built_folder +"/css"))
    .pipe(browSync.stream())        
}

function js() {

  var tsProject;
  var ts = require("gulp-typescript");
  var sourcemaps = require('gulp-sourcemaps');

  if (!tsProject) {
    tsProject = ts.createProject("tsconfig.js");
  }

  var reporter = ts.reporter.fullReporter();
  var tsResult = tsProject.src()
    .pipe(sourcemaps.init())
    .pipe(tsProject(reporter));

  return tsResult.js
    .pipe(sourcemaps.write())
    .pipe(dest('./' + proj_name + '/'+ built_folder + '/js'));

  /*
  return src("./" + proj_name + "/ts/**//*.{ts,js}", { sourcemaps: true, base: process.cwd() })
  /*  .pipe(sourcemaps.init())
    .pipe(jsinclude()).on('error', console.log)
    //.pipe(ext_replace('.js'))
    .pipe(ts({
        noImplicitAny: true,
        declaration: true,
        allowJs: true,

    }))
    .pipe(sourcemaps.write('../maps'))
    .pipe(dest('./' + proj_name + '/'+ built_folder + '/js', { sourcemaps: true }))
    .pipe(browSync.stream())

    */
}
function html() {
  return;
}

function pages(){
  //"+ built_folder +"
  return;
}

function watch() {
  gwatch('./' + proj_name + '/scss/**/*.scss', css);
  gwatch('./' + proj_name + '/ts/**/*.{ts,js}', js);
  gwatch('./' + proj_name + '/*.html').on('change', browSync.reload).on('change', html);
}


task(proj_name, function() { 
  return new Promise(function(resolve, reject) {
    css();
    js();
    html();
    watch();
    resolve();
  });
});

task(proj_name + "&m", function() { 
  return new Promise(function(resolve, reject) {
    css();
    js();
    html();
    watch();
    resolve();
  });
});

task(proj_name + "&s", function() { 
  return new Promise(function(resolve, reject) {
    css();
    js();
    html();
    watch();
    resolve();
  });
});