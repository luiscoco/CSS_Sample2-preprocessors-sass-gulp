import browserSync from 'browser-sync';
import { deleteAsync } from 'del';
import gulp from 'gulp';
import gulpLoadPlugins from 'gulp-load-plugins';
import { hideBin } from 'yargs/helpers';
import pkg from './package.json' assert { type: 'json' };
import yargs from 'yargs/yargs';
import $imagemin from 'gulp-imagemin';

import dartSass from 'sass';
import gulpSass from 'gulp-sass';
const $sass = gulpSass(dartSass);

const bs = browserSync.create();
const $ = gulpLoadPlugins({ config: pkg });
const argv = yargs(hideBin(process.argv)).argv;

function clean() {
	return deleteAsync(['./dist', '!./dist/img']);
}

function html() {
	// prettier-ignore
	return gulp
    .src('./src/index.html')
    .pipe(gulp.dest('./dist'))
    .pipe(bs.stream({ match: '**/*.html' }));
}

// 🕮 <ltc> 0a5c3887-02ab-40ad-b663-200a14569fb5.md
function sass() {
	return (
		gulp
			// 🕮 <ltc> 3ae353c8-432b-48d2-a330-061455d96fc1.md
			.src('./src/examples/*.{scss,sass}')
			// .src('./src/styles/main.scss')
			.pipe($.debug())
			.pipe($.sourcemaps.init())
			.pipe($sass())
			.pipe($.concat('styles.min.css'))
			.pipe($.if(argv.p, $.cleanCss()))
			.pipe($.sourcemaps.write('.'))
			.pipe(gulp.dest('./dist/styles'))
			.pipe(bs.stream({ match: '**/*.css' }))
	);
}

function styl() {
	return gulp
		.src('./src/styl/**/*.styl')
		.pipe($.debug())
		.pipe($.sourcemaps.init())
		.pipe($.stylus())
		.pipe($.concat('styles.min.css'))
		.pipe($.if(argv.p, $.cleanCss()))
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest('./dist/styl'))
		.pipe(bs.stream({ match: '**/*.css' }));
}

function js() {
	return gulp
		.src('./src/js/**/*.js')
		.pipe($.sourcemaps.init())
		.pipe($.concat('script.min.js'))
		.pipe($.if(argv.p, $.terser()))
		.pipe($.sourcemaps.write('.'))
		.pipe(gulp.dest('./dist/js'));
}

function img() {
	return (
		gulp
			.src('./src/img/**/*', { since: gulp.lastRun(img) })
			// .pipe($.debug({title: 'img'}))
			.pipe($imagemin())
			.pipe(gulp.dest('./dist/img'))
			.pipe(bs.stream({ match: '**/*.{jpg,png}' }))
	);
}

function serve() {
	return bs.init({
		server: './dist',
		open: false,
		port: 3000,
	});
}

function setWatch() {
	gulp.watch('./src/examples/**/*.{sass,scss}', sass).on('all', bs.reload);
	gulp.watch('./src/styl/**/*.styl', styl);
	gulp.watch('./src/js/**/*.js', js).on('all', bs.reload);
	gulp.watch('./src/img/**/*', img).on('all', bs.reload);
	gulp.watch('./src/**/*.html', html).on('all', bs.reload);
	console.log('watching files for changes...');
}

const build = gulp.series(
	clean,
	gulp.parallel(html, sass, styl, js, img),
	gulp.parallel(serve, setWatch)
);

export { clean, html, js, sass, styl, img, serve, setWatch, build as default };
// export default build;
