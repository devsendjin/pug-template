# Template for markup
Compiling `pug` templates realized with [incremental compilation](https://github.com/mrmlnc/emitty).

About the concept of [incremental compilation](https://canonium.com/articles/emitty/).

*`npm install -g cross-env`* before using this template.

* [The 7-1 Pattern](https://sass-guidelin.es/#the-7-1-pattern) - css architecture used in project.

| Gulp task | Description |
| ------ | ------ |
| `server` | run [browsersync](https://www.browsersync.io/) |
| `sprite` | create `sprite.svg`(from svg files (*/build/img/svg/sprite*) and `_sprite.scss` (inside */dev/scss/modules*) |
| `css` | build styles |
| `js` | transpile *js* files |
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
| `watch:dev` | development mode with enabled server [browsersync](https://www.browsersync.io/) |
| `build:dev` | build without minified styles and scripts
| `watch:prod` | production mode with enabled server [browsersync](https://www.browsersync.io/) |
| `build:prod` | build with minified styles and scripts


| Makefile commands | Description |
| ------ | ------ |
| `start` | remove *build* directory, copy *assets* and build *css, js, pug* in development mode, start watching and server [browsersync](https://www.browsersync.io/) |
| `clear` | remove *build* directory
| `pull` | pull from *master* branch |
| `push` | push to *master* branch |
