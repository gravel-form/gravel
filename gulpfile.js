const path = require('path');
const gulp = require('gulp');
const through2 = require('through2');
const ts = require('gulp-typescript');
const sourcemaps = require('gulp-sourcemaps');
const merge = require('merge-stream');

const tsConfig = require('./tsconfig.json').compilerOptions;

const tsFiles = ['src/**/*.{ts,tsx}'];

gulp.task('compile', function() {
  var tsResult = gulp
    .src(tsFiles, {
      base: path.join(process.cwd(), 'src'),
    })
    .pipe(sourcemaps.init())
    .pipe(ts(tsConfig));
  return merge(
    tsResult,
    tsResult.js.pipe(
      through2.obj(function(file, encoding, next) {
        console.log(file.path, file.base);
        file.path = file.path.replace(/\.[jt]sx$/, '.js');
        this.push(file);
        next();
      })
    )
  )
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(path.join(process.cwd(), 'lib')));
});
