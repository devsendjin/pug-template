branch = master

all: placeholder;

placeholder:
	@echo 'Hey, are you familiar with makefile?' && \
	echo 'Take a look at project Makefile'

start: clear
	@npm run dev:build && \
	npm run dev:watch

clear:
	@rm -rf build/

node-refresh:
	@rm -rf node_modules/ && npm install

# GIT
pull:
	@git pull origin $(branch)

push:
	@git push origin $(branch)
