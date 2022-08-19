// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

import {escapeMarkdownText, markdownHeaderId} from 'markdown-model/lib/elements.js';
import {getMarkdownTitle, parseMarkdown} from 'markdown-model/lib/parser.js';
import {validateType, validateTypeModel} from 'schema-markdown/lib/schema.js';
import {SchemaMarkdownParser} from 'schema-markdown/lib/parser.js';
import {typeModel} from 'schema-markdown/lib/typeModel.js';


/* eslint-disable id-length, max-len */


// Constants
const fontWidthRatio = 0.6;
const pixelsPerPoint = 4 / 3;


// Helper function to flatten and line-split nested arrays of strings
function flattenAndSplitLines(lines) {
    return lines.flat().reduce(
        (result, line) => {
            result.push(...line.split(rLineSplit));
            return result;
        },
        []
    );
}

const rLineSplit = /\r?\n/;


// markdown-script library functions
export const markdownScriptFunctions = {
    //
    // Document functions
    //

    // $function: documentReset
    // $group: Document
    // $doc: Reset the document. This is useful within callback functions that re-render the document.
    'documentReset': (unused, options) => options.runtime.documentReset(),

    // $function: documentURL
    // $group: Document
    // $doc: Fix-up relative URLs
    // $arg url: The URL
    // $return: The fixed-up URL
    'documentURL': ([url], options) => options.urlFn(url),

    // $function: getDocumentFontSize
    // $group: Document
    // $doc: Get the document font size
    // $return: The document font size, in pixels
    'getDocumentFontSize': (unused, options) => options.fontSize * pixelsPerPoint,

    // $function: getDocumentInputValue
    // $group: Document
    // $doc: Get an input element's value
    // $arg id: The input element ID
    // $return: The input element value or null if the element does not exist
    'getDocumentInputValue': ([id], options) => {
        const element = options.window.document.getElementById(id) ?? null;
        return (element !== null ? (element.value ?? null) : null);
    },

    // $function: getWindowHeight
    // $group: Document
    // $doc: Get the browser window's height
    // $return: The browser window's height
    'getWindowHeight': (unused, options) => options.window.innerHeight,

    // $function: getWindowWidth
    // $group: Document
    // $doc: Get the browser window's width
    // $return: The browser window's width
    'getWindowWidth': (unused, options) => options.window.innerWidth,

    // $function: setDocumentFocus
    // $group: Document
    // $doc: Set focus to an element
    // $arg id: The element ID
    'setDocumentFocus': ([id], options) => options.runtime.setDocumentFocus(id),

    // $function: setDocumentTitle
    // $group: Document
    // $doc: Set the document title
    // $arg title: The document title string
    'setDocumentTitle': ([title], options) => options.runtime.setDocumentTitle(title),

    // $function: setWindowLocation
    // $group: Document
    // $doc: Navigate the browser window to a location URL
    // $arg url: The new location URL
    'setWindowLocation': ([location], options) => options.runtime.setWindowLocation(location),

    // $function: setWindowResize
    // $group: Document
    // $doc: Set the browser window resize event handler
    // $arg callback: The window resize callback function
    'setWindowResize': ([callback], options) => options.runtime.setWindowResize(callback),

    // $function: setWindowTimeout
    // $group: Document
    // $doc: Set the browser window timeout event handler
    // $arg callback: The window timeout callback function
    // $arg delay: The delay, in milliseconds, to ellapse before calling the timeout
    'setWindowTimeout': ([callback, delay], options) => options.runtime.setWindowTimeout(callback, delay),


    //
    // Drawing functions
    //

    // $function: drawArc
    // $group: Drawing
    // $doc: Draw an arc curve from the current point to the end point
    // $arg rx: The arc ellipse's x-radius
    // $arg ry: The arc ellipse's y-radius
    // $arg angle: The rotation (in degrees) of the ellipse relative to the x-axis
    // $arg largeArcFlag: Either large arc (1) or small arc (0)
    // $arg sweepFlag: Either clockwise turning arc (1) or counterclockwise turning arc (0)
    // $arg x: The x-coordinate of the end point
    // $arg y: The y-coordinate of the end point
    'drawArc': ([rx, ry, angle, largeArcFlag, sweepFlag, x, y], options) => (
        options.runtime.drawArc(rx, ry, angle, largeArcFlag, sweepFlag, x, y)
    ),

    // $function: drawCircle
    // $group: Drawing
    // $doc: Draw a circle
    // $arg cx: The x-coordinate of the center of the circle
    // $arg cy: The y-coordinate of the center of the circle
    // $arg r: The radius of the circle
    'drawCircle': ([cx, cy, r], options) => options.runtime.drawCircle(cx, cy, r),

    // $function: drawClose
    // $group: Drawing
    // $doc: Close the current drawing path
    'drawClose': (unused, options) => options.runtime.drawClose(),

    // $function: drawEllipse
    // $group: Drawing
    // $doc: Draw an ellipse
    // $arg cx: The x-coordinate of the center of the ellipse
    // $arg cy: The y-coordinate of the center of the ellipse
    // $arg rx: The x-radius of the ellipse
    // $arg ry: The y-radius of the ellipse
    'drawEllipse': ([cx, cy, rx, ry], options) => options.runtime.drawEllipse(cx, cy, rx, ry),

    // $function: drawHLine
    // $group: Drawing
    // $doc: Draw a horizontal line from the current point to the end point
    // $arg x: The x-coordinate of the end point
    'drawHLine': ([x], options) => options.runtime.drawHLine(x),

    // $function: drawImage
    // $group: Drawing
    // $doc: Draw an image
    // $arg x: The x-coordinate of the center of the image
    // $arg y: The y-coordinate of the center of the image
    // $arg width: The width of the image
    // $arg height: The height of the image
    // $arg href: The image resource URL
    'drawImage': ([x, y, width, height, href], options) => options.runtime.drawImage(x, y, width, height, href),

    // $function: drawLine
    // $group: Drawing
    // $doc: Draw a line from the current point to the end point
    // $arg x: The x-coordinate of the end point
    // $arg y: The y-coordinate of the end point
    'drawLine': ([x, y], options) => options.runtime.drawLine(x, y),

    // $function: drawMove
    // $group: Drawing
    // $doc: Move the path's drawing point
    // $arg x: The x-coordinate of the new drawing point
    // $arg y: The y-coordinate of the new drawing point
    'drawMove': ([x, y], options) => options.runtime.drawMove(x, y),

    // $function: drawOnClick
    // $group: Drawing
    // $doc: Set the most recent drawing object's on-click event handler
    // $arg callback: The on-click event callback function (x, y)
    'drawOnClick': ([callback], options) => options.runtime.drawOnClick(callback),

    // $function: drawRect
    // $group: Drawing
    // $doc: Draw a rectangle
    // $arg x: The x-coordinate of the top-left of the rectangle
    // $arg y: The y-coordinate of the top-left of the rectangle
    // $arg width: The width of the rectangle
    // $arg height: The height of the rectangle
    // $arg rx: Optional (default is null). The horizontal corner radius of the rectangle.
    // $arg ry: Optional (default is null). The vertical corner radius of the rectangle.
    'drawRect': ([x, y, width, height, rx = null, ry = null], options) => options.runtime.drawRect(x, y, width, height, rx, ry),

    // $function: drawStyle
    // $group: Drawing
    // $doc: Set the current drawing styles
    // $arg stroke: Optional (default is 'black'). The stroke color.
    // $arg strokeWidth: Optional (default is 1). The stroke width.
    // $arg fill: Optional (default is 'none'). The fill color.
    // $arg strokeDashArray: Optional (default is 'none'). The stroke
    // $arg strokeDashArray: [dash array](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray#usage_notes).
    'drawStyle': ([stroke = 'black', strokeWidth = 1, fill = 'none', strokeDashArray = 'none'], options) => (
        options.runtime.drawStyle(stroke, strokeWidth, fill, strokeDashArray)
    ),

    // $function: drawText
    // $group: Drawing
    // $doc: Draw text
    // $arg text: The text to draw
    // $arg x: The x-coordinate of the text
    // $arg y: The y-coordinate of the text
    // $arg textAnchor: Optional (default is 'middle'). The
    // $arg textAnchor: [text anchor](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/text-anchor#usage_notes) style.
    // $arg dominantBaseline: Optional (default is 'middle'). The
    // $arg dominantBaseline: [dominant baseline](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/dominant-baseline#usage_notes) style.
    'drawText': ([text, x, y, textAnchor = 'middle', dominantBaseline = 'middle'], options) => (
        options.runtime.drawText(text, x, y, textAnchor, dominantBaseline)
    ),

    // $function: drawTextStyle
    // $group: Drawing
    // $doc: Set the current text drawing styles
    // $arg fontSizePx: Optional (default is null, the default font size). The text font size, in pixels.
    // $arg textFill: Optional (default is 'black'). The text fill color.
    // $arg bold: Optional (default is false). If true, text is bold.
    // $arg italic: Optional (default is false). If true, text is italic.
    // $arg fontFamily: Optional (default is null, the default font family). The text font family.
    'drawTextStyle': ([fontSizePx = null, textFill = 'black', bold = false, italic = false, fontFamily = null], options) => (
        options.runtime.drawTextStyle(fontSizePx, textFill, bold, italic, fontFamily)
    ),

    // $function: drawVLine
    // $group: Drawing
    // $doc: Draw a vertical line from the current point to the end point
    // $arg y: The y-coordinate of the end point
    'drawVLine': ([y], options) => options.runtime.drawVLine(y),

    // $function: getDrawingHeight
    // $group: Drawing
    // $doc: Get the current drawing's height
    // $return: The current drawing's height
    'getDrawingHeight': (unused, options) => options.runtime.drawingHeight,

    // $function: getDrawingWidth
    // $group: Drawing
    // $doc: Get the current drawing's width
    // $return: The current drawing's width
    'getDrawingWidth': (unused, options) => options.runtime.drawingWidth,

    // $function: getTextHeight
    // $group: Drawing
    // $doc: Compute the text's height to fit the width
    // $arg text: The text
    // $arg width: The width of the text. If 0, the default font size (in pixels) is returned.
    // $return: The text's height
    'getTextHeight': ([text, width], options) => (width > 0 ? width / (fontWidthRatio * text.length) : options.runtime.drawingFontSizePx),

    // $function: getTextWidth
    // $group: Drawing
    // $doc: Compute the text's width
    // $arg text: The text
    // $arg fontSizePx: The text font size, in pixels
    // $return: The text's width
    'getTextWidth': ([text, fontSizePx]) => fontWidthRatio * fontSizePx * text.length,

    // $function: setDrawingSize
    // $group: Drawing
    // $doc: Set the current drawing's size
    // $arg width: The width of the drawing
    // $arg height: The height of the drawing
    'setDrawingSize': ([width, height], options) => options.runtime.setDrawingSize(width, height),


    //
    // Element Model functions
    //

    // $function: elementModelRender
    // $group: Element Model
    // $doc: Render an [element model](https://github.com/craigahobbs/element-model#readme)
    // $arg element: The [element model](https://github.com/craigahobbs/element-model#readme)
    'elementModelRender': ([elements], options) => options.runtime.elementModelRender(elements),


    //
    // Local storage functions
    //

    // $function: localStorageClear
    // $group: Local Storage
    // $doc: Clear all keys from the browser's local storage
    'localStorageClear': (unused, options) => options.window.localStorage.clear(),

    // $function: localStorageGet
    // $group: Local Storage
    // $doc: Get a browser local storage key's value
    // $arg key: The key string
    // $return: The local storage value string or null if the key does not exist
    'localStorageGet': ([key], options) => options.window.localStorage.getItem(key),

    // $function: localStorageSet
    // $group: Local Storage
    // $doc: Set a browser local storage key's value
    // $arg key: The key string
    // $arg value: The value string
    'localStorageSet': ([key, value], options) => options.window.localStorage.setItem(key, value),

    // $function: localStorageRemove
    // $group: Local Storage
    // $doc: Remove a browser local storage key
    // $arg key: The key string
    'localStorageRemove': ([key], options) => options.window.localStorage.removeItem(key),


    //
    // Markdown functions
    //

    // $function: markdownEscape
    // $group: Markdown
    // $doc: Escape text for inclusion in Markdown text
    // $arg text: The text
    // $return: The escaped text
    'markdownEscape': ([text]) => escapeMarkdownText(text),

    // $function: markdownHeaderId
    // $group: Markdown
    // $doc: Compute the Markdown header element ID for some text
    // $arg text: The text
    // $return: The header element ID
    'markdownHeaderId': ([text]) => markdownHeaderId(text),

    // $function: markdownParse
    // $group: Markdown
    // $doc: Parse Markdown text
    // $arg lines: The Markdown text lines (may contain nested arrays of un-split lines)
    // $return: The [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')
    'markdownParse': (lines) => parseMarkdown(lines.flat()),

    // $function: markdownPrint
    // $group: Markdown
    // $doc: Render Markdown text
    // $arg lines: The Markdown text lines (may contain nested arrays of un-split lines)
    'markdownPrint': (lines, options) => options.runtime.markdownPrint(lines),

    // $function: markdownTitle
    // $group: Markdown
    // $doc: Compute the title of a [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')
    // $arg markdownModel: The [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')
    // $return: The Markdown title or null if there is no title
    'markdownTitle': ([markdownModel]) => getMarkdownTitle(markdownModel),


    //
    // Schema functions
    //

    // $function: schemaParse
    // $group: Schema
    // $doc: Parse the [Schema Markdown](https://craigahobbs.github.io/schema-markdown/schema-markdown.html) text
    // $arg lines: The [Schema Markdown](https://craigahobbs.github.io/schema-markdown/schema-markdown.html)
    // $arg lines: text lines (may contain nested arrays of un-split lines)
    // $return: The schema's [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
    'schemaParse': (lines) => {
        const parser = new SchemaMarkdownParser();
        parser.parse(flattenAndSplitLines(lines));
        return parser.types;
    },

    // $function: schemaPrint
    // $group: Schema
    // $doc: Render a schema type's documentation
    // $arg types: The [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
    // $arg typeName: The type name
    // $arg actionURLs: Optional (default is null). The
    // $arg actionURLs: [action URL overrides](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='ActionURL').
    'schemaPrint': ([types, typeName, actionURLs = null], options) => options.runtime.schemaPrint(types, typeName, actionURLs),

    // $function: schemaTypeModel
    // $group: Schema
    // $doc: Get the [Schema Markdown Type Model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
    // $return: The [Schema Markdown Type Model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
    'schemaTypeModel': () => typeModel,

    // $function: schemaValidate
    // $group: Schema
    // $doc: Validate an object to a schema type
    // $arg types: The [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
    // $arg typeName: The type name
    // $arg value: The object to validate
    // $return: The validated object or null if validation fails
    'schemaValidate': ([types, typeName, value]) => validateType(types, typeName, value),

    // $function: schemaValidateTypeModel
    // $group: Schema
    // $doc: Validate a [Schema Markdown Type Model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
    // $arg types: The [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types') to validate
    // $return: The validated [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
    'schemaValidateTypeModel': ([types]) => validateTypeModel(types),


    //
    // Session storage functions
    //

    // $function: sessionStorageClear
    // $group: Session Storage
    // $doc: Clear all keys from the browser's session storage
    'sessionStorageClear': (unused, options) => options.window.sessionStorage.clear(),

    // $function: sessionStorageGet
    // $group: Session Storage
    // $doc: Get a browser session storage key's value
    // $arg key: The key string
    // $return: The session storage value string or null if the key does not exist
    'sessionStorageGet': ([key], options) => options.window.sessionStorage.getItem(key),

    // $function: sessionStorageSet
    // $group: Session Storage
    // $doc: Set a browser session storage key's value
    // $arg key: The key string
    // $arg value: The value string
    'sessionStorageSet': ([key, value], options) => options.window.sessionStorage.setItem(key, value),

    // $function: sessionStorageRemove
    // $group: Session Storage
    // $doc: Remove a browser session storage key
    // $arg key: The key string
    'sessionStorageRemove': ([key], options) => options.window.sessionStorage.removeItem(key)
};
