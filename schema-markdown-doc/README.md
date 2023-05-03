# schema-markdown-doc

[![npm](https://img.shields.io/npm/v/schema-markdown-doc)](https://www.npmjs.com/package/schema-markdown-doc)
[![GitHub](https://img.shields.io/github/license/craigahobbs/schema-markdown-doc)](https://github.com/craigahobbs/schema-markdown-doc/blob/main/LICENSE)

The schema-markdown-doc package generates documentation for
[Schema Markdown](https://github.com/craigahobbs/schema-markdown-js)
schemas.


## Links

- [API Documentation](https://craigahobbs.github.io/schema-markdown-doc/)
- [Source code](https://github.com/craigahobbs/schema-markdown-doc)



## The Schema Markdown Documentation Component

The
[schemaMarkdownDoc](https://craigahobbs.github.io/schema-markdown-doc/module-lib_schemaMarkdownDoc.html#.schemaMarkdownDoc)
function generates the
[element model](https://github.com/craigahobbs/element-model#readme)
for a Schema Markdown user type's documentation. For example:

~~~ javascript
import {parseSchemaMarkdown} from 'schema-markdown/lib/parser.js';
import {schemaMarkdownDoc} from 'schema-markdown-doc/lib/schemaMarkdownDoc.js';

const types = parseSchemaMarkdown(`\
# My struct
struct MyStruct

    # My member
    string member
`);
const elements = schemaMarkdownDoc(types, 'MyStruct');
~~~

The element model is rendered using element-model's
[renderElements](https://craigahobbs.github.io/element-model/module-lib_elementModel.html#.renderElements)
function.

~~~ javascript
import {renderElements} from 'element-model/lib/elementModel.js';

renderElements(window.document.body, elements);
~~~


## The Schema Markdown Documentation Viewer

To host your Schema Markdown type model's documentation, first, download the schema-markdown-doc
application stub to the directory containing your type model's JSON:

~~~
curl -O https://craigahobbs.github.io/schema-markdown-doc/extra/index.html
~~~

By default, the schema-markdown-doc application stub displays documentation for "model.json". You can
override the resource URL and specify a schema title by updating the schema-markdown-doc application
stub, "index.html". For example:

```
~~~ markdown-script
include 'https://craigahobbs.github.io/schema-markdown-doc/doc/app.mds'
schemaMarkdownDoc('myModel.json', 'My Model')
~~~
```

To host locally, start a local static web server:

~~~
python3 -m http.server
~~~

You can also override the resource URL by adding the "var.vURL" hash parameter (i.e., "#var.vURL='myModel.json'").


## Development

This package is developed using [javascript-build](https://github.com/craigahobbs/javascript-build#readme).
It was started using [javascript-template](https://github.com/craigahobbs/javascript-template#readme) as follows:

~~~
template-specialize javascript-template/template/ schema-markdown-doc/ -k package schema-markdown-doc -k name 'Craig A. Hobbs' -k email 'craigahobbs@gmail.com' -k github 'craigahobbs' -k noapp 1
~~~
