# schema-markdown-doc

[![npm](https://img.shields.io/npm/v/schema-markdown-doc)](https://www.npmjs.com/package/schema-markdown-doc)
[![GitHub](https://img.shields.io/github/license/craigahobbs/schema-markdown-doc)](https://github.com/craigahobbs/schema-markdown-doc/blob/main/LICENSE)

[schema-markdown-doc Application](https://craigahobbs.github.io/schema-markdown-doc/)

[schema-markdown-doc API Documentation](https://craigahobbs.github.io/schema-markdown-doc/doc/)

**schema-markdown-doc** is a JavaScript viewer application for
[Schema Markdown Type Models](https://craigahobbs.github.io/schema-markdown-doc/#name=TypeModel).
Schema Markdown is a human-friendly schema definition language and validation package for
[Python](https://github.com/craigahobbs/schema-markdown)
and
[JavaScript](https://github.com/craigahobbs/schema-markdown-js).

To create a type model JSON file, use the
[schema-markdown command-line compiler](https://craigahobbs.github.io/schema-markdown/tool.html):

```
$ python3 -m pip install schema-markdown
$ schema-markdown compile model.smd -o model.json
```

*Note:* [Schema Markdown](https://craigahobbs.github.io/schema-markdown/schema-markdown.html)
files use the ".smd" extension.

To host your type model's documentation, first, download the schema-markdown-doc application stub to
the directory containing your type model JSON file:

```
curl -O https://craigahobbs.github.io/schema-markdown-doc/static/index.html
```

To host locally, start a local static web server:

```
$ python3 -m http.server
```

By default, schema-markdown-doc renders the
[Schema Markdown Type Model](https://craigahobbs.github.io/schema-markdown-doc/#name=TypeModel)
itself. That's right; the Schema Markdown Type Model is used to define itself!

To open your type model JSON file, set the "url" hash parameter (i.e., "#url=model.json").

Alternatively, you can change the default type model JSON file by updating the schema-markdown-doc
application stub. For example:

``` html
    <script type="module">
        import {SchemaMarkdownDoc} from 'https://craigahobbs.github.io/schema-markdown-doc/lib/app.js';
        const app = new SchemaMarkdownDoc(window, 'model.json');
        app.run();
    </script>
```


## The Schema Markdown Documentation Component

The schema-markdown-doc package contains the
[UserTypeElements](https://craigahobbs.github.io/schema-markdown-doc/doc/UserTypeElements.html)
component class for use with the
[renderElements](https://craigahobbs.github.io/element-model/global.html#renderElements)
function from the
[element-model](https://www.npmjs.com/package/element-model)
package. For example:

``` javascript
import {SchemaMarkdownParser} from 'schema-markdown/index.js';
import {UserTypeElements} from 'schema-markdown-doc/index.js';

const parser = new smd.SchemaMarkdownParser(`\
# My cool struct
struct MyStruct

    # My cool member
    string member
`);
const elements = (new UserTypeElements()).getElements(parser.types, 'MyStruct');
```


## Development

schema-markdown-doc is an [Element Application](https://github.com/craigahobbs/element-app#readme).
It is developed using [javascript-build](https://github.com/craigahobbs/javascript-build#readme)
and it was started using [javascript-template](https://github.com/craigahobbs/javascript-template#readme):

```
template-specialize javascript-template/template/ schema-markdown-doc/ -k package schema-markdown-doc -k name 'Craig A. Hobbs' -k email 'craigahobbs@gmail.com' -k github 'craigahobbs'
```
