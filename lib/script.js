// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/script */

import {encodeMarkdownText, getMarkdownTitle, parseMarkdown} from '../markdown-model/lib/parser.js';
import {markdownElements, markdownHeaderId} from '../markdown-model/lib/elements.js';
import {validateType, validateTypeModel} from '../schema-markdown/lib/schema.js';
import {SchemaMarkdownParser} from '../schema-markdown/lib/parser.js';
import {encodeQueryString} from '../schema-markdown/lib/encode.js';
import {executeScriptAsync} from '../calc-script/lib/runtimeAsync.js';
import {parseScript} from '../calc-script/lib/parser.js';
import {schemaMarkdownDoc} from '../schema-markdown-doc/lib/schemaMarkdownDoc.js';
import {typeModel} from '../schema-markdown/lib/typeModel.js';
import {validateElements} from '../element-model/lib/elementModel.js';


/**
 * markdown-script code block function
 *
 * @async
 * @param {object} codeBlock - The code block model
 * @param {Object} options - The [markdown-script options]{@link module:lib/util~MarkdownScriptOptions}
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
 * markdown-script runtime state
 *
 * @property {Object} options - The [markdown-script options]{@link module:lib/util~MarkdownScriptOptions}
 * @property {?Object[]} elements - The runtime-generated element model
 * @property {?string} documentFocus - The the runtime-set element ID to set input focus
 * @property {?string} documentTitle - The the runtime-set document title
 * @property {boolean} isDocumentReset - If true, the runtime requested a document-reset
 * @property {?string} windowLocation - The the runtime-set document location
 * @property {?function} windowTimeout - The the runtime-set timeout args (callback, delay)
 */
export class MarkdownScriptRuntime {
    /**
     * @param {Object} options - The [markdown-script options]{@link module:lib/util~MarkdownScriptOptions}
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

            /* c8 ignore start */

            // $function: documentURL
            // $group: Document
            // $doc: Fix-up relative URLs
            // $arg url: The URL
            // $return: The fixed-up URL
            'documentURL': ([url]) => this.options.urlFn(url),

            // $function: getDocumentFontSize
            // $group: Document
            // $doc: Get the document font size
            // $return: The document font size, in pixels
            'getDocumentFontSize': () => this.options.fontSize * pixelsPerPoint,

            // $function: getDocumentInputValue
            // $group: Document
            // $doc: Get an input element's value
            // $arg id: The element ID
            // $return: The input element value or null if the element does not exist
            'getDocumentInputValue': ([id]) => this.options.window.document.getElementById(id).value ?? null,

            // $function: getWindowHeight
            // $group: Document
            // $doc: Get the browser window's height
            // $return: The window height
            'getWindowHeight': () => this.options.window.innerHeight,

            // $function: getWindowWidth
            // $group: Document
            // $doc: Get the browser window's width
            // $return: The window width
            'getWindowWidth': () => this.options.window.innerWidth,

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
            // $doc: Set the browser window resize callback function
            // $arg callback: The window resize callback function
            'setWindowResize': ([callback]) => this.setWindowResize(callback),

            // $function: setWindowTimeout
            // $group: Document
            // $doc: Set the browser window timeout callback function
            // $arg callback: The window timeout callback function
            // $arg delay: The delay, in milliseconds, to ellapse before calling the timeout
            'setWindowTimeout': ([callback, delay]) => this.setWindowTimeout(callback, delay),


            //
            // Drawing functions
            //

            // $function: drawArc
            // $group: Drawing
            // $doc: Draw an arc
            // $arg rx: TODO
            // $arg ry: TODO
            // $arg xAxisRotation: TODO
            // $arg largeArcFlag: TODO
            // $arg sweepFlag: TODO
            // $arg px: TODO
            // $arg py: TODO
            'drawArc': ([rx, ry, xAxisRotation, largeArcFlag, sweepFlag, px, py]) => (
                this.drawArc(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, px, py)
            ),

            // $function: drawCircle
            // $group: Drawing
            // $doc: Draw a circle
            // $arg cx: TODO
            // $arg cy: TODO
            // $arg radius: TODO
            'drawCircle': ([cx, cy, radius]) => this.drawCircle(cx, cy, radius),

