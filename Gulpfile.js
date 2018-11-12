var gulp = require('gulp');
var sass = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var browserSync = require('browser-sync').create();
var concat = require('gulp-concat');
var rename = require('gulp-rename');
var uglify = require('gulp-uglify');
var sourcemaps = require('gulp-sourcemaps');

gulp.task('run', ['sass', 'scripts'], function() {

	browserSync.init({
        server: "./"
    });

    gulp.watch("./sass/*.scss", ['sass']);
    gulp.watch('./js/*.js', ['scripts']);
    gulp.watch("./*.html").on('change', browserSync.reload);

});

gulp.task('scripts', function() {
  return gulp.src('./js/*.js')
    .pipe(concat('concat.js'))
    .pipe(gulp.dest('./dist/'))
    .pipe(rename('all.js'))
    .pipe(uglify())
    .pipe(gulp.dest('./dist/'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('./dist/'));
});

//Watch task
gulp.task('sass', function() {
    return gulp.src("./sass/*.scss")
        .pipe(sass({outputStyle: 'compressed'}))
        .pipe(autoprefixer())
        .pipe(gulp.dest("./css"))
        .pipe(browserSync.stream());
});

gulp.task('default', ['run']);