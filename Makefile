REPORTER=dot

serve: node_modules
	@node_modules/serve/bin/serve -Slojp 0

test: node_modules
	@node_modules/mocha/bin/mocha test/*.test.js \
		--reporter $(REPORTER) \
		--bail
		@sed "s/'equals'/'.\/'/" Readme.md | node_modules/jsmd/bin/jsmd

node_modules: package.json
	@packin install --meta $< --folder $@

clean:
	rm -r node_modules

.PHONY: clean serve test