            // $function: drawClose
            // $group: Drawing
            // $doc: Close the current drawing path
            'drawClose': () => this.drawClose(),

            // $function: drawEllipse
            // $group: Drawing
            // $doc: Draw an ellipse
            // $arg cx: TODO
            // $arg cy: TODO
            // $arg rx: TODO
            // $arg ry: TODO
            'drawEllipse': ([cx, cy, rx, ry]) => this.drawEllipse(cx, cy, rx, ry),

            // $function: drawHLine
            // $group: Drawing
            // $doc: Draw a horizontal line path
            // $arg px: TODO
            'drawHLine': ([px]) => this.drawHLine(px),

            // $function: drawImage
            // $group: Drawing
            // $doc: Draw an image
            // $arg px: TODO
            // $arg py: TODO
            // $arg width: TODO
            // $arg height: TODO
            // $arg href: TODO
            'drawImage': ([px, py, width, height, href]) => this.drawImage(px, py, width, height, href),

            // $function: drawLine
            // $group: Drawing
            // $doc: Draw a line path
            // $arg px: TODO
            // $arg py: TODO
            'drawLine': ([px, py]) => this.drawLine(px, py),

            // $function: drawMove
            // $group: Drawing
            // $doc: Move the path's drawing location
            // $arg px: TODO
            // $arg py: TODO
            'drawMove': ([px, py]) => this.drawMove(px, py),

            // $function: drawOnClick
            // $group: Drawing
            // $doc: Set the most recent drawing object's on-click callback function
            // $arg callback: TODO
            'drawOnClick': ([callback]) => this.drawOnClick(callback),

            // $function: drawRect
            // $group: Drawing
            // $doc: Draw a rectangle
            // $arg px: TODO
            // $arg py: TODO
            // $arg width: TODO
            // $arg height: TODO
            // $arg rx: TODO = null
            // $arg ry: TODO = null
            'drawRect': ([px, py, width, height, rx = null, ry = null]) => this.drawRect(px, py, width, height, rx, ry),

            // $function: drawStyle
            // $group: Drawing
            // $doc: Set the current drawing styles
            // $arg stroke: TODO = 'black'
            // $arg strokeWidth: TODO = 1
            // $arg fill: TODO = 'none'
            // $arg strokeDashArray: TODO = 'none'
            'drawStyle': ([stroke = 'black', strokeWidth = 1, fill = 'none', strokeDashArray = 'none']) => (
                this.drawStyle(stroke, strokeWidth, fill, strokeDashArray)
            ),

            // $function: drawText
            // $group: Drawing
            // $doc: Draw text
            // $arg text: TODO
            // $arg px: TODO
            // $arg py: TODO
            // $arg textAnchor: TODO = 'middle'
            // $arg dominantBaseline: TODO = 'middle'
            'drawText': ([text, px, py, textAnchor = 'middle', dominantBaseline = 'middle']) => (
                this.drawText(text, px, py, textAnchor, dominantBaseline)
            ),

            // $function: drawTextStyle
            // $group: Drawing
            // $doc: Set the current text drawing styles
            // $arg fontSizePx: TODO = null
            // $arg textFill: TODO = 'black'
            // $arg bold: TODO = false
            // $arg italic: TODO = false
            // $arg fontFamily: TODO = defaultFontFamily
            'drawTextStyle': ([fontSizePx = null, textFill = 'black', bold = false, italic = false, fontFamily = defaultFontFamily]) => (
                this.drawTextStyle(fontSizePx, textFill, bold, italic, fontFamily)
            ),

            // $function: drawVLine
            // $group: Drawing
            // $doc: Draw a vertical line path
            // $arg py: TODO
            'drawVLine': ([py]) => this.drawVLine(py),

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
            // $doc: Compute the text's height
            // $arg text: TODO
            // $arg width: TODO
            // $return: The text's height
            'getTextHeight': ([text, width]) => this.drawTextHeight(text, width),

            // $function: getTextWidth
            // $group: Drawing
            // $doc: Compute the text's width
            // $arg text: TODO
            // $return: The text's width
            'getTextWidth': ([text]) => this.drawTextWidth(text),

            // $function: setDrawingSize
            // $group: Drawing
            // $doc: Set the current drawing's size
            // $arg width: TODO
            // $arg height: TODO
            'setDrawingSize': ([width, height]) => this.setDrawingSize(width, height),


