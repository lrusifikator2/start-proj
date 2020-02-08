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

/* html */
//const htmlconcat = require('');

/* webpack settings */
const webpack = require('webpack');
let webpackConf;

/*--------- files to compile ---------*/
const jsFiles = ['./src/index.ts', './src/test.ts'];

/* actual webpack */
const config = {
  mode: "development",

  resolve: {
    extensions: ['.ts', '.tsx']
  },

  module: {
    rules: [
      {     
        test: /\.ts?$/,
        loaders: 'ts-loader',
    },
    {
      test: /\.js$/,
      use: ["source-map-loader"],
      enforce: "pre"
    }
  ]
  },
};

function getFileName(file) {
  let slashPos = file.lastIndexOf("/") + 1;
  let dotPos;

  file = file.substr(slashPos);
  dotPos = file.lastIndexOf(".")

  if(dotPos == -1)
    dotPos = file.length;

  return file.substr(0, dotPos);
}

//input files ['file1', 'file2', ... ,'fileN']
//output [config1{}, config2{}, ... , configN{}]
function formConfig(files, dir){
  let ret = [];
  for(let i = 0; i < files.length; i++){
    let conf = Object.assign({}, config, {
      entry: files[i],
      output: {
        filename: getFileName(files[i]) + ".js",
        path: path.resolve(__dirname, dir),
      },
    });
    ret.push(conf);
  }
  return ret;
}


//webpack config
function assets(cb) {
    return new Promise((resolve, reject) => {
        webpack(formConfig(jsFiles, 'dist'), (err, stats) => {
            if (err) {
                return reject(err)
            }
            if (stats.hasErrors()) {
                return reject(new Error(stats.compilation.errors.join('\n')))
            }
            resolve()
        })
    })
}

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
  return src("./" + proj_name + "/js/main.js", { sourcemaps: true })
    .pipe(sourcemaps.init())
    
    .pipe(sourcemaps.write('../maps'))
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

task(proj_name, function() { 
  return new Promise(function(resolve, reject) {
    css();
    js();
    html();
    watch();
    resolve();
  });
});