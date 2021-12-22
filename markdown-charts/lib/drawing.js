// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/drawing */

import {executeScript, parseScript} from './calc.js';
import {getFieldValue} from './util.js';


/**
 * Drawing code block function
 *
 * @param {string} language - The code block language
 * @param {string[]} lines - The code block's text lines
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {Object} The drawing element model
 */
export function drawingCodeBlock(language, lines, options = {}) {
    // Setup global variables and functions
    const geoCtx = new GeoContext();
    const variables = {
        // Drawing width and height
        'drawingWidth': 300,
        'drawingHeight': 200,

        // Geometry functions
        'circle': ([cx, cy, radius]) => geoCtx.circle(cx, cy, radius),
        'drawText': ([text, px, py]) => geoCtx.drawText(text, px, py),
        'ellipse': ([cx, cy, rx, ry]) => geoCtx.ellipse(cx, cy, rx, ry),
        'hlineTo': ([px]) => geoCtx.hlineTo(px),
        'lineTo': ([px, py]) => geoCtx.lineTo(px, py),
        'moveTo': ([px, py]) => geoCtx.moveTo(px, py),
        'pathClose': () => geoCtx.pathClose(),
        'rect': ([px, py, width, height, rx, ry]) => geoCtx.rect(px, py, width, height, rx, ry),
        'setStyle': ([stroke, strokeWidth, fill, strokeDashArray]) => geoCtx.setStyle(stroke, strokeWidth, fill, strokeDashArray),
        'setTextStyle': ([fontSizePx, textFill, fontFamily]) => geoCtx.setTextStyle(fontSizePx, textFill, fontFamily),
        'textHeight': ([text, width]) => geoCtx.textHeight(text, width),
        'textWidth': ([text]) => geoCtx.textWidth(text),
        'vlineTo': ([py]) => geoCtx.vlineTo(py)
    };
    const getVariable = (name) => {
        if (name in variables) {
            return variables[name];
        } else if ('variables' in options && name in options.variables) {
            return getFieldValue(options.variables[name]);
        }
        return null;
    };
    const setVariable = (name, value) => {
        variables[name] = value;
    };

    // Execute the calculation script
    const scriptModel = parseScript(lines);
    executeScript(scriptModel, getVariable, setVariable);
    geoCtx.finish();

    // Render the drawing
    return {
        'html': 'p',
        'elem': {
            'svg': 'svg',
            'attr': {
                'width': variables.drawingWidth,
                'height': variables.drawingHeight
            },
            'elem': geoCtx.elements
        }
    };
}


const fontWidthRatio = 0.6;
const pixelsPerPoint = 4 / 3;
const defaultFontFamily = 'Arial, Helvetica, sans-serif';
const defaultFontSizePx = 12 * pixelsPerPoint;


class GeoContext {
    constructor() {
        this.elements = [];
        this.stroke = 'black';
        this.strokeWidth = 1;
        this.strokeDashArray = 'none';
        this.fill = 'none';
        this.fontFamily = defaultFontFamily;
        this.fontSizePx = defaultFontSizePx;
        this.textFill = 'black';
        this.pathParts = [];
    }

    finish() {
        if (this.pathParts.length > 0) {
            this.elements.push({
                'svg': 'path',
                'attr': {
                    'fill': this.fill,
                    'stroke': this.stroke,
                    'stroke-width': this.strokeWidth,
                    'stroke-dasharray': this.strokeDashArray,
                    'd': this.pathParts.join(' ')
                }
            });
            this.pathParts.length = 0;
        }
    }

    circle(cx = 0, cy = 0, radius = 50) {
        this.finish();
        const element = {
            'svg': 'circle',
            'attr': {
                'fill': this.fill,
                'stroke': this.stroke,
                'stroke-width': this.strokeWidth,
                'stroke-dasharray': this.strokeDashArray,
                'cx': cx,
                'cy': cy,
                'r': radius
            }
        };
        this.elements.push(element);
    }

    drawText(text = '', px = 0, py = 0, textAnchor = 'middle', dominantBaseline = 'middle') {
        this.finish();
        this.elements.push({
            'svg': 'text',
            'attr': {
                'fill': this.textFill,
                'font-family': this.fontFamily,
                'font-size': this.fontSizePx,
                'text-anchor': textAnchor,
                'dominant-baseline': dominantBaseline,
                'x': px,
                'y': py
            },
            'elem': {'text': text}
        });
    }

    ellipse(cx = 0, cy = 0, rx = 50, ry = 50) {
        this.finish();
        const element = {
            'svg': 'ellipse',
            'attr': {
                'fill': this.fill,
                'stroke': this.stroke,
                'stroke-width': this.strokeWidth,
                'stroke-dasharray': this.strokeDashArray,
                'cx': cx,
                'cy': cy,
                'rx': rx,
                'ry': ry
            }
        };
        this.elements.push(element);
    }

    hlineTo(px = 0) {
        this.pathParts.push(`H ${px.toFixed(6)}`);
    }

    lineTo(px = 0, py = 0) {
        this.pathParts.push(`L ${px.toFixed(6)} ${py.toFixed(6)}`);
    }

    moveTo(px = 0, py = 0) {
        this.pathParts.push(`M ${px.toFixed(6)} ${py.toFixed(6)}`);
    }

    pathClose() {
        this.pathParts.push('Z');
    }

    rect(px = 0, py = 0, width = 60, height = 40, rx = null, ry = null) {
        this.finish();
        const element = {
            'svg': 'rect',
            'attr': {
                'fill': this.fill,
                'stroke': this.stroke,
                'stroke-width': this.strokeWidth,
                'stroke-dasharray': this.strokeDashArray,
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
        this.elements.push(element);
    }

    setStyle(stroke = 'black', strokeWidth = 1, fill = 'none', strokeDashArray = 'none') {
        if (stroke !== this.stroke || strokeWidth !== this.strokeWidth || fill !== this.fill || strokeDashArray !== this.strokeDashArray) {
            this.finish();
            this.stroke = stroke;
            this.strokeWidth = strokeWidth;
            this.fill = fill;
            this.strokeDashArray = strokeDashArray;
        }
    }

    setTextStyle(fontSizePx = defaultFontSizePx, textFill = 'black', fontFamily = defaultFontFamily) {
        this.fontSizePx = fontSizePx;
        this.textFill = textFill;
        this.fontFamily = fontFamily;
    }

    textHeight(text = '', width = 0) {
        return width === 0 ? this.fontSizePx : width / (fontWidthRatio * text.length);
    }

    textWidth(text) {
        return fontWidthRatio * this.fontSizePx * text.length;
    }

    vlineTo(py = 0) {
        this.pathParts.push(`V ${py.toFixed(6)}`);
    }
}
