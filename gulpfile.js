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
const clean = require('gulp-clean');

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
const gulpSSH = new ssh({
  ignoreErrors: false,
  sshConfig: sshConfig
});

/*-------------- vars ----------------*/
const built_folder = "built";

/*--------- files to compile ---------*/
const jsFiles = ['./' + proj_name + './ts/main.ts'];

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

  return src("./" + proj_name + "/ts/**/*.{ts,js}", { sourcemaps: true })
    .pipe(sourcemaps.init())
    .pipe(jsinclude()).on('error', console.log)
    .pipe(ts())

    .pipe(sourcemaps.write('../maps'))
    .pipe(dest("./" + proj_name + "/"+ built_folder +"/js"), { sourcemaps: true })
    .pipe(browSync.stream());
}

function pages(){
  return src("./" + proj_name + "/pages/**/*.html")
    .pipe(dest("./" + proj_name + "/"+ built_folder +"/"))
    .pipe(browSync.stream())
}

function main_html(){
  return src("./" + proj_name + "/index.html")
    .pipe(dest("./" + proj_name + "/"+ built_folder +"/"))
    .pipe(browSync.stream())
}

function img(){
  return src("./" + proj_name + "/img/**/*")
    .pipe(dest("./" + proj_name + "/"+ built_folder +"/img/"))
    .pipe(browSync.stream())
}

function fonts(){
  return src("./" + proj_name + "/fonts/**/*")
    .pipe(dest("./" + proj_name + "/"+ built_folder +"/fonts/"))
    .pipe(browSync.stream())
}

function compile_all() {
  pages();
  main_html();
  css();
  js();
  fonts();
  img();
}

function watch() {
  browSync.init({
    port: 3000, 
    server: {
      baseDir: './' + proj_name + "/" + built_folder + "/",
    },
  });

  gwatch('./' + proj_name + '/fonts/**/*', fonts);
  gwatch('./' + proj_name + '/img/**/*', img);
  gwatch('./' + proj_name + '/pages/**/*.html', pages);
  gwatch('./' + proj_name + '/index.html', main_html);
  gwatch('./' + proj_name + '/scss/**/*.scss', css);
  gwatch('./' + proj_name + '/ts/**/*.{ts,js}', js);
}

function clean_all(){
  return src("./" + proj_name + "/"+ built_folder +"/**/*")
    .pipe(clean());
}

function ssh_all() {
  return src("./" + proj_name + "/"+ built_folder +"/**/*")
    .pipe(gulpSSH.dest('/var/www/html/');
}

task(proj_name, function() { 
  return new Promise(function(resolve, reject) {
    compile_all();
    watch();
    resolve();
  });
});

task(proj_name + "&c", function() { 
  return new Promise(function(resolve, reject) {
    clean_all();
  });
});

task(proj_name + "&m", function() { 
  return new Promise(function(resolve, reject) {
    compile_all();
  });
});

task(proj_name + "&s", function() { 
  return new Promise(function(resolve, reject) {
    compile_all();
    ssh_all();
  });
});

//eval(require("typescript").transpile(require("fs").readFileSync("./gulpclass.ts").toString()));