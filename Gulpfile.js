var gulp = require('gulp');

var browserSync = require('browser-sync');

var config = {
  dest: 'public'
};

// Static server
gulp.task('server', function() {
  gulp.watch('src/js/**/*.js', ['js']);
  gulp.watch('src/css/**/*.styl', ['css']);
  gulp.watch('src/html/**/*.jade', ['html']);
  browserSync({
    port: 8888,
    server: {
      baseDir: config.dest
    }
  });
});

var reload = browserSync.reload;

var plumber = require('gulp-plumber');
var babel = require("gulp-babel");

gulp.task("js", function () {
  return gulp.src("src/js/*.js")
    .pipe(plumber())
    .pipe(babel())
    .pipe(gulp.dest(config.dest + '/js'));
});

var stylus = require('gulp-stylus');
gulp.task('css', function() {
  gulp.src('src/css/main.styl')
    .pipe(plumber())
    .pipe(stylus())
    .pipe(gulp.dest(config.dest + '/css'))
    .pipe(reload({stream: true}));
});

var jade = require('gulp-jade');
gulp.task('html', function() {
  gulp.src('src/html/*.jade')
    .pipe(plumber())
    .pipe(jade())
    .pipe(gulp.dest(config.dest))
    .pipe(reload({stream: true}));
});

gulp.task('build', ['js','css','html']);
gulp.task('default',['build','server']);
