# element-model

[![npm](https://img.shields.io/npm/v/element-model)](https://www.npmjs.com/package/element-model)
[![GitHub](https://img.shields.io/github/license/craigahobbs/element-model)](https://github.com/craigahobbs/element-model/blob/main/LICENSE)

The element-model package is a JavaScript library for creating and rendering HTML and SVG element
hierarchies. It is useful for the creation of front-end components and applications.


## Links

- [API Documentation](https://craigahobbs.github.io/element-model/)
- [Source code](https://github.com/craigahobbs/element-model)


## Rendering HTML Elements

The element model is a native JavaScript object representation of HTML and SVG element hierarchies.
It provides a straight-forward, programmatic way to generate HTML content in the web browser using
pure JavaScript. For example, consider the following HTML element hierarchy:

~~~ html
<h1>Title</h1>
<p>
This is <a href="link.html">a <strong>link</strong></a>
</p>
~~~

The element model for the HTML element hierarchy above is as follows:

~~~ javascript
const elements = [
    {
        'html': 'h1',
        'elem': {'text': 'Title'}
    },
    {
        'html': 'p',
        'elem': [
            {'text': 'This is '},
            {
                'html': 'a',
                'attr': {'href': 'link.html'},
                'elem': [
                    {'text': 'a '},
                    {
                        'html': 'strong',
                        'elem': {'text': 'link'}
                    }
                ]
            }
        ]
    }
];
~~~

An element model is rendered to the web browser using the
[renderElement](https://craigahobbs.github.io/element-model/module-lib_elementModel.html#.renderElements)
function.

~~~ javascript
import {renderElements} from 'element-model/lib/elementModel.js';

renderElements(document.body, elements);
~~~

If the element model comes from an un-trusted source, you'll want to verify it before rendering
using the
[validateElements](https://craigahobbs.github.io/element-model/module-lib_elementModel.html#.validateElements)
function.

~~~ javascript
import {validateElements} from 'element-model/lib/elementModel.js';

validateElements(elements);
~~~

The validateElements function is also useful for testing element model components by ensuring that
they return valid element model objects.


## The Element Model

An element model is either an element object, null, or an array (of any above). Element objects
define either an HTML element, an SVG element, or a text element.

HTML and SVG element model objects may define the following attributes: "html", "svg", "attr",
"elem", and "callback". The "html" or "svg" attributes define the HTML or SVG element tag (e.g.,
"h1"), respectively.

HTML and SVG elements can optionally define attributes using the "attr" attribute. The "attr"
attribute is a dictionary of the element's attributes or null. If "attr" is null, there are no
attributes. Further, if any attribute's value is null, that attribute is ignored.

HTML and SVG elements can optionally define sub-elements using the "elem" attribute. The "elem"
attribute can be an element object, null, or an array of any of the above. If "elem" is null, there
are no sub-elements. Any null element encountered is ignored.

If an HTML or SVG element object defines the "callback" attribute, the function is called with the
created HTML or SVG element. This allows for the addition of callbacks (e.g., "click") on the
created elements.

Text element model objects are identified by the "text" attribute. The "text" attribute value is the
text of the element.


## Examples

The following examples demonstrate the element model in practice.


### Dynamic List

The element model was designed to make creation of dynamic content easy in code. For example, here's
how to dynamically create a list:

~~~ javascript
const listItems = ['One', 'Two', 'Three'];
const elements = [
    {'html': 'h1', 'elem': {'text': 'The List'}},
    {
        'html': 'ul',
        'elem': listItems.map((text) => ({'html': 'li', 'elem': {'text': text}}))
    }
];
renderElements(document.body, elements);
~~~


### Optional Content

To hide optional content, simple replace the content's element model with null. For example:

~~~ javascript
const hasOptionalContent = false;
const elements = [
    {'html': 'p', 'elem': {'text': 'This is required content'}},
    !hasOptionalContent ? null : {'html': 'p', 'elem': {'text': 'This is optional content'}}
];
renderElements(document.body, elements);
~~~


### Front-End Components

Any function that returns an element model can be considered a component. For example:

~~~ javascript
const linkElements = (text, url) => {
    return {'html': 'p', 'elem': {'html': 'a', 'attr': {'href': url}, 'elem': {'text': text}}};
};
const elements = [
    linkElements('Link 1', '#one'),
    linkElements('Link 2', '#two'),
    linkElements('Link 3', '#three')
];
renderElements(document.body, elements);
~~~


### Collapsing Menu

To create a collapsing menu, we add add an "click" event handler that hides or shows the sub-menu.

~~~ javascript
const onHideShow = () => {
    const submenu = document.getElementById('submenu');
    if (submenu.getAttribute('style').includes('visible')) {
        submenu.setAttribute('style', 'visibility: collapse;');
    } else {
        submenu.setAttribute('style', 'visibility: visible;');
    }
};
const elements = [
    {'html': 'ul', 'elem': [
        {'html': 'li', 'elem': [
            {'html': 'a', 'elem': {'text': 'Menu'}, 'callback': (element) => {
                element.addEventListener('click', () => onHideShow(), false);
            }},
            {'html': 'ul', 'attr': {'id': 'submenu', 'style': 'visibility: visible;'}, 'elem': [
                {'html': 'li', 'elem': {'html': 'a', 'attr': {'href': '#one'}, 'elem': {'text': 'Sub-menu 1'}}},
                {'html': 'li', 'elem': {'html': 'a', 'attr': {'href': '#two'}, 'elem': {'text': 'Sub-menu 2'}}}
            ]}
        ]}
    ]}
];
renderElements(document.body, elements);
~~~


## Development

This package is developed using [javascript-build](https://github.com/craigahobbs/javascript-build#readme).
It was started using [javascript-template](https://github.com/craigahobbs/javascript-template#readme) as follows:

~~~
template-specialize javascript-template/template/ element-model/ -k package element-model -k name 'Craig A. Hobbs' -k email 'craigahobbs@gmail.com' -k github 'craigahobbs' -k noapp 1
~~~
