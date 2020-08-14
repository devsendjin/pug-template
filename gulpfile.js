const { src, dest, parallel, series, task, watch, lastRun } = require('gulp');

//utils
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const gulpIf = require('gulp-if');
const through2 = require('through2');
const emitty = require('@emitty/core').configure();
const path = require('path');
const plumber = require('gulp-plumber');
const size = require('gulp-size');
const remember = require('gulp-remember');

//scss
const postcss = require('gulp-postcss');
const inlineSvg = require('postcss-inline-svg'); // https://www.npmjs.com/package/postcss-inline-svg
const sortMediaQueries = require('postcss-sort-media-queries');
const scss = require('gulp-sass');
const csso = require('gulp-csso');
const bulkSass = require('gulp-sass-bulk-import');

//html
const htmlbeautify = require('gulp-html-beautify');
const pug = require('gulp-pug');

//js
const uglify = require('gulp-uglify');
const babel = require('gulp-babel');

//svg
const svgSprite = require('gulp-svg-sprite');
const cheerio = require('gulp-cheerio');
const replace = require('gulp-replace');

//server
const browserSync = require('browser-sync').create();


emitty.language({
    extensions: ['.pug'],
    parser: require('@emitty/language-pug').parse
});

const isProd = ['--p', '--prod', '--production'].some(item => process.argv.includes(item));
const isDev = !isProd;
const serverEnabled = ['--s', '--serve', '--server'].some(item => process.argv.includes(item));
const openBrowser = serverEnabled && ['--o', '--open'].some(item => process.argv.includes(item));

const config = {
    isWatchMode: false,
    // Changed files are written by the name of the task that will process them.
    // This is necessary to support more than one language in @emitty.
    watch: {
        templates: undefined
    }
}

const server = () => {
    browserSync.init({
        server: {
            baseDir: './build',
            directory: true,
        },
        open: openBrowser,
        notify: false
    });
}

const getFilter = taskName => {
    return through2.obj(function (file, _encoding, callback) {
        emitty.filter(file.path, config.watch[taskName]).then((result) => {
            if (result) {
                this.push(file);
            }

            callback();
        });
    });
}
const templates = () => {
    const htmlBeautifyOptions = {
        // "extra_liners": ['svg'],
        // "unformatted": ['span'],
        'inline': ['br', 'b', 'strong', 'span'],
        'indent_size': 2,
        'indent_char': '\t',
        'indent_with_tabs': true,
        'editorconfig': false,
        'eol': '\n',
        'end_with_newline': true,
        'indent_level': 0,
        'preserve_newlines': false,
        'max_preserve_newlines': 10000
    };
    return src('./src/templates/*.pug')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log('templates ', err.message);
                this.end();
            }
        }))
        .pipe(gulpIf(config.isWatchMode, getFilter('templates'))) // Enables filtering only in watch mode
        .pipe(pug())
        .pipe(htmlbeautify(htmlBeautifyOptions))
        .pipe(gulpIf(isProd, size({ showFiles: true, title: 'HTML' })))
        .pipe(dest('./build'))
        .pipe(gulpIf(serverEnabled, browserSync.stream()));
}

const styles = () => {
    return src('./src/scss/*.scss')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log('styles ', err.message);
                this.end();
            }
        }))
        .pipe(gulpIf(isDev, sourcemaps.init()))
        .pipe(bulkSass())
        .pipe(scss().on('error', scss.logError))
        .pipe(postcss([
            inlineSvg({ removeFill: true, removeStroke: true }),
            sortMediaQueries({
                sort: 'desktop-first'
            })
        ]))
        .pipe(autoprefixer())
        .pipe(csso({ restructure: true }))
        // .pipe(replace(/[\.\.\/]+img/gmi, '../img')) //заменяем пути к изображениям на правильные
        // .pipe(replace(/url\(["']?(?:\.?\.?\/?)*(?:\w*\/)*(\w+)(.svg|.gif|.png|.jpg|.jpeg)["']?\)/gmi, '"../img/$1$2"')) //заменяем пути к изображениям на правильные
        .pipe(gulpIf(isDev, sourcemaps.write()))
        .pipe(gulpIf(isProd, size({ showFiles: true, title: 'CSS' })))
        .pipe(dest('./build/css'))
        .pipe(gulpIf(serverEnabled, browserSync.stream()));
}

