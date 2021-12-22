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
        'path': ([stroke, strokeWidth, fill]) => geoCtx.path(stroke, strokeWidth, fill),
        'pathMoveTo': ([px, py]) => geoCtx.pathMoveTo(px, py),
        'pathLineTo': ([px, py]) => geoCtx.pathLineTo(px, py),
        'pathClose': () => geoCtx.pathClose()
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
        this.pathStroke = 'black';
        this.pathStrokeWidth = 1;
        this.pathFill = 'none';
        this.pathParts = [];
    }

    finish() {
        if (this.pathParts.length > 0) {
            this.elements.push({
                'svg': 'path',
                'attr': {
                    'fill': this.pathFill,
                    'stroke': this.pathStroke,
                    'stroke-width': this.pathStrokeWidth,
                    'd': this.pathParts.join(' ')
                }
            });
            this.pathParts.length = 0;
        }
    }

    path(stroke = 'black', strokeWidth = 1, fill = 'none') {
        if (stroke !== this.pathStroke || strokeWidth !== this.pathStrokeWidth || fill !== this.pathFill) {
            this.finish();
            this.pathStroke = stroke;
            this.pathStrokeWidth = strokeWidth;
            this.pathFill = fill;
        }
    }

    pathMoveTo(px = 0, py = 0) {
        this.pathParts.push(`M ${px.toFixed(6)} ${py.toFixed(6)}`);
    }

    pathLineTo(px = 0, py = 0) {
        this.pathParts.push(`L ${px.toFixed(6)} ${py.toFixed(6)}`);
    }

    pathClose() {
        this.pathParts.push('Z');
    }
}
