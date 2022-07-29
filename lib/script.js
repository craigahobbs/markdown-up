// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/script */

import {escapeMarkdownText, getMarkdownTitle, parseMarkdown} from '../markdown-model/lib/parser.js';
import {markdownElements, markdownHeaderId} from '../markdown-model/lib/elements.js';
import {validateType, validateTypeModel} from '../schema-markdown/lib/schema.js';
import {SchemaMarkdownParser} from '../schema-markdown/lib/parser.js';
import {encodeQueryString} from '../schema-markdown/lib/encode.js';
import {executeScriptAsync} from '../calc-script/lib/runtimeAsync.js';
import {parseScript} from '../calc-script/lib/parser.js';
import {schemaMarkdownDoc} from '../schema-markdown-doc/lib/schemaMarkdownDoc.js';
import {typeModel} from '../schema-markdown/lib/typeModel.js';
import {validateElements} from '../element-model/lib/elementModel.js';


/* eslint-disable id-length, max-len */


/**
 * The markdown-script code block function options (based on
 * [calc-script's options]{@link https://craigahobbs.github.io/calc-script/module-lib_runtime.html#~ExecuteScriptOptions}).
 *
 * @typedef {Object} MarkdownScriptOptions
 * @property {number} fontSize - The font size, in points
 * @property {Object} params - The hash parameters object
 * @property {Object} runtime - The [markdown-script runtime state]{@link module:lib/script.MarkdownScriptRuntime}
 * @property {Object} [variables] - The map of variable name to variable value
 * @property {Object} window - The web browser window object
 * @property {function} runtimeUpdateFn - The [runtime update callback function]{@link module:lib/util~MarkdownScriptRuntimeUpdateFn}
 */

/**
 * A runtime update callback function
 *
 * @callback MarkdownScriptRuntimeUpdateFn
 */

/**
 * A URL modifier function
 *
 * @callback URLFn
 * @param {string} url - The URL
 * @returns {string} The modified URL
 */


/**
 * The markdown-script code block function
 *
 * @async
 * @param {object} codeBlock - The code block model
 * @param {Object} options - The [markdown-script options]{@link module:lib/script~MarkdownScriptOptions}
 * @returns {Object} The generated element model
 */
export async function markdownScriptCodeBlock(codeBlock, options) {
    // Add the options variables to the runtime's globals
    if ('variables' in options) {
        Object.assign(options.globals, options.variables);
    }

    // Execute the calculation script
    let errorMessage = null;
    try {
        await executeScriptAsync(parseScript(codeBlock.lines, codeBlock.startLineNumber + 1), options);
    } catch ({message}) {
        errorMessage = message;
    }

    // Reset the runtime
    let elements = options.runtime.resetElements();

    // If an error occurred, render the error message
    if (errorMessage !== null) {
        elements = [elements, {'html': 'pre', 'elem': {'text': errorMessage}}];
    }

    return elements;
}


// markdown-script runtime constants
const defaultDrawingWidth = 300;
const defaultDrawingHeight = 200;
const svgPrecision = 8;
const fontWidthRatio = 0.6;
const pixelsPerPoint = 4 / 3;
const defaultFontFamily = 'Arial, Helvetica, sans-serif';


/**
 * The markdown-script runtime state
 *
 * @property {Object} options - The [markdown-script options]{@link module:lib/script~MarkdownScriptOptions}
 * @property {?Object[]} elements - The runtime-generated element model
 * @property {?string} documentFocus - The the runtime-set element ID to set input focus
 * @property {?string} documentTitle - The the runtime-set document title
 * @property {boolean} isDocumentReset - If true, the runtime requested a document-reset
 * @property {?string} windowLocation - The the runtime-set document location
 * @property {?function} windowTimeout - The the runtime-set timeout args (callback, delay)
 */
