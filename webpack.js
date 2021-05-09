const Path = require('path');
const Webpack = require('webpack');
const WebpackBar = require('webpackbar');
const TerserPlugin = require("terser-webpack-plugin");

const buildConfig = require('./gulpfile');

const shouldWatch = process.argv.includes('--watch');
const shouldBuild = process.argv.includes('--build');

class PostCompile {
  apply(compiler) {
    compiler.hooks.afterCompile.tap('post-compile', (params) => {
      if (buildConfig.serverEnabled) {
        buildConfig.browserSync.reload();
      }
    });
  }
 }

 const webpackConfig = {
  mode: buildConfig.MODE,
  bail: true,
  entry: Path.join(process.cwd(), 'src/js/bundle.js'),
  output: {
    path: Path.join(process.cwd(), 'build/js'),
    filename: 'bundle.js',
    sourceMapFilename: 'sourcemaps/[name][ext].map', // works only if devtool='source-map'
    publicPath: '/',
  },
  devtool: buildConfig.__DEV__ ? 'eval-cheap-module-source-map' : false,
  target: 'web',
  resolve: {
    extensions: ['.js', '.json'],
  },
  watchOptions: {
    aggregateTimeout: 600,
    ignored: /node_modules/,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-proposal-class-properties'],
          },
        },
        exclude: /node_modules/,
      },
    ],
  },
  optimization: buildConfig.__PROD__ ? {
    nodeEnv: buildConfig.MODE,
    runtimeChunk: false,
    minimize: true,
    sideEffects: true,
    concatenateModules: true,
    emitOnErrors: false,
    removeEmptyChunks: true,
    mergeDuplicateChunks: true,
    removeAvailableModules: true,
    providedExports: true,
    usedExports: true,
    minimizer: [
      new TerserPlugin({
        exclude: /node_modules/,
        extractComments: false,
        terserOptions: buildConfig.terserOptions,
      })
    ],
  } : {},
  plugins: [
    new Webpack.DefinePlugin({
      __DEV__: buildConfig.__DEV__,
      __PROD__: buildConfig.__PROD__,
    }),
    new WebpackBar({}),
    new PostCompile(),
  ],
}

const compiler = Webpack(webpackConfig);

const compilerErrorHandler = (err, stats) => {
  if (err) {
    console.error(err.stack || err);
    if (err.details) {
      console.error(err.details);
    }
    return;
  }

  const info = stats.toJson();

  if (stats.hasErrors()) {
    console.error(info.errors);
  }

  if (stats.hasWarnings()) {
    console.warn(info.warnings);
  }
};

const watch = () => {
  return compiler.watch({
    aggregateTimeout: 300,
  }, compilerErrorHandler);
}

const build = () => {
  return compiler.run(compilerErrorHandler);
}

if (shouldWatch) {
  watch();
} else if(shouldBuild) {
  build();
} else {
  console.error('Missing flag "--watch" or "--build"');
}
