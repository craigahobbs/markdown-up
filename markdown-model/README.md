# markdown-model

[![npm](https://img.shields.io/npm/v/markdown-model)](https://www.npmjs.com/package/markdown-model)
[![GitHub](https://img.shields.io/github/license/craigahobbs/markdown-model)](https://github.com/craigahobbs/markdown-model/blob/main/LICENSE)

[markdown-model API Documentation](https://craigahobbs.github.io/markdown-model/)

**markdown-model** is a JavaScript Markdown parsing and rendering library. Underlying its
functionality is the
[Markdown Model](https://craigahobbs.github.io/markdown-model/doc/#name=Markdown),
an abstract model of a Markdown document.

To parse a Markdown document and produce a Markdown model, use the
[parseMarkdown](https://craigahobbs.github.io/markdown-model/module-lib_parser.html#.parseMarkdown)
function:

``` javascript
import {parseMarkdown} from 'markdown-model/index.js';

const markdownModel = parseMarkdown(markdownText);
```

To render the Markdown model in a web browser, use the
[markdownElements](https://craigahobbs.github.io/markdown-model/module-lib_elements.html#.markdownElements)
component function with the
[renderElements](https://craigahobbs.github.io/element-model/module-lib_elementModel.html#.renderElements)
function from the
[element-model](https://www.npmjs.com/package/element-model)
package:


``` javascript
import {markdownElements} from 'markdown-model/index.js';
import {renderElements} from 'element-model/index.js';

renderElements(document.body, markdownElements(markdownModel));
```

You can compute the title of a Markdown document from the Markdown model using the
[getMarkdownTitle](https://craigahobbs.github.io/markdown-model/module-lib_markdownModel.html#.getMarkdownTitle)
function:

``` javascript
import {getMarkdownTitle} from 'markdown-model/index.js';

const markdownTitle = getMarkdownTitle(markdownModel);
```

The
[validateMarkdownModel](https://craigahobbs.github.io/markdown-model/module-lib_markdownModel.html#.validateMarkdownModel)
function is used to validate Markdown models from untrusted sources or for testing the validity of any code that produces a Markdown model:

``` javascript
import {validateMarkdownModel} from 'markdown-model/index.js';

validateMarkdownModel(markdownModel);
```


## Development

markdown-model is developed using [javascript-build](https://github.com/craigahobbs/javascript-build#readme)
and it was started using [javascript-template](https://github.com/craigahobbs/javascript-template#readme):

```
template-specialize javascript-template/template/ markdown-model/ -k package markdown-model -k name 'Craig A. Hobbs' -k email 'craigahobbs@gmail.com' -k github 'craigahobbs' -k noapp 1
```
