// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/script */

import {encodeQueryString} from 'schema-markdown/lib/encode.js';
import {executeScriptAsync} from 'calc-script/lib/runtimeAsync.js';
import {markdownElements} from 'markdown-model/lib/elements.js';
import {parseMarkdown} from 'markdown-model/lib/parser.js';
import {parseScript} from 'calc-script/lib/parser.js';
import {schemaMarkdownDoc} from 'schema-markdown-doc/lib/schemaMarkdownDoc.js';
import {validateElements} from 'element-model/lib/elementModel.js';


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
const defaultFontFamily = 'Arial, Helvetica, sans-serif';
const pixelsPerPoint = 4 / 3;
const svgPrecision = 8;


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


    drawTextStyle(fontSizePx = null, textFill = 'black', bold = false, italic = false, fontFamily = null) {
        this.drawingFontSizePx = (fontSizePx !== null ? fontSizePx : this.options.fontSize * pixelsPerPoint);
        this.drawingFontFill = textFill;
        this.drawingFontBold = bold;
        this.drawingFontItalic = italic;
        this.drawingFontFamily = (fontFamily !== null ? fontFamily : defaultFontFamily);
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
        this.markdown.push(...lines.flat());
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
