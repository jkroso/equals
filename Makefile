EXPORT = equal
SRC = src/*.js
GRAPH = node_modules/.bin/sourcegraph.js src/index.js --plugins=javascript,nodeish
BIGFILE = node_modules/.bin/bigfile -p nodeish --export $(EXPORT)

all: clean dist dist/equals.min.js test Readme.md

browser: dist/equals.min.js.gz dist/equals.js

dist:
	@mkdir dist

dist/equals.min.js.gz: dist/equals.min.js
	@gzip --best -c dist/equals.min.js > dist/equals.min.js.gz

dist/equals.min.js:
	@$(GRAPH) | $(BIGFILE)\
		--production > dist/equals.min.js

dist/equals.js:
	@$(GRAPH) | $(BIGFILE) > dist/equals.js

test:
	@node_modules/.bin/mocha -R spec test/*.test.js

test/built.js: src/*.js test/*.test.js test/browser.js
	@node_modules/.bin/sourcegraph.js test/browser.js \
		--plugins mocha,nodeish,javascript \
		| node_modules/.bin/bigfile \
		 	--export null \
		 	--plugins nodeish > test/built.js

clean:
	@rm -rf dist test/built.js components build

Readme.md: src/index.js docs/head.md docs/tail.md
	@cat docs/head.md > Readme.md
	@cat src/index.js\
	 | sed s/.*=.$$//\
	 | dox -a >> Readme.md
	@cat docs/tail.md >> Readme.md

.PHONY: all build test build-test clean dist
