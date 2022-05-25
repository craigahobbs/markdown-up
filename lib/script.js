// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/script */

import {encodeMarkdownText, getMarkdownTitle, parseMarkdown} from '../markdown-model/lib/parser.js';
import {validateType, validateTypeModel} from '../schema-markdown/lib/schema.js';
import {SchemaMarkdownParser} from '../schema-markdown/lib/parser.js';
import {encodeQueryString} from '../schema-markdown/lib/encode.js';
import {executeScriptAsync} from '../calc-script/lib/runtimeAsync.js';
import {markdownElements} from '../markdown-model/lib/elements.js';
import {parseScript} from '../calc-script/lib/parser.js';
import {schemaMarkdownDoc} from '../schema-markdown-doc/lib/schemaMarkdownDoc.js';
import {typeModel} from '../schema-markdown/lib/typeModel.js';


/**
 * markdown-script code block function
 *
 * @async
 * @param {string} language - The code block language
 * @param {string[]} lines - The code block's text lines
 * @param {Object} options - The [markdown-script options]{@link module:lib/util~MarkdownScriptOptions}
 * @returns {Object} The generated element model
 */
export async function markdownScriptCodeBlock(language, lines, options) {
    // Add the options variables to the runtime's globals
    const {runtime} = options;
    if ('variables' in options) {
        Object.assign(runtime.globals, options.variables);
    }

    // Execute the calculation script
    let errorMessage = null;
    try {
        await executeScriptAsync(parseScript(lines), runtime.globals, options);
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
 * @property {?string} documentTitle - The the runtime-set document title
 * @property {boolean} isDocumentReset - If true, the runtime requested a document-reset
 * @property {?string} windowLocation - The the runtime-set document location
 * @property {?function} windowTimeout - The the runtime-set timeout args (callback, delay, param)
 */
export class MarkdownScriptRuntime {
    /**
     * @param {Object} options - The [markdown-script options]{@link module:lib/util~MarkdownScriptOptions}
     */
    constructor(options) {
        this.options = options;
        this.globals = this.createGlobals();
        this.elements = null;
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
            // Document functions
            'documentReset': () => this.documentReset(),
            'getDocumentFontSize': () => this.options.fontSize * pixelsPerPoint,
            'getWindowHeight': () => this.options.window.innerHeight,
            'getWindowWidth': () => this.options.window.innerWidth,
            'setWindowLocation': ([location]) => this.setWindowLocation(location),
            'setWindowResize': ([callback]) => this.setWindowResize(callback),
            'setWindowTimeout': ([callback, delay, param]) => this.setWindowTimeout(callback, delay, param),
            'setDocumentTitle': ([title]) => this.setDocumentTitle(title),

            // Drawing functions
            'drawArc': (args) => this.drawArc(...args),
            'drawCircle': (args) => this.drawCircle(...args),
            'drawClose': () => this.drawClose(),
            'drawEllipse': (args) => this.drawEllipse(...args),
            'drawHLine': (args) => this.drawHLine(...args),
            'drawImage': (args) => this.drawImage(...args),
            'drawLine': (args) => this.drawLine(...args),
            'drawMove': (args) => this.drawMove(...args),
            'drawOnClick': (args) => this.drawOnClick(...args),
            'drawRect': (args) => this.drawRect(...args),
            'drawStyle': (args) => this.drawStyle(...args),
            'drawText': (args) => this.drawText(...args),
            'drawTextStyle': (args) => this.drawTextStyle(...args),
            'drawVLine': (args) => this.drawVLine(...args),
            'getDrawingHeight': () => this.drawingHeight,
            'getDrawingWidth': () => this.drawingWidth,
            'getTextHeight': (args) => this.drawTextHeight(...args),
            'getTextWidth': (args) => this.drawTextWidth(...args),
            'setDrawingSize': (args) => this.setDrawingSize(...args),

            // Local storage functions
            'localStorageGet': ([key]) => this.options.window.localStorage.getItem(key),
            'localStorageSet': ([key, value]) => this.options.window.localStorage.setItem(key, value),
            'localStorageRemove': ([key]) => this.options.window.localStorage.removeItem(key),
            'localStorageClear': () => this.options.window.localStorage.clear(),

            // Markdown functions
            'markdownEncode': (args) => encodeMarkdownText(...args),
            'markdownParse': (lines) => parseMarkdown(MarkdownScriptRuntime.flattenAndSplitLines(lines)),
            'markdownPrint': (lines) => this.markdownPrint(lines),
            'markdownTitle': ([markdownModel]) => getMarkdownTitle(markdownModel),

            // Schema functions
            'schemaParse': (lines) => MarkdownScriptRuntime.schemaParse(lines),
            'schemaTypeModel': () => typeModel,
            'schemaValidate': ([types, typeName, value]) => validateType(types, typeName, value),
            'schemaValidateTypeModel': ([types]) => validateTypeModel(types),
            'schemaPrint': ([types, typeName, actionURLs]) => this.schemaPrint(types, typeName, actionURLs),

            // Session storage functions
            'sessionStorageGet': ([key]) => this.options.window.sessionStorage.getItem(key),
            'sessionStorageSet': ([key, value]) => this.options.window.sessionStorage.setItem(key, value),
            'sessionStorageRemove': ([key]) => this.options.window.sessionStorage.removeItem(key),
            'sessionStorageClear': () => this.options.window.sessionStorage.clear()
        };
    }


    reset() {
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


    setDocumentTitle(title) {
        this.documentTitle = title;
    }


    setWindowLocation(location) {
        this.windowLocation = this.options.urlFn(location);
    }


    setWindowResize(callback) {
        this.windowResize = () => {
            callback([]);
            this.options.runtimeUpdateFn();
        };
    }


    setWindowTimeout(callback, delay, param) {
        this.windowTimeout = [
            (callbackParam) => {
                callback([callbackParam]);
                this.options.runtimeUpdateFn();
            },
            delay,
            param
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
                callback([event.clientX - boundingRect.left, event.clientY - boundingRect.top]);
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
