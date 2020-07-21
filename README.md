# Template for markup
Compiling `pug` templates realized with [incremental compilation](https://github.com/mrmlnc/emitty).

About concept of [incremental compilation](https://canonium.com/articles/emitty/).

| Gulp task | Description |
| ------ | ------ |
| `server` | run [browsersync](https://www.browsersync.io/) |
| `sprite` | create `sprite.svg`(from svg files (*/build/img/svg/sprite*) and `_sprite.scss` (inside */dev/scss/modules*) |
| `css` | build styles |
| `js` | build bundle.js |
| `templates` | build *html* pages from *pug* |
| `build` | build html && css && js |


| CLI Flag | Description |
| ------ | ------ |
| `--s`, `--serve`, `--server` | enable [browsersync](https://www.browsersync.io/) |
| `--p`, `--prod`, `--production` | with minified styles and scripts |
| `--pug-dev`, `--pug-development` | development mode inside pug templates |
| `--pug-p`, `--pug-prod`, `--pug-production` | production mode inside pug templates |
