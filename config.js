const Path = require('path');

// server
const browserSync = require('browser-sync').create();

const MODE = process.env.NODE_ENV || 'development';
const __PROD__ = (MODE === 'production') || ['--p', '--prod', '--production'].some(item => process.argv.includes(item));
const __DEV__ = (MODE === 'development') || ['--d', '--dev', '--development'].some(item => process.argv.includes(item));

const useGulpForJs = (process.env.JS_BUILD_TOOL || 'gulp') === 'gulp';

const serverEnabled = ['--s', '--serve', '--server'].some(item => process.argv.includes(item));
const shouldOpenBrowser = serverEnabled && ['--o', '--open'].some(item => process.argv.includes(item));

const terserOptions = {
  parse: {
    html5_comments: false
  },
  mangle: true,
  sourceMap: false, // false by default. Handled by 'gulp-sourcemaps'.
  compress: {
    defaults: true,
    drop_console: false, // false by default. Pass true to discard calls to console.* functions.
    keep_infinity : true, // false by default. Pass true to prevent Infinity from being compressed into 1/0, which may cause performance issues on Chrome.
    passes: 2, // 1 by default. The maximum number of times to run compress.
  },
  format: {
    comments: false, // "some" by default
    preamble : null, // null by default. When passed it must be a string and it will be prepended to the output literally. The source map will adjust for this text. Can be used to insert a comment containing licensing information, for example.
    quote_style: 3, // 0 by default. 3 - always use the original quotes.
    preserve_annotations: false, // false by default.
    ecma: 2019, // 5 by default. Desired EcmaScript standard version for output.
  },
  ecma: 2019, // 5 by default. Desired EcmaScript standard version for output.
  keep_classnames: false, // undefined by default.
  keep_fnames: false, // false by default.
  safari10: false, // false by default.
};

const paths = {
	// source_directory: Path.join(process.cwd(), 'src'),
	// build_directory: Path.join(process.cwd(), 'build'),
	source_directory: './src',
	build_directory: './build',
	sourcemaps: '../sourcemaps',
	get js() {
		return {
			src: `${this.source_directory}/js`,
			build: `${this.build_directory}/js`,
			watch: [
        `${this.source_directory}/js/**/*.js`,
        `!${this.source_directory}/js/pages`,
        `!${this.source_directory}/js/pages/*.js`
      ],
		}
	},
	get jsPages() {
		return {
			src: `${this.source_directory}/js/pages/*.js`,
			build: `${this.build_directory}/js`,
			watch: `${this.source_directory}/js/pages/*.js`,
		}
	},
	get scss() {
		return {
			src: `${this.source_directory}/scss/*.scss`,
			build: `${this.build_directory}/css`,
			watch: [
        `${this.source_directory}/scss/**/*.scss`,
      ],
		}
	},
	get pug() {
		return {
			src: `${this.source_directory}/templates/*.pug`,
			build: this.build_directory,
			watch: `${this.source_directory}/templates/**/*.pug`,
		}
	},
	get img() {
		return {
			src: `${this.source_directory}/images`,
			build: this.build_directory,
			watch: `${this.source_directory}/images/**/*`,
		}
	},
}

const server = () => {
	browserSync
    .init({
      server: {
        baseDir: paths.build_directory,
        directory: true,
      },
      port: 3333,
      open: shouldOpenBrowser,
      reloadOnRestart: true,
      notify: false,
    });
}

module.exports = {
  MODE,
  __PROD__,
  __DEV__,
  serverEnabled,
  useGulpForJs,
  terserOptions,
  paths,
  server,
  browserSync,
};
