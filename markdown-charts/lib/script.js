// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/script */

import {encodeMarkdownText, getMarkdownTitle, parseMarkdown} from '../../markdown-model/lib/parser.js';
import {executeScriptAsync} from '../../calc-script/lib/runtimeAsync.js';
import {markdownElements} from '../../markdown-model/lib/elements.js';
import {parseScript} from '../../calc-script/lib/parser.js';


/**
 * markdown-script code block function
 *
 * @async
 * @param {string} language - The code block language
 * @param {string[]} lines - The code block's text lines
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {Object} The generated element model
 */
export async function markdownScriptCodeBlock(language, lines, options = {}) {
    // Get/create the script's runtime
    const runtime = 'runtime' in options && options.runtime !== null ? options.runtime
        : new MarkdownScriptRuntime({'fontSize': options ? options.fontSize : null});

    // Add the options variables to the runtime's globals
    if ('variables' in options) {
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
    if ('hashFn' in options) {
        markdownElementsOptions.hashFn = options.hashFn;
    }
    if ('url' in options) {
        markdownElementsOptions.url = options.url;
    }

    // Render the element model parts
    const elements = [];
    for (const part of runtime.elementParts) {
        if ('drawing' in part) {
            elements.push({'html': 'p', 'elem': part.drawing});
        } else {
            elements.push(markdownElements(parseMarkdown(part.markdown), markdownElementsOptions));
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
 * @property {module:lib/util~ChartOptions} [options = {}] - The markdown-charts options
 * @property {module:lib/script~ElementPart[]} elementParts - The element model parts to render
 */
export class MarkdownScriptRuntime {
    /**
     * @param {module:lib/util~ChartOptions} [options = {}] - The runtime options
     */
    constructor(options = {}) {
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

            // Markdown functions
            'markdownEncode': (args) => encodeMarkdownText(...args),
            'markdownPrint': (args) => this.markdownPrint(args),
            'markdownTitle': ([text]) => getMarkdownTitle(parseMarkdown(text)),

            // Utility functions
            'setNavigateTimeout': (args) => this.setNavigateTimeout(...args)
        };

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
            'fontSize' in options && options.fontSize !== null ? options.fontSize * pixelsPerPoint : defaultFontSizePx
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

    setMarkdown() {
        let part = this.elementParts.length !== 0 ? this.elementParts[this.elementParts.length - 1] : null;
        const isMarkdown = part !== null && 'markdown' in part;
        if (!isMarkdown) {
            this.finishDrawingPath();
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
        markdownLines.push(...lines);
    }

    setDrawingSize(width, height) {
        this.finishDrawingPath();
        this.drawingWidth = width;
        this.drawingHeight = height;
        this.setDrawing(true);
    }

    setNavigateTimeout(url, delay = 0) {
        if ('navigateTimeoutFn' in this.options && this.navigateTimeoutFn !== null) {
            this.options.navigateTimeoutFn(url, delay);
        }
    }
}
