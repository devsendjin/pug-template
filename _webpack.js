const Path = require('path');
const Webpack = require('webpack');
const WebpackBar = require('webpackbar');
const TerserPlugin = require("terser-webpack-plugin");

class PostCompile {
  constructor(options) {
    this.options = {
      serverEnabled: false,
      browserSyncInstance: null,
      ...options,
    };
  }

  apply(compiler) {
    compiler.hooks.afterCompile.tap('post-compile', (params) => {
      if (this.options.serverEnabled && this.options.browserSyncInstance) {
        this.options.browserSyncInstance.reload();
      }
    });
  }
 }

const createWebpackConfig = buildConfig => ({
  mode: buildConfig.MODE,
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
    new PostCompile({
       serverEnabled: buildConfig.serverEnabled,
       browserSyncInstance: buildConfig.browserSync,
      }),
  ],
});

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

module.exports = buildConfig => {
  const webpackConfig = createWebpackConfig(buildConfig);
  const compiler = Webpack(webpackConfig);

  const webpackWatch = () => {
    console.log('webpackWatch');
    return compiler.watch({
      aggregateTimeout: 300,
    }, compilerErrorHandler);
  }

  const webpackBuild = () => {
    return compiler.run(compilerErrorHandler);
  }
  return {
    webpackBuild,
    webpackWatch,
  }
}
