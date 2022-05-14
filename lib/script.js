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
 * @param {module:lib/util~MarkdownScriptOptions} [options=null] - Markdown script options
 * @returns {Object} The generated element model
 */
export async function markdownScriptCodeBlock(language, lines, options = null) {
    // Get/create the script's runtime
    const runtime = (
        options !== null && 'runtime' in options && options.runtime !== null
            ? options.runtime
            : new MarkdownScriptRuntime(options)
    );

    // Add the options variables to the runtime's globals
    if (options !== null && 'variables' in options) {
        Object.assign(runtime.globals, options.variables);
    }

    // Execute the calculation script
    let errorMessage = null;
    try {
        await executeScriptAsync(parseScript(lines), runtime.globals, options);
    } catch ({message}) {
        errorMessage = message;
    } finally {
        runtime.finishDrawingPath();
    }

    // Create the markdownElements options
    const markdownElementsOptions = {'headerIds': true};
    if (options !== null && 'urlFn' in options) {
        markdownElementsOptions.urlFn = options.urlFn;
    }

    // Render the element model parts
    const elements = [];
    for (const part of runtime.elementParts) {
        if ('drawing' in part) {
            elements.push({'html': 'p', 'elem': part.drawing});
        } else if ('markdown' in part) {
            elements.push(markdownElements(parseMarkdown(part.markdown), markdownElementsOptions));
        } else {
            elements.push(part.elements);
        }
    }
    runtime.elementParts.length = 0;

    // If an error occurred, render the error message
    if (errorMessage !== null) {
        elements.push({'html': 'p', 'elem': {'html': 'pre', 'elem': {'text': errorMessage}}});
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
const defaultFontSizePx = 12 * pixelsPerPoint;


/**
 * @typedef {Object} ElementPart
 * @property {Object} drawing - SVG element model
 * @property {string[]} markdown - Markdown text lines
 */


/**
 * markdown-script runtime state
 *
 * @property {Object} globals - The global variables
 * @property {module:lib/util~MarkdownScriptOptions} [options = null] - Markdown script options
 * @property {module:lib/script~ElementPart[]} elementParts - The element model parts to render
 * @property {?string} documentTitle - The document title
 */
export class MarkdownScriptRuntime {
    /**
     * @param {module:lib/util~MarkdownScriptOptions} [options = null] - Markdown script options
     */
    constructor(options = null) {
        this.options = options;

        // The runtime's global variables
        this.globals = {
            // Drawing functions
            'drawArc': (args) => this.drawArc(...args),
            'drawCircle': (args) => this.drawCircle(...args),
            'drawClose': () => this.drawClose(),
            'drawEllipse': (args) => this.drawEllipse(...args),
            'drawHLine': (args) => this.drawHLine(...args),
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
            'localStorageGetItem': ([key]) => (
                options !== null && 'localStorage' in options ? options.localStorage.getItem(key) : null
            ),
            'localStorageSetItem': ([key, value]) => (
                options !== null && 'localStorage' in options ? options.localStorage.setItem(key, value) : null
            ),
            'localStorageRemoveItem': ([key]) => (
                options !== null && 'localStorage' in options ? options.localStorage.removeItem(key) : null
            ),
            'localStorageClear': () => (
                options !== null && 'localStorage' in options ? options.localStorage.clear() : null
            ),

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
            'sessionStorageGetItem': ([key]) => (
                options !== null && 'sessionStorage' in options ? options.sessionStorage.getItem(key) : null
            ),
            'sessionStorageSetItem': ([key, value]) => (
                options !== null && 'sessionStorage' in options ? options.sessionStorage.setItem(key, value) : null
            ),
            'sessionStorageRemoveItem': ([key]) => (
                options !== null && 'sessionStorage' in options ? options.sessionStorage.removeItem(key) : null
            ),
            'sessionStorageClear': () => (
                options !== null && 'sessionStorage' in options ? options.sessionStorage.clear() : null
            ),

            // Utility functions
            'setDocumentTitle': ([title]) => {
                this.documentTitle = title;
            },
            'setNavigateTimeout': (args) => this.setNavigateTimeout(...args)
        };

        // The document's title
        this.documentTitle = null;

        // Element model parts ('drawing', 'markdown')
        this.elementParts = [];

        // Drawing state
        this.drawingWidth = defaultDrawingWidth;
        this.drawingHeight = defaultDrawingHeight;
        this.drawingPath = [];

        // Drawing path style
        this.drawingPathStroke = 'black';
        this.drawingPathStrokeWidth = 1;
        this.drawingPathStrokeDashArray = 'none';
        this.drawingPathFill = 'none';

        // Drawing text style
        this.drawingFontFamily = defaultFontFamily;
        this.drawingFontSizePx = (
            options !== null && 'fontSize' in options && options.fontSize !== null ? options.fontSize * pixelsPerPoint : defaultFontSizePx
        );
        this.drawingFontFill = 'black';
        this.drawingFontBold = false;
        this.drawingFontItalic = false;
    }

    setDrawing(newDrawing = false) {
        let part = this.elementParts.length !== 0 ? this.elementParts[this.elementParts.length - 1] : null;
        const isDrawing = part !== null && 'drawing' in part;
        if (!isDrawing || (newDrawing && isDrawing)) {
            part = {
                'drawing': {
                    'svg': 'svg',
                    'attr': {
                        'width': this.drawingWidth,
                        'height': this.drawingHeight
                    },
                    'elem': []
                }
            };
            this.elementParts.push(part);
        }
        return part.drawing;
    }

    setElements(elements) {
        const part = this.elementParts.length !== 0 ? this.elementParts[this.elementParts.length - 1] : null;
        const isDrawing = part !== null && 'drawing' in part;
        if (isDrawing) {
            this.finishDrawingPath();
        }
        this.elementParts.push({'elements': elements});
    }

    setMarkdown() {
        let part = this.elementParts.length !== 0 ? this.elementParts[this.elementParts.length - 1] : null;
        const isDrawing = part !== null && 'drawing' in part;
        if (isDrawing) {
            this.finishDrawingPath();
        }
        const isMarkdown = part !== null && 'markdown' in part;
        if (!isMarkdown) {
            part = {'markdown': []};
            this.elementParts.push(part);
        }
        return part.markdown;
    }

    finishDrawingPath() {
        if (this.drawingPath.length !== 0) {
            this.elementParts[this.elementParts.length - 1].drawing.elem.push({
                'svg': 'path',
                'attr': {
                    'fill': this.drawingPathFill,
                    'stroke': this.drawingPathStroke,
                    'stroke-width': this.drawingPathStrokeWidth,
                    'stroke-dasharray': this.drawingPathStrokeDashArray,
                    'd': this.drawingPath.join(' ')
                }
            });
            this.drawingPath.length = 0;
        }
    }

    drawArc(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, px, py) {
        this.setDrawing();
        this.drawingPath.push(
            `A ${rx.toFixed(svgPrecision)} ${ry.toFixed(svgPrecision)} ${xAxisRotation.toFixed(svgPrecision)} ` +
                `${largeArcFlag ? 1 : 0} ${sweepFlag ? 1 : 0} ${px.toFixed(svgPrecision)} ${py.toFixed(svgPrecision)}`
        );
    }

    drawCircle(cx, cy, radius) {
        const svg = this.setDrawing();
        this.finishDrawingPath();
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
        this.setDrawing();
        this.drawingPath.push('Z');
    }

    drawEllipse(cx, cy, rx, ry) {
        const svg = this.setDrawing();
        this.finishDrawingPath();
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
        this.setDrawing();
        this.drawingPath.push(`H ${px.toFixed(svgPrecision)}`);
    }

    drawLine(px, py) {
        this.setDrawing();
        this.drawingPath.push(`L ${px.toFixed(svgPrecision)} ${py.toFixed(svgPrecision)}`);
    }

    drawMove(px, py) {
        this.setDrawing();
        this.drawingPath.push(`M ${px.toFixed(svgPrecision)} ${py.toFixed(svgPrecision)}`);
    }

    drawOnClick(callback) {
        const svg = this.setDrawing();
        const clickElement = svg.elem.length === 0 ? svg : svg.elem[svg.elem.length - 1];
        clickElement.callback = (element) => {
            element.addEventListener('click', (event) => {
                const boundingRect = event.target.ownerSVGElement.getBoundingClientRect();
                callback([event.clientX - boundingRect.left, event.clientY - boundingRect.top]);
            });
        };
    }

    drawRect(px, py, width, height, rx = null, ry = null) {
        const svg = this.setDrawing();
        this.finishDrawingPath();
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
            strokeDashArray !== this.drawingPathStrokeDashArray || fill !== this.drawingPathFill) {
            this.finishDrawingPath();
            this.drawingPathStroke = stroke;
            this.drawingPathStrokeWidth = strokeWidth;
            this.drawingPathStrokeDashArray = strokeDashArray;
            this.drawingPathFill = fill;
        }
    }

    drawText(text, px, py, textAnchor = 'middle', dominantBaseline = 'middle') {
        const svg = this.setDrawing();
        this.finishDrawingPath();
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

    drawTextStyle(fontSizePx = defaultFontSizePx, textFill = 'black', bold = false, italic = false, fontFamily = defaultFontFamily) {
        this.drawingFontSizePx = fontSizePx;
        this.drawingFontFill = textFill;
        this.drawingFontBold = bold;
        this.drawingFontItalic = italic;
        this.drawingFontFamily = fontFamily;
    }

    drawTextWidth(text) {
        return fontWidthRatio * this.drawiingFontSizePx * text.length;
    }

    drawVLine(py) {
        this.setDrawing();
        this.drawingPath.push(`V ${py.toFixed(svgPrecision)}`);
    }

    markdownPrint(lines) {
        const markdownLines = this.setMarkdown();
        markdownLines.push(...MarkdownScriptRuntime.flattenAndSplitLines(lines));
    }

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
        const params = (this.options !== null && 'params' in this.options ? encodeQueryString(this.options.params) : null);
        const options = {params};
        if (actionURLs !== null) {
            options.actionURLs = actionURLs;
        }
        this.setElements(schemaMarkdownDoc(types, typeName, {params, actionURLs}));
    }

    setDrawingSize(width, height) {
        this.finishDrawingPath();
        this.drawingWidth = width;
        this.drawingHeight = height;
        this.setDrawing(true);
    }

    setNavigateTimeout(url, delay = 0) {
        if (this.options !== null && 'navigateTimeoutFn' in this.options && this.navigateTimeoutFn !== null) {
            this.options.navigateTimeoutFn(url, delay);
        }
    }
}


// Line-splitting regex
const rLineSplit = /\r?\n/;
