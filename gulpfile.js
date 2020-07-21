const { src, dest, parallel, series, task, watch } = require('gulp');

//utils
const sourcemaps = require('gulp-sourcemaps');
const concat = require('gulp-concat');
const gulpIf = require('gulp-if');
const through2 = require('through2');
const emitty = require('@emitty/core').configure();
const path = require('path');

//scss
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const gcmq = require('gulp-group-css-media-queries');
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
const serverEnabled = ['--s', '--serve', '--server'].some(item => process.argv.includes(item));
const isDev = !isProd;

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
            baseDir: './dist',
            directory: true,
        },
        open: false,
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
    return src('./dev/templates/*.pug')
        .pipe(gulpIf(config.isWatchMode, getFilter('templates'))) // Enables filtering only in watch mode
        .pipe(pug())
        .pipe(htmlbeautify(htmlBeautifyOptions))
        .pipe(dest('./dist'))
        .pipe(gulpIf(serverEnabled, browserSync.stream()));
}

const styles = () => {
    return src('./dev/scss/*.scss')
        .pipe(gulpIf(isDev, sourcemaps.init()))
        .pipe(bulkSass())
        .pipe(scss().on('error', scss.logError))
        .pipe(gcmq()) // переносит и объединяет все медиа запросы вниз css файла
        .pipe(autoprefixer())
        .pipe(csso({ restructure: true }))
        .pipe(replace(/[\.\.\/]+images/gmi, '../img')) //заменяем пути к изображениям на правильные
        .pipe(gulpIf(isDev, sourcemaps.write()))
        .pipe(dest('./dist/css'))
        .pipe(gulpIf(serverEnabled, browserSync.stream()));
}

const jsCommon = () => {
    return src([
        './dev/js/vendor/jquery.min.js',
        './dev/js/vendor/jquery.fancybox.min.js',
        './dev/js/common/common.js',
    ])
        .pipe(gulpIf(isDev, sourcemaps.init()))
        .pipe(gulpIf(isProd, babel({
            presets: ['@babel/env']
        })))
        .pipe(gulpIf(isProd, uglify()))
        .pipe(concat('bundle.js'))
        .pipe(gulpIf(isDev, sourcemaps.write()))
        .pipe(dest('./dist/js'))
        .pipe(gulpIf(serverEnabled, browserSync.stream()));
}

const jsPages = () => {
    return src(['./dev/js/pages/*.js'])
        .pipe(gulpIf(isDev, sourcemaps.init()))
        .pipe(gulpIf(isProd, babel({
            presets: ['@babel/env']
        })))
        .pipe(gulpIf(isProd, uglify()))
        .pipe(gulpIf(isDev, sourcemaps.write()))
        .pipe(dest('./dist/js'))
        .pipe(gulpIf(serverEnabled, browserSync.stream()));
}

const createSvgSprite = () => {
    return src('./dist/img/svg/sprite/*.svg')
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
                    sprite: path.resolve('./dist/img/svg/sprite.svg'),
                    render: {
                        scss: {
                            dest: path.resolve('./dev/scss/modules/_sprite.scss'),
                        }
                    }
                }
            },
        }))
        .pipe(dest(function (file) {
            return process.cwd();
        }));
}

const watchTask = () => {
    watch('./dev/templates/**/*.pug', templates)
        .on('all', (event, changed) => {
            // Logs the changed file for the templates task
            config.watch.templates = changed;
        })
    watch('./dev/js/common/*.js', jsCommon);
    // watch('./dev/js/pages/*.js', jsPages);
    watch('./dev/scss/**/*.scss', styles)
}

// need for templates task
const watchInit = (done) => {
    // Enables the watch mode for conditions
    config.isWatchMode = true;
    done();
}

const watchTasks = serverEnabled ? parallel(series(watchInit, templates, watchTask), server) : series(watchInit, templates, watchTask);

const build = parallel(templates, styles, jsCommon);

task('default', watchTasks);
task('server', server);
task('sprite', createSvgSprite);
task('css', styles);
task('js', jsCommon);
task('templates', templates);
task('build', build);