            //
            // Element Model functions
            //

            // $function: elementModelRender
            // $group: Element Model
            // $doc: Render an [element model](https://craigahobbs.github.io/element-model/)
            // $arg element: TODO
            'elementModelRender': ([elements]) => this.elementModelRender(elements),


            //
            // Local storage functions
            //

            // $function: localStorageClear
            // $group: Local Storage
            // $doc: TODO
            'localStorageClear': () => this.options.window.localStorage.clear(),

            // $function: localStorageGet
            // $group: Local Storage
            // $doc: TODO
            // $arg key: TODO
            // $return: TODO
            'localStorageGet': ([key]) => this.options.window.localStorage.getItem(key),

            // $function: localStorageSet
            // $group: Local Storage
            // $doc: TODO
            // $arg key: TODO
            // $arg value: TODO
            // $return: TODO
            'localStorageSet': ([key, value]) => this.options.window.localStorage.setItem(key, value),

            // $function: localStorageRemove
            // $group: Local Storage
            // $doc: TODO
            // $arg key: TODO
            'localStorageRemove': ([key]) => this.options.window.localStorage.removeItem(key),


            //
            // Markdown functions
            //

            // $function: markdownEncode
            // $group: Markdown
            // $doc: TODO
            // $arg text: TODO
            // $return: TODO
            'markdownEncode': ([text]) => encodeMarkdownText(text),

            // $function: markdownHeaderId
            // $group: Markdown
            // $doc: TODO
            // $arg text: TODO
            // $return: TODO
            'markdownHeaderId': ([text]) => markdownHeaderId(text),

            // $function: markdownParse
            // $group: Markdown
            // $doc: TODO
            // $arg lines: TODO
            // $return: TODO
            'markdownParse': (lines) => parseMarkdown(flattenAndSplitLines(lines)),

            // $function: markdownPrint
            // $group: Markdown
            // $doc: TODO
            // $arg lines: TODO
            'markdownPrint': (lines) => this.markdownPrint(lines),

            // $function: markdownTitle
            // $group: Markdown
            // $doc: TODO
            // $arg markdownModel: TODO
            // $return: TODO
            'markdownTitle': ([markdownModel]) => getMarkdownTitle(markdownModel),


            //
            // Schema functions
            //

            // $function: schemaParse
            // $group: Schema
            // $doc: TODO
            // $arg lines: TODO
            // $return: TODO
            'schemaParse': (lines) => MarkdownScriptRuntime.schemaParse(lines),

            // $function: schemaTypeModel
            // $group: Schema
            // $doc: TODO
            // $return: TODO
            'schemaTypeModel': () => typeModel,

            // $function: schemaValidate
            // $group: Schema
            // $doc: TODO
            // $arg types: TODO
            // $arg typeName: TODO
            // $arg value: TODO
            // $return: TODO
            'schemaValidate': ([types, typeName, value]) => this.schemaValidate(types, typeName, value),

            // $function: schemaValidateTypeModel
            // $group: Schema
            // $doc: TODO
            // $arg types: TODO
            // $return: TODO
            'schemaValidateTypeModel': ([types]) => this.schemaValidateTypeModel(types),

            // $function: schemaPrint
            // $group: Schema
            // $doc: TODO
            // $arg types: TODO
            // $arg typeName: TODO
            // $arg actionURLs: TODO
            'schemaPrint': ([types, typeName, actionURLs]) => this.schemaPrint(types, typeName, actionURLs),


            //
            // Session storage functions
            //

            // $function: sessionStorageClear
            // $group: Session Storage
            // $doc: TODO
            'sessionStorageClear': () => this.options.window.sessionStorage.clear(),

            // $function: sessionStorageGet
            // $group: Session Storage
            // $doc: TODO
            // $arg key: TODO
            // $return: TODO
            'sessionStorageGet': ([key]) => this.options.window.sessionStorage.getItem(key),

            // $function: sessionStorageSet
            // $group: Session Storage
            // $doc: TODO
            // $arg key: TODO
            // $arg value: TODO
            // $return: TODO
            'sessionStorageSet': ([key, value]) => this.options.window.sessionStorage.setItem(key, value),

