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
// eslint-disable-next-line no-unused-vars
export function drawingCodeBlock(language, lines, options = {}) {
    // Setup global variables and functions
    const geoCtx = new GeoContext();
    const variables = {
        // Drawing width and height
        'drawingWidth': 300,
        'drawingHeight': 200,

        // Geometry functions
        'lineTo': ([px, py]) => geoCtx.lineTo(px, py),
        'moveTo': ([px, py]) => geoCtx.moveTo(px, py),
        'pathClose': () => geoCtx.pathClose(),
        // eslint-disable-next-line id-length
        'rect': ([x, y, w, h, rx, ry]) => geoCtx.rect(x, y, w, h, rx, ry),
        'setStyle': ([stroke, strokeWidth, fill, strokeDashArray]) => geoCtx.setStyle(stroke, strokeWidth, fill, strokeDashArray)
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


class GeoContext {
    constructor() {
        this.elements = [];
        this.stroke = 'black';
        this.strokeWidth = 1;
        this.strokeDashArray = 'none';
        this.fill = 'none';
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

    pathClose() {
        this.pathParts.push('Z');
    }

    lineTo(px = 0, py = 0) {
        this.pathParts.push(`L ${px.toFixed(6)} ${py.toFixed(6)}`);
    }

    moveTo(px = 0, py = 0) {
        this.pathParts.push(`M ${px.toFixed(6)} ${py.toFixed(6)}`);
    }

    // eslint-disable-next-line id-length
    rect(x = 0, y = 0, width = 60, height = 40, rx = null, ry = null) {
        this.finish();
        const element = {
            'svg': 'rect',
            'attr': {
                'fill': this.fill,
                'stroke': this.stroke,
                'stroke-width': this.strokeWidth,
                'stroke-dasharray': this.strokeDashArray,
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
}
