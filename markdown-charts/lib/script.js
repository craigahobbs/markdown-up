// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/script */

import {encodeMarkdownText, parseMarkdown} from '../../markdown-model/lib/parser.js';
import {executeScript, parseScript} from './calc.js';
import {markdownElements} from '../../markdown-model/lib/elements.js';


/**
 * markdown-script code block function
 *
 * @param {string} language - The code block language
 * @param {string[]} lines - The code block's text lines
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {Object} The generated element model
 */
export function markdownScriptCodeBlock(language, lines, options = {}) {
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
        const scriptModel = parseScript(lines);
        const timeBegin = performance.now();
        executeScript(scriptModel, runtime.globals);
        if ('logFn' in runtime.options) {
            const timeEnd = performance.now();
            runtime.options.logFn(`Script executed in ${(timeEnd - timeBegin).toFixed(1)} milliseconds`);
        }
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
 * A MarkdownScriptRuntime options object
 *
 * @typedef {Object} MarkdownScriptRuntimeOptions
 * @property {module:lib/script~LogFn} [logFn] - The log function
 * @property {module:lib/script~NavigateTimeoutFn} [navigateTimeoutFn] - The navigate timeout function
 * @property {number} [fontSize] - The default font size, in points
 */

/**
 * A log function
 *
 * @callback LogFn
 * @param {string} text - The log text
 */

/**
 * A navigate timeout function
 *
 * @callback NavigateTimeoutFn
 * @param {string} url - The URL to navigate to
 * @param {number} delay - The navigation delay, in milliseconds
 */

/**
 * @typedef {Object} ElementPart
 * @property {Object} drawing - SVG element model
 * @property {string[]} markdown - Markdown text lines
 */


/**
 * markdown-script runtime state
 *
 * @property {Object} globals - The global variables
 * @property {module:lib/script~MarkdownScriptRuntimeOptions} [options = {}] - The runtime options
 * @property {module:lib/script~ElementPart[]} elementParts - The element model parts to render
 */
export class MarkdownScriptRuntime {
    /**
     * @param {module:lib/script~MarkdownScriptRuntimeOptions} [options = {}] - The runtime options
     */
    constructor(options = {}) {
        this.options = options;

        // The runtime's global variables
        this.globals = {
            // Drawing functions
            'drawArc': ([rx, ry, xAxisRotation, largeArcFlag, sweepFlag, px, py]) => (
                this.drawArc(rx, ry, xAxisRotation, largeArcFlag, sweepFlag, px, py)
            ),
            'drawCircle': ([cx, cy, radius]) => this.drawCircle(cx, cy, radius),
            'drawClose': () => this.drawClose(),
            'drawEllipse': ([cx, cy, rx, ry]) => this.drawEllipse(cx, cy, rx, ry),
            'drawHLine': ([px]) => this.drawHLine(px),
            'drawLine': ([px, py]) => this.drawLine(px, py),
            'drawMove': ([px, py]) => this.drawMove(px, py),
            'drawOnClick': ([callback]) => this.drawOnClick(callback),
            'drawRect': ([px, py, width, height, rx, ry]) => this.drawRect(px, py, width, height, rx, ry),
            'drawStyle': ([stroke, strokeWidth, fill, strokeDashArray]) => this.drawStyle(stroke, strokeWidth, fill, strokeDashArray),
            'drawText': ([text, px, py]) => this.drawText(text, px, py),
            'drawTextStyle': ([fontSizePx, textFill, fontFamily]) => this.drawTextStyle(fontSizePx, textFill, fontFamily),
            'drawVLine': ([py]) => this.drawVLine(py),
            'getDrawingHeight': () => this.drawingHeight,
            'getDrawingWidth': () => this.drawingWidth,
            'getTextHeight': ([text, width]) => this.drawTextHeight(text, width),
            'getTextWidth': ([text]) => this.drawTextWidth(text),
            'setDrawingSize': ([width, height]) => this.setDrawingSize(width, height),

            // Markdown functions
            'markdownEncode': ([text]) => encodeMarkdownText(text),
            'markdownPrint': (args) => this.markdownPrint(args),

            // Utility functions
            'log': ([text]) => this.log(text),
            'setNavigateTimeout': ([url, delay = 0]) => this.setNavigateTimeout(url, delay)
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
                'x': px,
                'y': py
            },
            'elem': {'text': text}
        });
    }

    drawTextHeight(text, width) {
        return width > 0 ? width / (fontWidthRatio * text.length) : this.drawingFontSizePx;
    }

    drawTextStyle(fontSizePx = defaultFontSizePx, textFill = 'black', fontFamily = defaultFontFamily) {
        this.drawingFontSizePx = fontSizePx;
        this.drawingFontFamily = fontFamily;
        this.drawingFontFill = textFill;
    }

    drawTextWidth(text) {
        return fontWidthRatio * this.drawiingFontSizePx * text.length;
    }

    drawVLine(py) {
        this.setDrawing();
        this.drawingPath.push(`V ${py.toFixed(svgPrecision)}`);
    }

    log(text) {
        if ('logFn' in this.options && this.options.logFn !== null) {
            this.options.logFn(text);
        }
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

    setNavigateTimeout(url, delay) {
        if ('navigateTimeoutFn' in this.options && this.navigateTimeoutFn !== null) {
            this.options.navigateTimeoutFn(url, delay);
        }
    }
}
