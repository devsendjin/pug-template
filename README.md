# Template for markup
Compiling `pug` templates realized with [incremental compilation](https://github.com/mrmlnc/emitty).

About the concept of [incremental compilation](https://canonium.com/articles/emitty/).

*`npm install -g cross-env`* before using this template.

* [The 7-1 Pattern](https://sass-guidelin.es/#the-7-1-pattern) - css architecture used in project.

| Env variable | Options | Default | Description |
| ------ | ------ | ------ | ------ |
| `JS_BUILD_TOOL` | gulp <br /> webpack | gulp | use gulp or webpack for js bundling |

| Gulp task | Description |
| ------ | ------ |
| `server` | run [browsersync](https://www.browsersync.io/) |
| `sprite` | create `sprite.svg`(from svg files (*/build/img/svg/sprite*) and `_sprite.scss` (inside */dev/scss/modules*) |
| `css` | build styles |
| `js` | transpile *js* files (if JS_BUILD_TOOL === gulp) |
| `copy:img` | copy images from source to build directory |
| `copy:files` | copy other files from source to build directory |
| `templates` | build *html* pages from *pug* |
| `build` | build html && css && js |


| CLI Flag | Description |
| ------ | ------ |
| `--s`, `--serve`, `--server` | enable [browsersync](https://www.browsersync.io/) |
| `--p`, `--prod`, `--production` | with minified styles and scripts |
| `--pug-d`, `--pug-dev`, `--pug-development` | development mode inside *pug* templates |
| `--pug-p`, `--pug-prod`, `--pug-production` | production mode inside *pug* templates |


| NPM command | Description |
| ------ | ------ |
| `watch:dev:gulp` | `gulp` development mode with enabled server [browsersync](https://www.browsersync.io/) |
| `build:dev:gulp` | `gulp` build without minified styles and scripts |
| `build:prod:gulp` | `gulp` build with minified styles and scripts |
| `watch:dev:webpack` | `webpack` development mode, watching files |
| `build:dev:webpack` | `webpack` development mode, bundling js without minification |
| `build:prod:webpack` | `webpack` bundling js with minification |
| `clean` | removing `build` directory |


| Makefile commands | Description |
| ------ | ------ |
| `start` | start watching and server, mode `development` [browsersync](https://www.browsersync.io/) |
| `start-webpack` | start watching js with webpack, other assets with gulp and server, mode `development` [browsersync](https://www.browsersync.io/) |
| `dev` | remove `build` directory + building with `gulp`, mode `development` |
| `prod` | remove `build` directory + building with `gulp`, with minification |
| `watch` | remove `build` directory + building with `gulp`, with minification |
