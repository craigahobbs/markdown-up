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


# Include javascript-build
USE_JSDOM := 1
include Makefile.base


clean:
	rm -rf Makefile.base jsdoc.json .eslintrc.cjs


help:
	@echo '            [app|run|test-include]'


.PHONY: test-include
commit: test-include
test-include: build/npm.build
	$(NODE_DOCKER) npx bare -s static/include/*.bare static/include/*.mds static/include/test/*.mds
	$(NODE_DOCKER) npx bare -c "include 'static/include/markdownUp.bare'" static/include/test/runTests.mds
	$(NODE_DOCKER) npx bare -c "include 'static/include/markdownUp.bare'" static/include/test/runTests.mds -v vBare 1


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
	$(NODE_DOCKER) npx baredoc lib/scriptLibrary.js > build/app/library/library.json

    # Generate the include library documentation
	$(NODE_DOCKER) npx baredoc static/include/*.mds > build/app/library/include.json

    # Generate the library model documentation
	$(NODE_DOCKER) node --input-type=module -e "$$LIBRARY_MODEL" > build/app/library/model.json


# JavaScript to generate the library model documentation
define LIBRARY_MODEL
import {dataTableTypes} from "./lib/dataTable.js";
import {lineChartTypes} from "./lib/lineChart.js";
const types = {...dataTableTypes, ...lineChartTypes};
console.log(JSON.stringify(types, null, 4));
endef
export LIBRARY_MODEL
