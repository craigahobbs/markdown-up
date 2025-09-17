The "elementModel.bare" include library contains functions for validating and rendering element models to HTML or SVG strings. Element models are data structures representing HTML or SVG elements, useful for building user interfaces in a programmatic way.

Consider the following example of creating a simple HTML element model and rendering it to a string. First, include the "elementModel.bare" library and define an element model for a div containing a heading and a paragraph.

~~~ bare-script
include <elementModel.bare>

elementModel = objectNew( \
    'html', 'div', \
    'attr', objectNew('id', 'myDiv', 'class', 'container'), \
    'elem', arrayNew( \
        objectNew('html', 'h1', 'elem', objectNew('text', 'Hello, World!')), \
        objectNew('html', 'p', 'elem', objectNew('text', 'This is a paragraph.')) \
    ) \
)
~~~

Next, validate the element model using the [elementModelValidate] function.

~~~ bare-script
validatedModel = elementModelValidate(elementModel)
if validatedModel == null:
    markdownPrint('Invalid element model!')
else:
    markdownPrint('Element model is valid.')
endif
~~~

Then, render the element model to an HTML string using the [elementModelStringify] function.

~~~ bare-script
htmlString = elementModelStringify(validatedModel)
markdownPrint('Rendered HTML:', '', '```html', htmlString, '```')
~~~

For SVG elements, set the tag to 'svg' instead of 'html'. The [elementModelStringify] function will automatically add the necessary xmlns attribute for SVG.

~~~ bare-script
svgModel = objectNew( \
    'svg', 'svg', \
    'attr', objectNew('width', '100', 'height', '100'), \
    'elem', objectNew( \
        'svg', 'circle', \
        'attr', objectNew('cx', '50', 'cy', '50', 'r', '40', 'fill', 'blue') \
    ) \
)
svgString = elementModelStringify(svgModel)
markdownPrint('Rendered SVG:', '', '```html', svgString, '```')
~~~

Element models support nested arrays of elements, text nodes, attributes, and optional callback functions for event handling (though callbacks are ignored during stringification).


[elementModelValidate]: include.html#var.vGroup='elementModel.bare'&elementmodelvalidate
[elementModelStringify]: include.html#var.vGroup='elementModel.bare'&elementmodelstringify
