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
	@echo '            [app|run|tarball|test-include]'


.PHONY: test-include
commit: test-include
test-include: build/npm.build
	$(NODE_SHELL) npx bare -s static/include/*.bare static/include/test/*.bare
	$(NODE_SHELL) npx bare -c "include 'static/include/markdownUp.bare'" static/include/test/runTests.bare$(if $(DEBUG), -d)$(if $(TEST), -v vTest "'$(TEST)'")
	$(NODE_SHELL) npx bare -c "include 'static/include/markdownUp.bare'" static/include/test/runTests.bare$(if $(DEBUG), -d)$(if $(TEST), -v vTest "'$(TEST)'") -v vBare 1


.PHONY: app run tarball
run: app
	python3 -m http.server --directory build/app


build/npm.build: build/bare-script-library-app.bare
build/bare-script-library-app.bare:
	mkdir -p build/bare-script-library
	cd build && $(call WGET_CMD, https://craigahobbs.github.io/bare-script/library/app.bare) && mv app.bare $(notdir $@)


build/npm.build: build/bare-script-library.json
build/bare-script-library.json:
	mkdir -p build
	cd build && $(call WGET_CMD, https://craigahobbs.github.io/bare-script/library/library.json) && mv library.json $(notdir $@)


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
		node_modules/schema-markdown-doc \
		build/doc \
		build/markdown-up.tar.gz \
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

    # Generate the library documentation
	$(NODE_SHELL) npx baredoc lib/scriptLibrary.js -o build/app/library/library.json

    # Generate the single-page library documentation
	cd build/app/library/ && \
	$(NODE_SHELL) npx bare -m ../../bare-script-library-app.bare \
		-v vSingle true -v vPublish true -v 'vBareScriptURL' "'../../bare-script-library.json'" \
		-c "baredocMain(arrayNew('library.json', vBareScriptURL), 'The MarkdownUp Library')" \
		> markdownup-library.md

    # Generate the include library documentation
	$(NODE_SHELL) npx baredoc static/include/*.bare -o build/app/library/include.json

    # Generate the single-page include library documentation
	cd build/app/library/ && \
	$(NODE_SHELL) npx bare -m ../../bare-script-library-app.bare \
		-v vSingle true -v vPublish true \
		-c "baredocMain('include.json', 'The MarkdownUp Include Library', null, 'includeContent.json')" \
		> markdownup-include-library.md

    # Generate the library model documentation
	$(NODE_SHELL) node --input-type=module -e "$$LIBRARY_MODEL_JS" build/app/library/model.json

    # Generate the include library model documentation
	$(NODE_SHELL) node --input-type=module -e "$$INCLUDE_LIBRARY_MODEL_JS" build/app/library/includeModel.json


tarball: build/npm.build
	rm -rf build/markdown-up
	mkdir -p build/markdown-up

    # Statics
	date -I > build/markdown-up/VERSION.txt
	cp static/app.css build/markdown-up
	cp -R static/include build/markdown-up
	rm -rf build/markdown-up/include/test

    # Application
	cp -R lib build/markdown-up

    # bare-script
	mkdir -p build/markdown-up/bare-script
	cp -R node_modules/bare-script/lib build/markdown-up/bare-script
	rm -rf \
		build/markdown-up/bare-script/lib/bare.js \
		build/markdown-up/bare-script/lib/baredoc.js \
		build/markdown-up/bare-script/lib/include/

    # element-model
	mkdir -p build/markdown-up/element-model
	cp -R node_modules/element-model/lib build/markdown-up/element-model

    # markdown-model
	mkdir -p build/markdown-up/markdown-model
	cp -R node_modules/markdown-model/lib build/markdown-up/markdown-model
	mkdir -p build/markdown-up/markdown-model/static
	cp node_modules/markdown-model/static/markdown-model.css build/markdown-up/markdown-model/static

    # schema-markdown-doc
	mkdir -p build/markdown-up/schema-markdown
	cp -R node_modules/schema-markdown/lib build/markdown-up/schema-markdown

    # schema-markdown-doc
	mkdir -p build/markdown-up/schema-markdown-doc
	cp -R node_modules/schema-markdown-doc/lib build/markdown-up/schema-markdown-doc

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
	cd build && find markdown-up -type f -print0 | sort -z | \
		tar --null --files-from=- --owner=0 --group=0 --numeric-owner -czvf markdown-up.tar.gz


gh-pages:
    # Revert the tarball unless its contents have changed
	rm -rf build/markdown-up.orig
	mkdir build/markdown-up.orig
	cd ../$(notdir $(CURDIR)).gh-pages && git restore markdown-up.tar.gz
	tar -xvf ../$(notdir $(CURDIR)).gh-pages/markdown-up.tar.gz -C build/markdown-up.orig
	if ! diff -r --exclude=VERSION.txt build/markdown-up build/markdown-up.orig/markdown-up >/dev/null; then \
		cp build/markdown-up.tar.gz ../$(notdir $(CURDIR)).gh-pages/markdown-up.tar.gz; \
	fi


# JavaScript to generate the library model documentation
define LIBRARY_MODEL_JS
import {argv} from 'node:process';
import {dataTableTypes} from "./lib/dataTable.js";
import {documentKeyEventTypes} from "./lib/scriptLibrary.js";
import {lineChartTypes} from "./lib/lineChart.js";
import {valueJSON} from 'bare-script/lib/value.js';
import {writeFileSync} from 'node:fs';

// Command-line arguments
const [, typeModelPath] = argv;

// Create the library type model
const types = {...dataTableTypes, ...documentKeyEventTypes, ...lineChartTypes};

// Write the library type model
writeFileSync(typeModelPath, valueJSON(types));
endef
export LIBRARY_MODEL_JS


# BareScript to write the include library model documentation
define INCLUDE_LIBRARY_MODEL_JS
import {fetchReadWrite, logStdout} from 'bare-script/lib/optionsNode.js';
import {argv} from 'node:process';
import {executeScriptAsync} from 'bare-script/lib/runtimeAsync.js';
import {parseScript} from 'bare-script/lib/parser.js';
import {valueJSON} from 'bare-script/lib/value.js';
import {writeFileSync} from 'node:fs';

// Command-line arguments
const [, typeModelPath] = argv;

// Create the include library type model
const script = parseScript(`
include 'static/include/args.bare'
include 'static/include/diff.bare'
include 'static/include/pager.bare'

includeTypes = objectNew()
objectAssign(includeTypes, argsTypes)
objectAssign(includeTypes, diffTypes)
objectAssign(includeTypes, pagerTypes)
return includeTypes
`);
const includeTypes = await executeScriptAsync(script, {'fetchFn': fetchReadWrite, 'logFn': logStdout});

// Write the include library type model
writeFileSync(typeModelPath, valueJSON(includeTypes));
endef
export INCLUDE_LIBRARY_MODEL_JS
