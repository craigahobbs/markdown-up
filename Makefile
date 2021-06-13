# Licensed under the MIT License
# https://github.com/craigahobbs/markdown-app/blob/main/LICENSE

# Download JavaScript Build
define WGET
ifeq '$$(wildcard $(notdir $(1)))' ''
$$(info Downloading $(notdir $(1)))
_WGET := $$(shell if which wget; then wget -q $(1); else curl -Os $(1); fi)
endif
endef
$(eval $(call WGET, https://raw.githubusercontent.com/craigahobbs/javascript-build/main/Makefile.base))
$(eval $(call WGET, https://raw.githubusercontent.com/craigahobbs/javascript-build/main/jsdoc.json))
$(eval $(call WGET, https://raw.githubusercontent.com/craigahobbs/javascript-build/main/.eslintrc.cjs))

# Set gh-pages source
GHPAGES_SRC := build/app/

# Include JavaScript Build
include Makefile.base

# Exclude external code from coverage
C8_ARGS := $(C8_ARGS) --lines 55.93

# Add README.md to jsdoc args
JSDOC_ARGS := $(JSDOC_ARGS) README.md

clean:
	rm -rf Makefile.base jsdoc.json .eslintrc.cjs

.PHONY: run
run: app
	python3 -m http.server --directory build/app

.PHONY: app
commit: app
app: build/npm.build
	rm -rf build/app/
	mkdir -p build/app/
	cp -R \
		app/* \
		README.md \
		src/markdown-app \
		node_modules/element-model/src/element-model \
		node_modules/markdown-model/src/markdown-model \
		node_modules/schema-markdown/src/schema-markdown \
		build/app/
	for FILE in `find build/app/* -name '*.js'`; do \
		sed -E "s/from '(element-model|markdown-model|schema-markdown)/from '..\/\1/g" $$FILE > $$FILE.tmp && \
		mv $$FILE.tmp $$FILE; \
	done
