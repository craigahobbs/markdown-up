// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/script */

import {encodeMarkdownText, getMarkdownTitle, parseMarkdown} from 'markdown-model/lib/parser.js';
import {markdownElements, markdownHeaderId} from 'markdown-model/lib/elements.js';
import {validateType, validateTypeModel} from 'schema-markdown/lib/schema.js';
import {SchemaMarkdownParser} from 'schema-markdown/lib/parser.js';
import {encodeQueryString} from 'schema-markdown/lib/encode.js';
import {executeScriptAsync} from 'calc-script/lib/runtimeAsync.js';
import {parseScript} from 'calc-script/lib/parser.js';
import {schemaMarkdownDoc} from 'schema-markdown-doc/lib/schemaMarkdownDoc.js';
import {typeModel} from 'schema-markdown/lib/typeModel.js';
import {validateElements} from 'element-model/lib/elementModel.js';


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
    const {runtime} = options;
    if ('variables' in options) {
        Object.assign(runtime.globals, options.variables);
    }

    // Execute the calculation script
    let errorMessage = null;
    try {
        await executeScriptAsync(parseScript(codeBlock.lines, codeBlock.startLineNumber + 1), runtime.globals, options);
    } catch ({message}) {
        errorMessage = message;
    }

    // Reset the runtime
    let elements = runtime.resetElements();

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


// Line-splitting regex
const rLineSplit = /\r?\n/;