            // $function: sessionStorageRemove
            // $group: Session Storage
            // $doc: TODO
            // $arg key: TODO
            'sessionStorageRemove': ([key]) => this.options.window.sessionStorage.removeItem(key)
        };
    }


    /* c8 ignore end */


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


    /* c8 ignore start */


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


    drawArc(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, px, py) {
        this.setDrawingPath();
        this.drawingPath.push(
            `A ${rx.toFixed(svgPrecision)} ${ry.toFixed(svgPrecision)} ${xAxisRotation.toFixed(svgPrecision)} ` +
                `${largeArcFlag ? 1 : 0} ${sweepFlag ? 1 : 0} ${px.toFixed(svgPrecision)} ${py.toFixed(svgPrecision)}`
        );
    }


    drawCircle(cx, cy, radius) {
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
                'r': radius
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


    drawHLine(px) {
        this.setDrawingPath();
        this.drawingPath.push(`H ${px.toFixed(svgPrecision)}`);
    }


    drawImage(px, py, width, height, href) {
        const svg = this.setDrawing();
        svg.elem.push({
            'svg': 'image',
            'attr': {
                'x': px,
                'y': py,
                'width': width,
                'height': height,
                'href': this.options.urlFn(href)
            }
        });
    }


    drawLine(px, py) {
        this.setDrawingPath();
        this.drawingPath.push(`L ${px.toFixed(svgPrecision)} ${py.toFixed(svgPrecision)}`);
    }


    drawMove(px, py) {
        this.setDrawingPath();
        this.drawingPath.push(`M ${px.toFixed(svgPrecision)} ${py.toFixed(svgPrecision)}`);
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


    drawRect(px, py, width, height, rx = null, ry = null) {
        const svg = this.setDrawing();
        const element = {
            'svg': 'rect',
            'attr': {
                'fill': this.drawingPathFill,
                'stroke': this.drawingPathStroke,
                'stroke-width': this.drawingPathStrokeWidth.toFixed(svgPrecision),
                'stroke-dasharray': this.drawingPathStrokeDashArray,
                'x': px,
                'y': py,
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


    drawText(text, px, py, textAnchor = 'middle', dominantBaseline = 'middle') {
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
                'x': px,
                'y': py
            },
            'elem': {'text': text}
        });
    }


    drawTextHeight(text, width) {
        return width > 0 ? width / (fontWidthRatio * text.length) : this.drawingFontSizePx;
    }


    drawTextStyle(fontSizePx = null, textFill = 'black', bold = false, italic = false, fontFamily = defaultFontFamily) {
        this.drawingFontSizePx = (fontSizePx !== null ? fontSizePx : this.options.fontSize);
        this.drawingFontFill = textFill;
        this.drawingFontBold = bold;
        this.drawingFontItalic = italic;
        this.drawingFontFamily = fontFamily;
    }


    drawTextWidth(text) {
        return fontWidthRatio * this.drawiingFontSizePx * text.length;
    }


    drawVLine(py) {
        this.setDrawingPath();
        this.drawingPath.push(`V ${py.toFixed(svgPrecision)}`);
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
                if (typeof elementEvents !== 'object') {
                    elements.callback = null;
                } else {
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


    static schemaParse(lines) {
        const parser = new SchemaMarkdownParser();
        parser.parse(flattenAndSplitLines(lines));
        return parser.types;
    }


    schemaValidate(types, typeName, value) {
        try {
            return validateType(types, typeName, value);
        } catch ({message}) {
            if ('logFn' in this.options) {
                this.options.logFn(`Error: schemaValidate failed for type "${typeName}" with error: ${message}`);
            }
            return null;
        }
    }


    schemaValidateTypeModel(types) {
        try {
            return validateTypeModel(types);
        } catch ({message}) {
            if ('logFn' in this.options) {
                this.options.logFn(
                    `Error: schemaValidateTypeModel failed with error: ${message}`
                );
            }
            return null;
        }
    }


    schemaPrint(types, typeName, actionURLs = null) {
        const params = encodeQueryString(this.options.params);
        const options = {params};
        if (actionURLs !== null) {
            options.actionURLs = actionURLs;
        }
        this.setElements();
        this.elements.push(schemaMarkdownDoc(types, typeName, {params, actionURLs}));
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
