EXPORT = equal

all: clean build test

install: components

components:
	@component install -d

build: install
	@component build -dv

test:
	@node_modules/.bin/mocha -R spec test/*.test.js

debug:
	@node_modules/.bin/mocha debug test/*.test.js

build-test:
	@node_modules/.bin/bigfile --entry=test/browser.js --write=test/built.js -lb

dist:
	@rm -rf dist
	@mkdir dist
	@node_modules/.bin/bigfile --entry=src/index.js --write=dist/equal.js -p -x $(EXPORT)

clean:
	@rm -rf dist test/built.js components build

Readme.md: src/index.js docs/head.md docs/tail.md
	@cat docs/head.md > Readme.md
	@cat src/index.js\
	 | sed s/.*=.$$//\
	 | dox -a >> Readme.md
	@cat docs/tail.md >> Readme.md

.PHONY: all build test build-test clean install dist
