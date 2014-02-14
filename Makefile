REPORTER=dot

serve: node_modules
	@node_modules/serve/bin/serve

test:
	@node_modules/mocha/bin/mocha test/*.test.js \
		--reporter $(REPORTER) \
		--bail

node_modules: package.json
	@packin install --meta $< --folder $@

clean:
	rm -r node_modules

.PHONY: clean serve test