export class MarkdownScriptRuntime {
    /**
     * @param {Object} options - The [markdown-script options]{@link module:lib/script~MarkdownScriptOptions}
     */
    constructor(options) {
        this.options = options;
        this.elements = null;
        this.documentFocus = null;
        this.documentTitle = null;
        this.isDocumentReset = false;
        this.windowLocation = null;
        this.windowResize = null;
        this.windowTimeout = null;

        // Drawing-path and Markdown function state
        this.drawingPath = null;
        this.markdown = null;

        // Drawing state
        this.drawingWidth = defaultDrawingWidth;
        this.drawingHeight = defaultDrawingHeight;

        // Drawing path style
        this.drawingPathStroke = 'black';
        this.drawingPathStrokeWidth = 1;
        this.drawingPathStrokeDashArray = 'none';
        this.drawingPathFill = 'none';

        // Drawing text style
        this.drawingFontFamily = defaultFontFamily;
        this.drawingFontSizePx = options.fontSize * pixelsPerPoint;
        this.drawingFontFill = 'black';
        this.drawingFontBold = false;
        this.drawingFontItalic = false;
    }


    /**
     * Create the runtime globals
     *
     * @returns {Object} The runtime globals
     */
    createGlobals() {
        return {
            //
            // Document functions
            //

            // $function: documentReset
            // $group: Document
            // $doc: Reset the document. This is useful to call within callback functions that re-render the document.
            'documentReset': () => this.documentReset(),

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
            // $arg id: The element ID
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
            'setDocumentFocus': ([id]) => this.setDocumentFocus(id),

            // $function: setDocumentTitle
            // $group: Document
            // $doc: Set the document title
            // $arg title: The document title
            'setDocumentTitle': ([title]) => this.setDocumentTitle(title),

            // $function: setWindowLocation
            // $group: Document
            // $doc: Navigate the browser window to a location URL
            // $arg url: The URL
            'setWindowLocation': ([location]) => this.setWindowLocation(location),

            // $function: setWindowResize
            // $group: Document
            // $doc: Set the browser window resize event handler
            // $arg callback: The window resize callback function
            'setWindowResize': ([callback]) => this.setWindowResize(callback),

            // $function: setWindowTimeout
            // $group: Document
            // $doc: Set the browser window timeout event handler
            // $arg callback: The window timeout callback function
            // $arg delay: The delay, in milliseconds, to ellapse before calling the timeout
            'setWindowTimeout': ([callback, delay]) => this.setWindowTimeout(callback, delay),


            //
            // Drawing functions
            //

            // $function: drawArc
            // $group: Drawing
            // $doc: Draw an arc curve from the current point to the coordinate x,y
            // $arg rx: The ellipse's X radius
            // $arg ry: The ellipse's Y radius
            // $arg angle: The rotation (in degrees) of the ellipse relative to the x-axis
            // $arg largeArcFlag: Either large arc (1) or small arc (0)
            // $arg sweepFlag: Either clockwise turning arc (1) or counterclockwise turning arc (0)
            // $arg x: The x-coordinate
            // $arg y: The y-coordinate
            'drawArc': ([rx, ry, angle, largeArcFlag, sweepFlag, x, y]) => (
                this.drawArc(rx, ry, angle, largeArcFlag, sweepFlag, x, y)
            ),

            // $function: drawCircle
            // $group: Drawing
            // $doc: Draw a circle
            // $arg cx: The x-coordinate of the center of the circle
            // $arg cy: The y-coordinate of the center of the circle
            // $arg r: The radius of the circle
            'drawCircle': ([cx, cy, r]) => this.drawCircle(cx, cy, r),

            // $function: drawClose
            // $group: Drawing
            // $doc: Close the current drawing path
            'drawClose': () => this.drawClose(),

            // $function: drawEllipse
            // $group: Drawing
            // $doc: Draw an ellipse
            // $arg cx: The x position of the ellipse
            // $arg cy: The y position of the ellipse
            // $arg rx: The radius of the ellipse on the x axis
            // $arg ry: The radius of the ellipse on the y axis
            'drawEllipse': ([cx, cy, rx, ry]) => this.drawEllipse(cx, cy, rx, ry),

            // $function: drawHLine
            // $group: Drawing
            // $doc: Draw a horizontal line from the current point to the end point
            // $arg x: The x-coordinate of the end point
            'drawHLine': ([x]) => this.drawHLine(x),

            // $function: drawImage
            // $group: Drawing
            // $doc: Draw an image
            // $arg x: The x position of the image
            // $arg y: The y position of the image
            // $arg width: The width of the image
            // $arg height: The height of the image
            // $arg href: The image resource URL
            'drawImage': ([x, y, width, height, href]) => this.drawImage(x, y, width, height, href),

            // $function: drawLine
            // $group: Drawing
            // $doc: Draw a line from the current point to the end point
            // $arg x: The x-coordinate of the end point
            // $arg y: The y-coordinate of the end point
            'drawLine': ([x, y]) => this.drawLine(x, y),

            // $function: drawMove
            // $group: Drawing
            // $doc: Move the path's drawing point
            // $arg x: The x-coordinate of the drawing point
            // $arg y: The y-coordinate of the drawing point
            'drawMove': ([x, y]) => this.drawMove(x, y),

            // $function: drawOnClick
            // $group: Drawing
            // $doc: Set the most recent drawing object's on-click event handler
            // $arg callback: The click event callback function (x, y)
            'drawOnClick': ([callback]) => this.drawOnClick(callback),

            // $function: drawRect
            // $group: Drawing
            // $doc: Draw a rectangle
            // $arg x: The x-coordinate of the rectangle
            // $arg y: The y-coordinate of the rectangle
            // $arg width: The width of the rectangle
            // $arg height: The height of the rectangle
            // $arg rx: Optional (default is null). The horizontal corner radius of the rectangle.
            // $arg ry: Optional (default is null). The vertical corner radius of the rectangle.
            'drawRect': ([x, y, width, height, rx = null, ry = null]) => this.drawRect(x, y, width, height, rx, ry),

            // $function: drawStyle
            // $group: Drawing
            // $doc: Set the current drawing styles
            // $arg stroke: Optional (default is 'black'). The stroke color.
            // $arg strokeWidth: Optional (default is 1). The stroke width.
            // $arg fill: Optional (default is 'none'). The fill color.
            // $arg strokeDashArray: Optional (default is 'none'). The stroke
            // $arg strokeDashArray: [dash array](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/stroke-dasharray#usage_notes).
            'drawStyle': ([stroke = 'black', strokeWidth = 1, fill = 'none', strokeDashArray = 'none']) => (
                this.drawStyle(stroke, strokeWidth, fill, strokeDashArray)
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
            'drawText': ([text, x, y, textAnchor = 'middle', dominantBaseline = 'middle']) => (
                this.drawText(text, x, y, textAnchor, dominantBaseline)
            ),

            // $function: drawTextStyle
            // $group: Drawing
            // $doc: Set the current text drawing styles
            // $arg fontSizePx: Optional (default is null, The default font size). The text font size, in pixels.
            // $arg textFill: Optional (default is 'black'). The text fill color.
            // $arg bold: Optional (default is false). If true, text is bold.
            // $arg italic: Optional (default is false). If true, text is italic.
            // $arg fontFamily: Optional (default is 'Arial, Helvetica, sans-serif'). The text font family.
            'drawTextStyle': ([fontSizePx = null, textFill = 'black', bold = false, italic = false, fontFamily = defaultFontFamily]) => (
                this.drawTextStyle(fontSizePx, textFill, bold, italic, fontFamily)
            ),

            // $function: drawVLine
            // $group: Drawing
            // $doc: Draw a vertical line from the current point to the end point
            // $arg y: The y-coordinate of the end point
            'drawVLine': ([y]) => this.drawVLine(y),

            // $function: getDrawingHeight
            // $group: Drawing
            // $doc: Get the current drawing's height
            // $return: The current drawing's height
            'getDrawingHeight': () => this.drawingHeight,

            // $function: getDrawingWidth
            // $group: Drawing
            // $doc: Get the current drawing's width
            // $return: The current drawing's width
            'getDrawingWidth': () => this.drawingWidth,

            // $function: getTextHeight
            // $group: Drawing
            // $doc: Compute the text's height to fit the width
            // $arg text: The text
            // $arg width: The width of the text. If 0, the default font size (in pixels) is returned.
            // $return: The text's height
            'getTextHeight': ([text, width]) => (width > 0 ? width / (fontWidthRatio * text.length) : this.drawingFontSizePx),

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
            'setDrawingSize': ([width, height]) => this.setDrawingSize(width, height),


            //
            // Element Model functions
            //

            // $function: elementModelRender
            // $group: Element Model
            // $doc: Render an [element model](https://craigahobbs.github.io/element-model/)
            // $arg element: The [element model](https://craigahobbs.github.io/element-model/)
            'elementModelRender': ([elements]) => this.elementModelRender(elements),


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
            // $return: The key's local storage value string or null if the key does not exist
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
            // $arg text: The text to escape
            // $return: The escaped text
            'markdownEscape': ([text]) => escapeMarkdownText(text),

            // $function: markdownHeaderId
            // $group: Markdown
            // $doc: Compute the header element ID for some text
            // $arg text: The text
            // $return: The header element ID
            'markdownHeaderId': ([text]) => markdownHeaderId(text),

            // $function: markdownParse
            // $group: Markdown
            // $doc: Parse Markdown text
            // $arg lines: The Markdown text lines (may contain nested arrays of un-split lines)
            // $return: The [Markdown model](https://craigahobbs.github.io/markdown-model/model/#var.vName='Markdown')
            'markdownParse': (lines) => parseMarkdown(flattenAndSplitLines(lines)),

            // $function: markdownPrint
            // $group: Markdown
            // $doc: Render Markdown text
            // $arg lines: The Markdown text lines (may contain nested arrays of un-split lines)
            'markdownPrint': (lines) => this.markdownPrint(lines),

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
            'schemaPrint': ([types, typeName, actionURLs = null]) => this.schemaPrint(types, typeName, actionURLs),

            // $function: schemaTypeModel
            // $group: Schema
            // $doc: Get the [Schema Markdown Type Model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
            // $return: The [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
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
            // $arg types: The [type model](https://craigahobbs.github.io/schema-markdown-doc/doc/#var.vName='Types')
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
            // $return: The key's session storage value string or null if the key does not exist
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
    }


    reset() {
        this.documentFocus = null;
        this.documentTitle = null;
        this.isDocumentReset = false;
        this.windowLocation = null;
        this.windowTimeout = null;
        return this.resetElements();
    }


    resetElements() {
        let elements = null;
        if (this.elements !== null) {
            this.setElements();
            ({elements} = this);
        }
        this.elements = null;
        return elements;
    }


    setElements() {
        if (this.elements === null) {
            this.elements = [];
        }
        this.finishDrawingPath();
        this.finishMarkdown();
    }


    getDrawingSVG() {
        const par = (this.elements.length !== 0 ? this.elements[this.elements.length - 1] : null);
        const svg = (par !== null && par.html === 'p' && 'elem' in par ? par.elem : null);
        return svg !== null && svg.svg === 'svg' ? svg : null;
    }


    setDrawing(newDrawing = false) {
        this.setElements();
        let svg = this.getDrawingSVG();
        if (svg === null || newDrawing) {
            svg = {
                'svg': 'svg',
                'attr': {
                    'width': this.drawingWidth,
                    'height': this.drawingHeight
                },
                'elem': []
            };
            this.elements.push({'html': 'p', 'elem': svg});
        }
        return svg;
    }


    setDrawingPath() {
        if (this.drawingPath === null) {
            const svg = this.setDrawing();
            svg.elem.push({
                'svg': 'path',
                'attr': {
                    'fill': this.drawingPathFill,
                    'stroke': this.drawingPathStroke,
                    'stroke-width': this.drawingPathStrokeWidth,
                    'stroke-dasharray': this.drawingPathStrokeDashArray,
                    'd': ''
                }
            });
            this.drawingPath = [];
        }
    }


    finishDrawingPath() {
        if (this.drawingPath !== null) {
            const svg = this.getDrawingSVG();
            const path = svg.elem[svg.elem.length - 1];
            // eslint-disable-next-line id-length
            path.attr.d = this.drawingPath.join(' ');
            this.drawingPath = null;
        }
    }


    setMarkdown() {
        if (this.markdown === null) {
            this.setElements();
            this.markdown = [];
        }
    }


    finishMarkdown() {
        if (this.markdown !== null) {
            const markdownOptions = {'headerIds': true, 'urlFn': this.options.urlFn};
            this.elements.push(markdownElements(parseMarkdown(this.markdown), markdownOptions));
            this.markdown = null;
        }
    }


    //
    // Document functions
    //


    documentReset() {
        this.isDocumentReset = true;
    }


    setDocumentFocus(id) {
        this.documentFocus = id;
    }


    setDocumentTitle(title) {
        this.documentTitle = title;
    }


    setWindowLocation(location) {
        this.windowLocation = this.options.urlFn(location);
    }


    setWindowResize(callback) {
        this.windowResize = () => {
            this.options.statementCount = 0;
            callback([], this.options);
            this.options.runtimeUpdateFn();
        };
    }


    setWindowTimeout(callback, delay) {
        this.windowTimeout = [
            () => {
                this.options.statementCount = 0;
                callback([], this.options);
                this.options.runtimeUpdateFn();
            },
            delay
        ];
    }


    //
    // Drawing functions
    //


    drawArc(rx, ry, angle, largeArcFlag, sweepFlag, x, y) {
        this.setDrawingPath();
        this.drawingPath.push(
            `A ${rx.toFixed(svgPrecision)} ${ry.toFixed(svgPrecision)} ${angle.toFixed(svgPrecision)} ` +
                `${largeArcFlag ? 1 : 0} ${sweepFlag ? 1 : 0} ${x.toFixed(svgPrecision)} ${y.toFixed(svgPrecision)}`
        );
    }


    drawCircle(cx, cy, r) {
        const svg = this.setDrawing();
        svg.elem.push({
            'svg': 'circle',
            'attr': {
                'fill': this.drawingPathFill,
                'stroke': this.drawingPathStroke,
                'stroke-width': this.drawingPathStrokeWidth.toFixed(svgPrecision),
                'stroke-dasharray': this.drawingPathStrokeDashArray,
                'cx': cx,
                'cy': cy,
                'r': r
            }
        });
    }


    drawClose() {
        this.setDrawingPath();
        this.drawingPath.push('Z');
    }


    drawEllipse(cx, cy, rx, ry) {
        const svg = this.setDrawing();
        svg.elem.push({
            'svg': 'ellipse',
            'attr': {
                'fill': this.drawingPathFill,
                'stroke': this.drawingPathStroke,
                'stroke-width': this.drawingPathStrokeWidth.toFixed(svgPrecision),
                'stroke-dasharray': this.drawingPathStrokeDashArray,
                'cx': cx,
                'cy': cy,
                'rx': rx,
                'ry': ry
            }
        });
    }


    drawHLine(x) {
        this.setDrawingPath();
        this.drawingPath.push(`H ${x.toFixed(svgPrecision)}`);
    }


    drawImage(x, y, width, height, href) {
        const svg = this.setDrawing();
        svg.elem.push({
            'svg': 'image',
            'attr': {
                'x': x,
                'y': y,
                'width': width,
                'height': height,
                'href': this.options.urlFn(href)
            }
        });
    }


    drawLine(x, y) {
        this.setDrawingPath();
        this.drawingPath.push(`L ${x.toFixed(svgPrecision)} ${y.toFixed(svgPrecision)}`);
    }


    drawMove(x, y) {
        this.setDrawingPath();
        this.drawingPath.push(`M ${x.toFixed(svgPrecision)} ${y.toFixed(svgPrecision)}`);
    }


    drawOnClick(callback) {
        const svg = this.setDrawing();
        const clickElement = svg.elem.length === 0 ? svg : svg.elem[svg.elem.length - 1];
        clickElement.callback = (element) => {
            element.addEventListener('click', (event) => {
                const boundingRect = event.target.ownerSVGElement.getBoundingClientRect();
                this.options.statementCount = 0;
                callback([event.clientX - boundingRect.left, event.clientY - boundingRect.top], this.options);
                this.options.runtimeUpdateFn();
            });
        };
    }


    drawRect(x, y, width, height, rx = null, ry = null) {
        const svg = this.setDrawing();
        const element = {
            'svg': 'rect',
            'attr': {
                'fill': this.drawingPathFill,
                'stroke': this.drawingPathStroke,
                'stroke-width': this.drawingPathStrokeWidth.toFixed(svgPrecision),
                'stroke-dasharray': this.drawingPathStrokeDashArray,
                'x': x,
                'y': y,
                'width': width,
                'height': height
            }
        };
        if (rx !== null) {
            element.attr.rx = rx;
        }
        if (ry !== null) {
            element.attr.ry = ry;
        }
        svg.elem.push(element);
    }


    drawStyle(stroke = 'black', strokeWidth = 1, fill = 'none', strokeDashArray = 'none') {
        if (stroke !== this.drawingPathStroke || strokeWidth !== this.drawingPathStrokeWidth ||
            strokeDashArray !== this.drawingPathStrokeDashArray || fill !== this.drawingPathFill
        ) {
            this.setDrawing();
            this.drawingPathStroke = stroke;
            this.drawingPathStrokeWidth = strokeWidth;
            this.drawingPathStrokeDashArray = strokeDashArray;
            this.drawingPathFill = fill;
        }
    }


    drawText(text, x, y, textAnchor = 'middle', dominantBaseline = 'middle') {
        const svg = this.setDrawing();
        svg.elem.push({
            'svg': 'text',
            'attr': {
                'fill': this.drawingFontFill,
                'font-family': this.drawingFontFamily,
                'font-size': this.drawingFontSizePx.toFixed(svgPrecision),
                'text-anchor': textAnchor,
                'dominant-baseline': dominantBaseline,
                'font-weight': (this.drawingFontBold ? 'bold' : 'normal'),
                'font-style': (this.drawingFontItalic ? 'italic' : 'normal'),
                'x': x,
                'y': y
            },
            'elem': {'text': text}
        });
    }


    drawTextStyle(fontSizePx = null, textFill = 'black', bold = false, italic = false, fontFamily = defaultFontFamily) {
        this.drawingFontSizePx = (fontSizePx !== null ? fontSizePx : this.options.fontSize * pixelsPerPoint);
        this.drawingFontFill = textFill;
        this.drawingFontBold = bold;
        this.drawingFontItalic = italic;
        this.drawingFontFamily = fontFamily;
    }


    drawVLine(y) {
        this.setDrawingPath();
        this.drawingPath.push(`V ${y.toFixed(svgPrecision)}`);
    }


    setDrawingSize(width, height) {
        this.drawingWidth = width;
        this.drawingHeight = height;
        this.setDrawing(true);
    }


    //
    // Element Model functions
    //


    elementModelRender(elements) {
        this.setElements();
        this.elementModelWrapCallbacks(elements);
        this.elements.push(validateElements(elements));
    }


    elementModelWrapCallbacks(elements) {
        if (Array.isArray(elements)) {
            for (const childElements of elements) {
                this.elementModelWrapCallbacks(childElements);
            }
        } else if (typeof elements === 'object') {
            if ('elem' in elements) {
                this.elementModelWrapCallbacks(elements.elem);
            }

            // Element callback attribute must be map of event => callback
            if ('callback' in elements) {
                const elementEvents = elements.callback;
                if (elementEvents !== null && typeof elementEvents === 'object') {
                    // Wrap the event handler function
                    elements.callback = (element) => {
                        // On element render, add a listener for each event
                        for (const [elementEvent, elementEventCallback] of Object.entries(elementEvents)) {
                            element.addEventListener(elementEvent, (event) => {
                                // Determine the event callback args
                                const eventArgs = [];
                                if (elementEvent === 'keydown' || elementEvent === 'keypress' || elementEvent === 'keyup') {
                                    eventArgs.push(event.keyCode);
                                }

                                // Call the event handler
                                this.options.statementCount = 0;
                                elementEventCallback(eventArgs, this.options);
                                this.options.runtimeUpdateFn();
                            });
                        }
                    };
                }
            }
        }
    }


    //
    // Markdown functions
    //


    markdownPrint(lines) {
        this.setMarkdown();
        this.markdown.push(...flattenAndSplitLines(lines));
    }


    //
    // Schema functions
    //


    schemaPrint(types, typeName, actionURLs = null) {
        const params = encodeQueryString(this.options.params);
        const options = {params};
        if (actionURLs !== null) {
            options.actionURLs = actionURLs;
        }
        this.setElements();
        this.elements.push(schemaMarkdownDoc(types, typeName, options));
    }
}


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
