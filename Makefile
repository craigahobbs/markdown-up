# Licensed under the MIT License
# https://github.com/craigahobbs/markdown-up/blob/main/LICENSE


# Download javascript-build
JAVASCRIPT_BUILD_DIR ?= ../javascript-build
define WGET
ifeq '$$(wildcard $(notdir $(1)))' ''
$$(info Downloading $(notdir $(1)))
$$(shell [ -f $(JAVASCRIPT_BUILD_DIR)/$(notdir $(1)) ] && cp $(JAVASCRIPT_BUILD_DIR)/$(notdir $(1)) . || $(call WGET_CMD, $(1)))
endif
endef
WGET_CMD = if command -v wget >/dev/null 2>&1; then wget -q -c $(1); else curl -f -Os $(1); fi
$(eval $(call WGET, https://craigahobbs.github.io/javascript-build/Makefile.base))
$(eval $(call WGET, https://craigahobbs.github.io/javascript-build/jsdoc.json))
$(eval $(call WGET, https://craigahobbs.github.io/javascript-build/eslint.config.js))


# Set gh-pages source
GHPAGES_SRC := build/app/


# Include javascript-build
USE_JSDOM := 1
include Makefile.base


clean:
	rm -rf Makefile.base jsdoc.json eslint.config.js


help:
	@echo '            [app|run|tarball]'


.PHONY: app run tarball
run: app
	python3 -m http.server --directory build/app


commit: app
app: doc tarball
	rm -rf build/app/
	mkdir -p build/app/

    # Copy dependencies
	cp -R \
		README.md \
		static/* \
		lib \
		node_modules/bare-script \
		node_modules/element-model \
		node_modules/markdown-model \
		node_modules/schema-markdown \
		build/doc \
		build/markdown-up.tar.gz \
		build/app/
	mv build/app/bare-script/lib/include/ build/app/

    # Fix imports
	for FILE in `find build/app/*/lib -name '*.js'`; do \
		sed -E "s/from '([^\.])/from '..\/..\/\1/g" $$FILE > $$FILE.tmp && \
		mv $$FILE.tmp $$FILE; \
	done
	for FILE in `find build/app/* -name '*.js'`; do \
		sed -E "s/from '([^\.])/from '..\/\1/g" $$FILE > $$FILE.tmp && \
		mv $$FILE.tmp $$FILE; \
	done


tarball: build/npm.build
	rm -rf build/markdown-up
	mkdir -p build/markdown-up

    # Statics
	date -I > build/markdown-up/VERSION.txt
	cp static/app.css build/markdown-up
	rm -rf build/markdown-up/include/test

    # Application
	cp -R lib build/markdown-up

    # bare-script
	mkdir -p build/markdown-up/bare-script
	cp -R node_modules/bare-script/lib build/markdown-up/bare-script
	rm -rf \
		build/markdown-up/bare-script/lib/bare.js \
		build/markdown-up/bare-script/lib/baredoc.js
	mv build/markdown-up/bare-script/lib/include/ build/markdown-up/

    # element-model
	mkdir -p build/markdown-up/element-model
	cp -R node_modules/element-model/lib build/markdown-up/element-model

    # markdown-model
	mkdir -p build/markdown-up/markdown-model
	cp -R node_modules/markdown-model/lib build/markdown-up/markdown-model
	mkdir -p build/markdown-up/markdown-model/static
	cp node_modules/markdown-model/static/markdown-model.css build/markdown-up/markdown-model/static

    # schema-markdown
	mkdir -p build/markdown-up/schema-markdown
	cp -R node_modules/schema-markdown/lib build/markdown-up/schema-markdown

    # Fix imports
	for FILE in `find build/markdown-up/*/lib -name '*.js'`; do \
		sed -E "s/from '([^\.])/from '..\/..\/\1/g" $$FILE > $$FILE.tmp && \
		mv $$FILE.tmp $$FILE; \
	done
	for FILE in `find build/markdown-up/* -name '*.js'`; do \
		sed -E "s/from '([^\.])/from '..\/\1/g" $$FILE > $$FILE.tmp && \
		mv $$FILE.tmp $$FILE; \
	done

    # Normalize the tarball file permissions
	find build/markdown-up -type f -exec chmod 644 {} \;

    # Create the tarball
	rm -f build/markdown-up.tar.gz
	if [ "`uname -s`" = 'Darwin' ]; then \
		cd build && find markdown-up -type f -print0 | sort -z | \
			tar --null --no-mac-metadata --files-from=- --owner=0 --group=0 --numeric-owner -czvf markdown-up.tar.gz; \
	else \
		cd build && find markdown-up -type f -print0 | sort -z | \
			tar --null --files-from=- --owner=0 --group=0 --numeric-owner -czvf markdown-up.tar.gz; \
	fi


gh-pages:
    # Revert the tarball unless its contents have changed
	rm -rf build/markdown-up.orig
	mkdir build/markdown-up.orig
	cd ../$(notdir $(CURDIR)).gh-pages && git restore markdown-up.tar.gz
	tar -xvf ../$(notdir $(CURDIR)).gh-pages/markdown-up.tar.gz -C build/markdown-up.orig
	if ! diff -r --exclude=VERSION.txt build/markdown-up build/markdown-up.orig/markdown-up >/dev/null; then \
		cp build/markdown-up.tar.gz ../$(notdir $(CURDIR)).gh-pages/markdown-up.tar.gz; \
	fi
