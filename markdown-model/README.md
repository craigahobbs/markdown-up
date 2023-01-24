# markdown-model

[![npm](https://img.shields.io/npm/v/markdown-model)](https://www.npmjs.com/package/markdown-model)
[![GitHub](https://img.shields.io/github/license/craigahobbs/markdown-model)](https://github.com/craigahobbs/markdown-model/blob/main/LICENSE)

The markdown-model package is a JavaScript Markdown parser and renderer.


## Links

- [API Documentation](https://craigahobbs.github.io/markdown-model/)
- [Source code](https://github.com/craigahobbs/markdown-model)


## Parsing Markdown

To parse a Markdown document, use the
[parseMarkdown](https://craigahobbs.github.io/markdown-model/module-lib_parser.html#.parseMarkdown)
function:

~~~ javascript
import {parseMarkdown} from 'markdown-model/lib/parser.js';

const markdownModel = parseMarkdown(markdownText);
~~~

Note: Markdown documents are parsed as
[GitHub Flavored Markdown](https://github.github.com/gfm/)
(with the exception of HTML blocks).


## Rendering Markdown

To render the parsed Markdown in a web browser, use the
[markdownElements](https://craigahobbs.github.io/markdown-model/module-lib_elements.html#.markdownElements)
function with the
[renderElements](https://craigahobbs.github.io/element-model/module-lib_elementModel.html#.renderElements)
function from the
[element-model](https://github.com/craigahobbs/element-model)
package:

~~~ javascript
import {markdownElements} from 'markdown-model/lib/elements.js';
import {renderElements} from 'element-model/lib/elementModel.js';

renderElements(document.body, markdownElements(markdownModel));
~~~


## Computing the Markdown Title

To compute the title of the parsed Markdown, use the
[getMarkdownTitle](https://craigahobbs.github.io/markdown-model/module-lib_parser.html#.getMarkdownTitle)
function:

~~~ javascript
import {getMarkdownTitle} from 'markdown-model/lib/parser.js';

const markdownTitle = getMarkdownTitle(markdownModel);
~~~


## Development

This package is developed using [javascript-build](https://github.com/craigahobbs/javascript-build#readme).
It was started using [javascript-template](https://github.com/craigahobbs/javascript-template#readme) as follows:

~~~
template-specialize javascript-template/template/ markdown-model/ -k package markdown-model -k name 'Craig A. Hobbs' -k email 'craigahobbs@gmail.com' -k github 'craigahobbs' -k noapp 1
~~~
