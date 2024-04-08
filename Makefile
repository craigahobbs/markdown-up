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
$(eval $(call WGET, https://raw.githubusercontent.com/craigahobbs/javascript-build/main/eslint.config.js))


# Set gh-pages source
GHPAGES_SRC := build/app/


# Include javascript-build
USE_JSDOM := 1
include Makefile.base


clean:
	rm -rf Makefile.base jsdoc.json eslint.config.js


help:
	@echo '            [app|run|test-include|test-launcher]'


.PHONY: test-include
commit: test-include
test-include: build/npm.build
	$(NODE_DOCKER) npx bare -s static/include/*.bare static/include/*.mds static/include/test/*.mds
	$(NODE_DOCKER) npx bare -c "include 'static/include/markdownUp.bare'" static/include/test/runTests.mds$(if $(DEBUG), -d)$(if $(TEST), -v vTest "'$(TEST)'")
	$(NODE_DOCKER) npx bare -c "include 'static/include/markdownUp.bare'" static/include/test/runTests.mds$(if $(DEBUG), -d)$(if $(TEST), -v vTest "'$(TEST)'") -v vBare 1


.PHONY: test-launcher
commit: test-launcher
test-launcher: build/npm.build
	$(NODE_DOCKER) npx bare -s static/launcher/*.mds static/launcher/test/*.mds
	$(NODE_DOCKER) npx bare -c "include 'static/include/markdownUp.bare'" static/launcher/test/runTests.mds$(if $(DEBUG), -d)$(if $(TEST), -v vTest "'$(TEST)'")


.PHONY: app run
run: app
	python3 -m http.server --directory build/app


commit: app
app: doc
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
	$(NODE_DOCKER) npx baredoc lib/scriptLibrary.js -o build/app/library/library.json

    # Generate the include library documentation
	$(NODE_DOCKER) npx baredoc static/include/*.mds -o build/app/library/include.json

    # Generate the library model documentation
	$(NODE_DOCKER) node --input-type=module -e "$$LIBRARY_MODEL_JS" build/app/library/model.json

    # Generate the include library model documentation
	$(NODE_DOCKER) node --input-type=module -e "$$INCLUDE_LIBRARY_MODEL_JS" build/app/library/includeModel.json


# JavaScript to generate the library model documentation
define LIBRARY_MODEL_JS
import {argv} from 'node:process';
import {dataTableTypes} from "./lib/dataTable.js";
import {lineChartTypes} from "./lib/lineChart.js";
import {valueJSON} from 'bare-script/lib/value.js';
import {writeFileSync} from 'node:fs';

// Command-line arguments
const [, typeModelPath] = argv;

// Create the library type model
const types = {...dataTableTypes, ...lineChartTypes};

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
include './static/include/args.mds'
include './static/include/pager.mds'

includeTypes = objectNew()
objectAssign(includeTypes, argsTypes)
objectAssign(includeTypes, pagerTypes)
return includeTypes
`);
const includeTypes = await executeScriptAsync(script, {'fetchFn': fetchReadWrite, 'logFn': logStdout});

// Write the include library type model
writeFileSync(typeModelPath, valueJSON(includeTypes));
endef
export INCLUDE_LIBRARY_MODEL_JS
