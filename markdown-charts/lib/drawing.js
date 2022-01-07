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
    // The geometry state
    const pathParts = [];

    // Setup global variables and functions
    const variables = {
        // Drawing width and height
        'drawingWidth': 300,
        'drawingHeight': 200,

        // Path functions
        'pathMoveTo': ([px, py]) => {
            pathParts.push(`M ${px.toFixed(6)} ${py.toFixed(6)}`);
        },
        'pathLineTo': ([px, py]) => {
            pathParts.push(`L ${px.toFixed(6)} ${py.toFixed(6)}`);
        },
        'pathClose': () => {
            pathParts.push('Z');
        }
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

    // Render the drawing
    return {
        'html': 'p',
        'elem': {
            'svg': 'svg',
            'attr': {
                'width': variables.drawingWidth,
                'height': variables.drawingHeight
            },
            'elem': pathParts.length === 0 ? null : {
                'svg': 'path',
                'attr': {
                    'fill': 'none',
                    'stroke': 'black',
                    'stroke-width': 1,
                    'd': pathParts.join(' ')
                }
            }
        }
    };
}