const jsCommon = () => {
    return src([
        './src/js/vendor/jquery.min.js',
        './src/js/vendor/jquery.fancybox.min.js',
        './src/js/common/common.js',
    ])
        .pipe(plumber({
            errorHandler: function (err) {
                console.log('jsCommon ', err.message);
                this.end();
            }
        }))
        .pipe(gulpIf(isDev, sourcemaps.init()))
        .pipe(gulpIf(isProd, babel({
            presets: ['@babel/env']
        })))
        .pipe(gulpIf(isProd, uglify()))
        .pipe(concat('bundle.js'))
        .pipe(gulpIf(isDev, sourcemaps.write()))
        .pipe(gulpIf(isProd, size({ showFiles: true, title: 'JS' })))
        .pipe(dest('./build/js'))
        .pipe(gulpIf(serverEnabled, browserSync.stream()));
}

const jsPages = () => {
    return src(['./src/js/pages/*.js'])
        .pipe(plumber({
            errorHandler: function (err) {
                console.log('jsPages ', err.message);
                this.end();
            }
        }))
        .pipe(gulpIf(isDev, sourcemaps.init()))
        .pipe(gulpIf(isProd, babel({
            presets: ['@babel/env']
        })))
        .pipe(gulpIf(isProd, uglify()))
        .pipe(gulpIf(isDev, sourcemaps.write()))
        .pipe(dest('./build/js'))
        .pipe(gulpIf(serverEnabled, browserSync.stream()));
}

const copyJs = () => {
    return src(['./src/js/copyToBuild/*'], { since: lastRun(copyJs) })
        .pipe(remember('copy_js'))
        .pipe(dest('./build/js'))
};
const copyImages = () => {
    return src([
        './src/img/**/*',
        '!./src/img/svg/sprite',
        '!./src/img/svg/sprite/*'
    ], { base: 'src', since: lastRun(copyImages) })
        .pipe(remember('copy_images'))
        .pipe(dest('./build'))
}

const createSvgSprite = () => {
    return src('./build/img/svg/sprite/*.svg')
        .pipe(plumber({
            errorHandler: function (err) {
                console.log(err.message);
                this.end();
            }
        }))
        // remove all fill, style and stroke declarations in out shapes
        .pipe(cheerio({
            run: function ($) {
                $('[fill]').removeAttr('fill');
                $('[stroke]').removeAttr('stroke');
                $('[style]').removeAttr('style');
            },
            parserOptions: {xmlMode: true}
        }))
        // cheerio plugin create unnecessary string '&gt;', so replace it.
        .pipe(replace('&gt;', '>'))
        .pipe(svgSprite({
            mode: {
                symbol: {
                    prefix: '.svg-icon-%s',
                    dimensions: '%s',
                    sprite: '../sprite.svg',
                    render: {
                        scss: {
                            dest: '../../../scss/modules/_sprite.scss',
                        }
                    }
                }
            },
        }))
        .pipe(dest('./src/img/svg'))
}

const watchTask = () => {
    watch('./src/templates/**/*.pug', templates)
        .on('all', (event, changed) => {
            // Logs the changed file for the templates task
            config.watch.templates = changed;
        })
    watch('./src/js/common/*.js', jsCommon);
    // watch('./src/js/pages/*.js', jsPages);
    watch('./src/scss/**/*.scss', styles)
    watch('./src/img/**/*', copyImages);
}

// need for templates task
const watchInit = (done) => {
    // Enables the watch mode for conditions
    config.isWatchMode = true;
    done();
}

const watchTasks = serverEnabled ? parallel(series(watchInit, templates, watchTask), server) : series(watchInit, templates, watchTask);

const build = parallel(templates, styles, jsCommon, copyImages, copyJs);

task('default', watchTasks);
task('server', server);
task('sprite', series(createSvgSprite, copyImages));
task('css', styles);
task('js', jsCommon);
task('copy:img', copyImages);
task('copy:js', copyJs);
task('templates', templates);
task('build', build);
