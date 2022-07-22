# Licensed under the MIT License
# https://github.com/craigahobbs/markdown-up/blob/main/LICENSE


# Download javascript-build
define WGET
ifeq '$$(wildcard $(notdir $(1)))' ''
$$(info Downloading $(notdir $(1)))
_WGET := $$(shell $(call WGET_CMD, $(1)))
endif
endef
WGET_CMD = if which wget; then wget -q -c $(1); else curl -f -Os $(1); fi
$(eval $(call WGET, https://raw.githubusercontent.com/craigahobbs/javascript-build/main/Makefile.base))
$(eval $(call WGET, https://raw.githubusercontent.com/craigahobbs/javascript-build/main/jsdoc.json))
$(eval $(call WGET, https://raw.githubusercontent.com/craigahobbs/javascript-build/main/.eslintrc.cjs))


# Set gh-pages source
GHPAGES_SRC := build/app/


# This project is alpha so don't check coverage
C8_ARGS ?= --all --allowExternal --src lib/ --src test/


# Include javascript-build
include Makefile.base


clean:
	rm -rf Makefile.base jsdoc.json .eslintrc.cjs


help:
	@echo '            [app|run|'


.PHONY: run
run: app
	python3 -m http.server --directory build/app


.PHONY: app
commit: app
app: build/npm.build
	rm -rf build/app/
	mkdir -p build/app/

    # Copy dependencies
	cp -R \
		README.md \
		static/* \
		lib \
		node_modules/calc-script \
		node_modules/element-model \
		node_modules/markdown-model \
		node_modules/markdown-model/static/markdown-model.css \
		node_modules/schema-markdown \
		node_modules/schema-markdown-doc \
		build/app/

    # Fix imports
	for FILE in `find build/app/*/lib -name '*.js'`; do \
		sed -E "s/from '([^\.])/from '..\/..\/\1/g" $$FILE > $$FILE.tmp && \
		mv $$FILE.tmp $$FILE; \
	done
	for FILE in `find build/app/* -name '*.js'`; do \
		sed -E "s/from '([^\.])/from '..\/\1/g" $$FILE > $$FILE.tmp && \
		mv $$FILE.tmp $$FILE; \
	done

    # Generate MarkdownScript library documentation
	$(NODE_DOCKER) npx calcScriptDoc lib/script.js > build/app/library/library.json
