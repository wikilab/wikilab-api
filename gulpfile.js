var gulp = require('gulp');
var gutil = require('gulp-util');
var gulpif = require('gulp-if');
var livereload = require('gulp-livereload');

var argv = require('yargs').argv;
// less
var less = require('gulp-less');
var LessPluginCleanCSS = require("less-plugin-clean-css");
var cleancss = new LessPluginCleanCSS({ advanced: true });
var LessPluginAutoPrefix = require('less-plugin-autoprefix');
var autoprefix= new LessPluginAutoPrefix({ browsers: ['last 2 versions'] });
var sourcemaps = require('gulp-sourcemaps');
// js
var watchify = require('watchify');
var browserify = require('browserify');
var source = require('vinyl-source-stream');

// gulp build --production
var production = !!argv.production;
// determine if we're doing a build
// and if so, bypass the livereload
var build = argv._.length ? argv._[0] === 'build' : false;
var watch = argv._.length ? argv._[0] === 'watch' : true;

// ----------------------------
// Error notification methods
// ----------------------------
var beep = function() {
  var os = require('os');
  var file = 'gulp/error.wav';
  var exec = require('child_process').exec;
  if (os.platform() === 'linux') {
    // linux
    exec('aplay ' + file);
  } else {
    // mac
    console.log('afplay ' + file);
    exec('afplay ' + file);
  }
};
var handleError = function(task) {
  var notify = require('gulp-notify');
  return function(err) {
    beep();
    notify.onError({
      message: task + ' failed, check the logs..',
      sound: false
    })(err);
    gutil.log(gutil.colors.bgRed(task + ' error:'), gutil.colors.red(err));
  };
};

gulp.task('clean', function(cb) {
  require('del')(['build/'], cb);
});

gulp.task('assets', function() {
  return gulp.src('./client/assets/**/*')
    .pipe(gulp.dest('build/assets/'));
});
gulp.task('less', function() {
  return gulp.src('./client/styles/*.less')
    // sourcemaps + less + error handling
    .pipe(gulpif(!production, sourcemaps.init()))
    .pipe(less({
      plugins: [autoprefix, cleancss]
    }))
    .on('error', handleError('LESS'))
    // generate .maps
    .pipe(gulpif(!production, sourcemaps.write({
      'includeContent': false,
      'sourceRoot': '.'
    })))
    // autoprefixer
    .pipe(gulpif(!production, sourcemaps.init({
      'loadMaps': true
    })))
    .pipe(gulp.dest('build/css'))
    .pipe(livereload());
});

gulp.task('browserify', function() {
  var bundler = browserify('./client/scripts/index.js', {
    debug: !production,
    cache: {}
  });
  if (watch) {
    bundler = watchify(bundler);
  }
  var rebundle = function() {
    gutil.log('Starting ' + gutil.colors.blue('rebundle') + '...');
    return bundler.bundle()
      .on('error', handleError('Browserify'))
      .pipe(source('index.js'))
      .pipe(gulpif(production, require('vinyl-buffer')()))
      .pipe(gulpif(production, require('gulp-uglify')()))
      .pipe(gulp.dest('build/scripts/'))
      .on('end', function() {
        gutil.log('Finished ' + gutil.colors.blue('rebundle'));
      });
  };
  bundler.on('update', rebundle);
  return rebundle();
});

gulp.task('watch', ['assets', 'less', 'browserify'], function() {
  livereload.listen();
  gulp.watch('./client/styles/**/*.less', ['less']);
  gutil.log(gutil.colors.bgGreen('Watching for changes...'));
});

// build task
gulp.task('build', [
  'clean',
  'assets',
  'less',
  'browserify'
]);

gulp.task('default', ['watch']);

// gulp (watch) : for development and livereload
// gulp build : for a one off development build
// gulp build --production : for a minified production build