/**
 * markdown-script runtime state
 *
 * @property {Object} globals - The global variables
 * @property {Object} options - The [markdown-script options]{@link module:lib/util~MarkdownScriptOptions}
 * @property {?Object[]} elements - The runtime-generated element model
 * @property {?string} documentFocus - The the runtime-set elment ID to set input focus
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
        this.globals = this.createGlobals();
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
            // $doc: TODO
            'documentURL': ([url]) => this.options.urlFn(url),

            // $function: getDocumentInputValue
            // $group: Document
            // $doc: TODO
            'getDocumentInputValue': ([id]) => this.options.window.document.getElementById(id).value,

            // $function: getDocumentFontSize
            // $group: Document
            // $doc: TODO
            'getDocumentFontSize': () => this.options.fontSize * pixelsPerPoint,

            // $function: getWindowHeight
            // $group: Document
            // $doc: TODO
            'getWindowHeight': () => this.options.window.innerHeight,

            // $function: getWindowWidth
            // $group: Document
            // $doc: TODO
            'getWindowWidth': () => this.options.window.innerWidth,

            // $function: setDocumentFocus
            // $group: Document
            // $doc: TODO
            'setDocumentFocus': ([id]) => this.setDocumentFocus(id),

            // $function: setDocumentTitle
            // $group: Document
            // $doc: TODO
            'setDocumentTitle': ([title]) => this.setDocumentTitle(title),

            // $function: setWindowLocation
            // $group: Document
            // $doc: TODO
            'setWindowLocation': ([location]) => this.setWindowLocation(location),

            // $function: setWindowResize
            // $group: Document
            // $doc: TODO
            'setWindowResize': ([callback]) => this.setWindowResize(callback),

            // $function: setWindowTimeout
            // $group: Document
            // $doc: TODO
            'setWindowTimeout': ([callback, delay]) => this.setWindowTimeout(callback, delay),


            //
            // Drawing functions
            //

            // $function: drawArc
            // $group: Drawing
            // $doc: TODO
            'drawArc': (args) => this.drawArc(...args),

            // $function: drawCircle
            // $group: Drawing
            // $doc: TODO
            'drawCircle': (args) => this.drawCircle(...args),

            // $function: drawClose
            // $group: Drawing
            // $doc: TODO
            'drawClose': () => this.drawClose(),

            // $function: drawEllipse
            // $group: Drawing
            // $doc: TODO
            'drawEllipse': (args) => this.drawEllipse(...args),

            // $function: drawHLine
            // $group: Drawing
            // $doc: TODO
            'drawHLine': (args) => this.drawHLine(...args),

            // $function: drawImage
            // $group: Drawing
            // $doc: TODO
            'drawImage': (args) => this.drawImage(...args),

            // $function: drawLine
            // $group: Drawing
            // $doc: TODO
            'drawLine': (args) => this.drawLine(...args),

            // $function: drawMove
            // $group: Drawing
            // $doc: TODO
            'drawMove': (args) => this.drawMove(...args),

            // $function: drawOnClick
            // $group: Drawing
            // $doc: TODO
            'drawOnClick': (args) => this.drawOnClick(...args),

            // $function: drawRect
            // $group: Drawing
            // $doc: TODO
            'drawRect': (args) => this.drawRect(...args),

            // $function: drawStyle
            // $group: Drawing
            // $doc: TODO
            'drawStyle': (args) => this.drawStyle(...args),

            // $function: drawText
            // $group: Drawing
            // $doc: TODO
            'drawText': (args) => this.drawText(...args),

            // $function: drawTextStyle
            // $group: Drawing
            // $doc: TODO
            'drawTextStyle': (args) => this.drawTextStyle(...args),

            // $function: drawVLine
            // $group: Drawing
            // $doc: TODO
            'drawVLine': (args) => this.drawVLine(...args),

            // $function: getDrawingHeight
            // $group: Drawing
            // $doc: TODO
            'getDrawingHeight': () => this.drawingHeight,

            // $function: getDrawingWidth
            // $group: Drawing
            // $doc: TODO
            'getDrawingWidth': () => this.drawingWidth,

            // $function: getTextHeight
            // $group: Drawing
            // $doc: TODO
            'getTextHeight': (args) => this.drawTextHeight(...args),

            // $function: getTextWidth
            // $group: Drawing
            // $doc: TODO
            'getTextWidth': (args) => this.drawTextWidth(...args),

            // $function: setDrawingSize
            // $group: Drawing
            // $doc: TODO
            'setDrawingSize': (args) => this.setDrawingSize(...args),


            //
            // Element Model functions
            //

            // $function: elementModelRender
            // $group: Element Model
            // $doc: TODO
            'elementModelRender': ([elements]) => this.elementModelRender(elements),


            //
            // Local storage functions
            //

            // $function: localStorageGet
            // $group: Local Storage
            // $doc: TODO
            'localStorageGet': ([key]) => this.options.window.localStorage.getItem(key),

            // $function: localStorageSet
            // $group: Local Storage
            // $doc: TODO
            'localStorageSet': ([key, value]) => this.options.window.localStorage.setItem(key, value),

            // $function: localStorageRemove
            // $group: Local Storage
            // $doc: TODO
            'localStorageRemove': ([key]) => this.options.window.localStorage.removeItem(key),

            // $function: localStorageClear
            // $group: Local Storage
            // $doc: TODO
            'localStorageClear': () => this.options.window.localStorage.clear(),


            //
            // Markdown functions
            //

            // $function: markdownEncode
            // $group: Markdown
            // $doc: TODO
            'markdownEncode': (args) => encodeMarkdownText(...args),

            // $function: markdownHeaderId
            // $group: Markdown
            // $doc: TODO
            'markdownHeaderId': ([text]) => markdownHeaderId(text),

            // $function: markdownParse
            // $group: Markdown
            // $doc: TODO
            'markdownParse': (lines) => parseMarkdown(MarkdownScriptRuntime.flattenAndSplitLines(lines)),

            // $function: markdownPrint
            // $group: Markdown
            // $doc: TODO
            'markdownPrint': (lines) => this.markdownPrint(lines),

            // $function: markdownTitle
            // $group: Markdown
            // $doc: TODO
            'markdownTitle': ([markdownModel]) => getMarkdownTitle(markdownModel),


            //
            // Schema functions
            //

            // $function: schemaParse
            // $group: Schema
            // $doc: TODO
            'schemaParse': (lines) => MarkdownScriptRuntime.schemaParse(lines),

            // $function: schemaTypeModel
            // $group: Schema
            // $doc: TODO
            'schemaTypeModel': () => typeModel,

            // $function: schemaValidate
            // $group: Schema
            // $doc: TODO
            'schemaValidate': ([types, typeName, value]) => this.schemaValidate(types, typeName, value),

            // $function: schemaValidateTypeModel
            // $group: Schema
            // $doc: TODO
            'schemaValidateTypeModel': ([types]) => this.schemaValidateTypeModel(types),

            // $function: schemaPrint
            // $group: Schema
            // $doc: TODO
            'schemaPrint': ([types, typeName, actionURLs]) => this.schemaPrint(types, typeName, actionURLs),


            //
            // Session storage functions
            //

            // $function: sessionStorageGet
            // $group: Session Storage
            // $doc: TODO
            'sessionStorageGet': ([key]) => this.options.window.sessionStorage.getItem(key),

            // $function: sessionStorageSet
            // $group: Session Storage
            // $doc: TODO
            'sessionStorageSet': ([key, value]) => this.options.window.sessionStorage.setItem(key, value),

            // $function: sessionStorageRemove
            // $group: Session Storage
            // $doc: TODO
            'sessionStorageRemove': ([key]) => this.options.window.sessionStorage.removeItem(key),

            // $function: sessionStorageClear
            // $group: Session Storage
            // $doc: TODO
            'sessionStorageClear': () => this.options.window.sessionStorage.clear()
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
        this.markdown.push(...MarkdownScriptRuntime.flattenAndSplitLines(lines));
    }


    //
    // Schema functions
    //


    static schemaParse(lines) {
        const parser = new SchemaMarkdownParser();
        parser.parse(MarkdownScriptRuntime.flattenAndSplitLines(lines));
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


    static flattenAndSplitLines(lines) {
        return lines.flat().reduce(
            (result, line) => {
                result.push(...line.split(rLineSplit));
                return result;
            },
            []
        );
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
