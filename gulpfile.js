var gulp = require('gulp')
var gulpif = require('gulp-if')
var postcss = require('gulp-postcss')
var cssmin = require('gulp-cssmin')
var rename = require('gulp-rename')

var gConn = require("gulp-connect")

var header = require('gulp-header')
var moment = require('moment')
var pkg = require('./package.json')

var banner = ['/*!',
  ' Skeleton Framework - Bone Template', // Rename me
  ' | v<%= pkg.version %>',
  ' | <%= pkg.license %>',
  ' | ' + moment().format("MMM Do, YYYY"),
  ' */',
  '\n \n'
].join('')

var paths = {
  css: {
    src: "src/bone.css",
    dist: "dist",
    dev: "dev/css"
  },

  //js: {
  //  src: "src/bone.js",
  //  dist: "dist",
  //  dev: "dev/js"
  //},

  html: {
    src: "src/test.html",
    dev: "dev"
  },

  //images: {
  //  src: "src/images/*",
  //  dist: "dist/images",
  //  dev: "dev/images"
  //},

  serve: {
    root: "dev"
  },

  watch: ["src/**/*", "dev/**/*"]
}

var processors = [
  require('postcss-import')(),
  require('postcss-custom-properties')(),
  require('postcss-calc')({
    precision: 10
  }),
  require('autoprefixer-core')()
]

var buildTask = function (options) {
  return gulp.src(options.src)
    .pipe(postcss(processors))
    .pipe(gulpif(options.banner, header(banner, { pkg : pkg } )))
    .pipe(gulpif(options.pkgname, rename({ basename: pkg.name })))
    .pipe(gulp.dest(options.dest))
    .pipe(gulpif(options.minify, rename({
      extname: ".min.css"
    })))
    .pipe(gulpif(options.minify, cssmin(options.cssmin)))
    .pipe(gulpif(options.minify, gulp.dest(options.dest)))
}

var copy = function (options) {
  return gulp.src(options.src)
    .pipe(gulp.dest(options.dest))
}

var copyImages = function (options) {
  return gulp.src(options.src)
    .pipe(gulp.dest(options.dest))
}

// TODO: build minified js in dist. For now copy over js unminified.
var copyJS = function (options) {
  return gulp.src(options.src)
    .pipe(gulp.dest(options.dest))
}

function setLiveReload() {
  // if we have a RELOAD thing set, use that
  // otherwise default to false
  if (process.env.RELOAD) {
    return process.env.RELOAD === "true" ? true : false
  } else {
    return false
  }
}

var useLiveReload = setLiveReload()

gulp.task("serve", function () {
  gConn.server({
    root: paths.serve.root,
    port: process.env.PORT || 3000,
    livereload: useLiveReload
  })
})

gulp.task('watch', function () {
  gulp.watch(paths.watch, ['dev'])

  if (useLiveReload)
    gulp.watch(paths.watch, ['reload'])
})

gulp.task('dev', function () {
  buildTask({
    src: paths.css.src,
    banner: false,
    minify: false,
    dest: paths.css.dev,
  })

  copyHTML({
    src: paths.html.src,
    dest: paths.html.dev
  })

  //copyImages({
  //  src: paths.images.src,
  //  dest: paths.images.dev
  //})

  //copyJS({
  //  src: paths.js.src,
  //  dest: paths.js.dev
  //})
})

gulp.task('reload', function () {
  gulp.src(paths.serve.root) // this just watches the dev dir for changes and hits the reload button
    .pipe(gConn.reload())
})

gulp.task('prod', function () {
  buildTask({
    src: paths.css.src,
    banner: true,
    minify: true,
    pkgname: true,
    cssmin: {
      advanced: true,
      aggressiveMerging: true,
      benchmark: false,
      compatibility: '*',
      debug: false,
      keepBreaks: false,
      mediaMerging: true,
      roundingPrecision: 10,
      shorthandCompacting: false
    },
    dest: paths.css.dist,
  })
})

gulp.task('default', ['dev', 'watch', 'serve'])
