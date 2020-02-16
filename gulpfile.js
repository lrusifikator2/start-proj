const path = require('path');

/*================================== SETTINGS ===============================*/
const proj_name = path.resolve(__dirname, '.').split(path.sep).pop();
const built_folder = "built";

const proj_path = "./" + proj_name;
const built_path = proj_path + "/"+ built_folder;

const js_version = "es5";

const files_to_ssh = built_path + "/**/*";
const sshDir = '/var/www/html/';
const sshConfig = require('./../gulpfile.js').sshConfig;

/*
const sshConfig = {
  host: '',
  port: 22,
  username: '',
  password: ''
};
*/

const min_dir = proj_path + "/min";
const purify_css_html = built_path +"/**/*.html";

/*------------------------------------- HTML -------------------------------------*/
const pages_files = proj_path + "/pages/*.html";
const pages_dest_dir = built_path;
const min_pages_dest_dir = min_dir;

const pages_watch = proj_path + "/pages/**/*.html";
/*------------------------------------- CSS -------------------------------------*/
const scss_files = proj_path + "/scss/*.{scss,css}";
const css_dest_dir = built_path +"/css";
const min_css_dest_dir = min_dir + "/css";

const scss_watch = proj_path + "/scss/**/*.{scss,css}";
/*------------------------------------- JS -------------------------------------*/
const ts_files = proj_path + "/ts/*.{ts,js}";
const js_dest_dir = built_path +"/js";
const min_js_dest_dir = min_dir + "/js";

const ts_watch = proj_path + "/ts/**/*.{js,ts}";
/*------------------------------------- IMG -------------------------------------*/
const img_files = proj_path + "/img/**/*";
const img_dest = built_path +"/img";
const min_img_dest = min_dir +"/img";

const img_watch = proj_path + "/img/**/*";
/*------------------------------------- FONTS -------------------------------------*/
const fonts_files = proj_path + "/fonts/**/*";
const fonts_dest = built_path +"/fonts";
const min_fonts_dest = min_dir +"/fonts";

const fonts_watch = proj_path + "/fonts/**/*";

/*======================================== PRESET ===============================*/
/* system */
const fs = require('fs');

/* global */
const { src, dest, parallel, task } = require('gulp');
const gwatch = require('gulp').watch;
const browSync = require('browser-sync').create();
const sourcemaps = require('gulp-sourcemaps');

/* css */
const sass = require('gulp-sass');
const cssbeautify = require('gulp-cssbeautify');
const autoprefixer = require('gulp-autoprefixer');
const sassGlob = require('gulp-sass-glob');
const cssPurify = require('gulp-purgecss');


/* js */
const ts = require('gulp-typescript');
const jsinclude = require('gulp-include')


/* html */
const fileinclude = require('gulp-file-include');

/*======================================== FUNCTIONS ===============================*/
function css() {
  let purify_files = [
        purify_css_html
  ];

  return src(scss_files)
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(cssbeautify())
    .pipe(sourcemaps.write('../maps'))
    .pipe(dest(css_dest_dir))
    .pipe(browSync.stream())        
}

function js() {
  return src(ts_files, { sourcemaps: true })
    .pipe(sourcemaps.init())
    .pipe(jsinclude()).on('error', console.log)
    .pipe(ts(
      {
        noImplicitAny: true,
        target: js_version, 
        removeComments: false, 
        allowJs: true
      }
    ))
    .pipe(sourcemaps.write('../maps'))
    .pipe(dest(js_dest_dir), { sourcemaps: true })
    .pipe(browSync.stream());
}

function pages(){
  return src([pages_files])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(dest(pages_dest_dir))
    .pipe(browSync.stream())
}


function img(){
  return src(img_files)
    .pipe(dest(img_dest))
    .pipe(browSync.stream())
}

function fonts(){
  return src(fonts_files)
    .pipe(dest(fonts_dest))
    .pipe(browSync.stream());
}

function minify_css(){
  const cleanCSS = require('gulp-clean-css');
  
  let purify_files = [
        purify_css_html
  ];

  return src(scss_files)
    .pipe(sassGlob())
    .pipe(sass().on('error', sass.logError))
    .pipe(autoprefixer())
    .pipe(
      cleanCSS({compatibility: 'ie10', debug: true}, (details) => {
        console.log(`${details.name}: ${details.stats.originalSize}`);
        console.log(`${details.name}: ${details.stats.minifiedSize}`);
      })
    )
    .pipe(dest(min_css_dest_dir))
}

function minify_js() {
  const uglify = require('gulp-uglify');
  const pipeline = require('readable-stream').pipeline;

  return pipeline(
    src(ts_files), 
    jsinclude().on('error', console.log),
    ts(
      {
        noImplicitAny: true,
        target: js_version, 
        removeComments: false, 
        allowJs: true
      }
    ),
    uglify(),
    dest(min_js_dest_dir)
  );
}

function minify_fonts() {
  return src(fonts_files)
    .pipe(dest(min_fonts_dest))
}

function minify_img() {
  const imagemin = require('gulp-imagemin');
  
  src(img_files)
    .pipe(imagemin())
    .pipe(dest(min_img_dest));
}

function minify_pages() {
  const htmlmin = require('gulp-htmlmin');

  return src([pages_files])
    .pipe(fileinclude({
      prefix: '@@',
      basepath: '@file'
    }))
    .pipe(htmlmin(
      { 
        collapseWhitespace: true, 
        removeComments: true, 
        caseSensitive: true,
        minifyCSS: true,
        minifyJS: true, 
        minifyURLs: true, 
        removeEmptyAttributes: true,
        removeScriptTypeAttribute: true, 
        removeStyleLinkTypeAttributes: true,
        //sortClassName: true, 
        useShortDoctype: true

      }
    ))
    .pipe(dest(min_pages_dest_dir))
}

function minify_all() {
  minify_fonts();
  minify_img();
  minify_pages();
  minify_js();
  minify_css();
}

function compile_all() {
  pages();
  css();
  js();
  fonts();
  img();
}

function initBrowser() {
  browSync.init({
    port: 3000, 
    server: {
      baseDir: built_path + "/",
    },
  });
}

function watch() {
  gwatch(fonts_watch, fonts);
  gwatch(img_watch, img);
  gwatch(pages_watch, pages);
  gwatch(scss_watch, css);
  gwatch(ts_watch, js);
}

function clean_all(){
  return src(built_path +"/*")
    .pipe(require('gulp-clean')());
}

function ssh_all() {
  const ssh = require('gulp-ssh');
  const gulpSSH = new ssh ({
    ignoreErrors: false,
    sshConfig: sshConfig
  });

  return src(files_to_ssh)
    .pipe(gulpSSH.dest(sshDir));
}

/*======================================== TASKS ===============================*/
task(proj_name, function() { 
  return new Promise(function(resolve, reject) {
    initBrowser()
    compile_all();
    watch();
    resolve();
  });
});

task(proj_name + "_c", function() { 
  return new Promise(function(resolve, reject) {
    console.log("Cleaning...");
    clean_all();
  });
});

task(proj_name + "_m", function() { 
  return new Promise(function(resolve, reject) {
    console.log("Minifying...");
    minify_all();
  });
});

task(proj_name + "_s", function() { 
  return new Promise(function(resolve, reject) {
    console.log("Transferring over ssh...");
    

    ssh_all();
  });
});

task(proj_name + "_hlp", function() { 
  return new Promise(function(resolve, reject) {
    console.log("--hlp            Display this message");
    console.log("--m              Minify css and js");
    console.log("--c              Clean built directory");
    console.log("--s              Transfer built directory to the server using ssh");
  });
});
