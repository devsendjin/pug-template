branch = master

all: placeholder;

placeholder:
	@echo 'Hey, are you familiar with makefile?' && \
	echo 'Take a look at project Makefile'

start: clean dev watch

dev: clean
	@npm run build:dev

prod: clean
	@npm run build:prod

watch:
	@npm run watch:dev

clean:
	@rm -rf build/

node-refresh:
	@rm -rf node_modules/ && npm install

# GIT
pull:
	@git pull origin $(branch)

push:
	@git push origin $(branch)
