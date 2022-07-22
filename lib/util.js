// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/util */

import {decodeQueryString} from 'schema-markdown/lib/encode.js';
import {renderElements} from 'element-model/lib/elementModel.js';


// JSDoc typedefs

/**
 * The markdown script code block function options (based on
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


// The categorical color palette
export const categoricalColors = [
    '#1f77b4',
    '#ff7f0e',
    '#2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf',
    '#aec7e8',
    '#ffbb78',
    '#98df8a',
    '#ff9896',
    '#c5b0d5',
    '#c49c94',
    '#f7b6d2',
    '#c7c7c7',
    '#dbdb8d',
    '#9edae5'
];


// Helper function to format labels
export function formatValue(value, chart) {
    if (value instanceof Date) {
        const isoFormat = value.toISOString();
        if ('datetime' in chart && chart.datetime === 'Year') {
            return isoFormat.slice(0, isoFormat.indexOf('T') - 6);
        } else if ('datetime' in chart && chart.datetime === 'Month') {
            return isoFormat.slice(0, isoFormat.indexOf('T') - 3);
        } else if ('datetime' in chart && chart.datetime === 'Day') {
            return isoFormat.slice(0, isoFormat.indexOf('T'));
        }
        return isoFormat.replace(rDateCleanup, '');
    } else if (typeof value === 'number') {
        const numberFormat = value.toFixed('precision' in chart ? chart.precision : defaultPrecision);
        return numberFormat.replace(rNumberCleanup, '');
    }
    return `${value}`;
}

const defaultPrecision = 2;
const rNumberCleanup = /\.0*$/;
const rDateCleanup = /(?:(?:(?:-01)?T00:00)?:00)?\.\d\d\dZ$/;


// Helper function to compare values
export function compareValues(value1, value2) {
    if (value1 === null) {
        return value2 === null ? 0 : 1;
    } else if (value2 === null) {
        return value1 === null ? 0 : -1;
    } else if (value1 instanceof Date) {
        const time1 = value1.getTime();
        const time2 = value2.getTime();
        return time1 < time2 ? -1 : (time1 === time2 ? 0 : 1);
    }
    return value1 < value2 ? -1 : (value1 === value2 ? 0 : 1);
}


// Helper function to compute a value's parameter
export function valueParameter(value, minValue, maxValue) {
    if (minValue === maxValue) {
        return 0;
    }

    if (minValue instanceof Date) {
        const minDateValue = minValue.valueOf();
        return (value.valueOf() - minDateValue) / (maxValue.valueOf() - minDateValue);
    }

    return (value - minValue) / (maxValue - minValue);
}


// Helper function to compute a value from a parameter
export function parameterValue(param, minValue, maxValue) {
    if (minValue instanceof Date) {
        const minDateValue = minValue.valueOf();
        return new Date(minDateValue + param * (maxValue.valueOf() - minDateValue));
    }

    return minValue + param * (maxValue - minValue);
}


// Generic code block helper function
export function chartCodeBlock(codeBlock, options, validationFn, renderFn) {
    // Decode and validate the chart model
    let chart;
    try {
        chart = validationFn(decodeChartLines(codeBlock.lines));
    } catch ({message}) {
        return {'html': 'p', 'elem': {'html': 'pre', 'elem': {'text': `Error: ${message}`}}};
    }

    // Render the chart asynchronously
    return {
        'html': 'p',
        'elem': !('width' in chart) ? null : {
            'svg': 'svg',
            'attr': {
                'width': chart.width,
                'height': chart.height
            }
        },
        'callback': (parent) => {
            renderFn(chart, options).
                then((elements) => {
                    renderElements(parent, elements);
                }).
                catch(({message}) => {
                    renderElements(parent, {'html': 'pre', 'elem': {'text': `Error: ${message}`}});
                });
        }
    };
}


// Chart code block regular expressions
const rComment = /^\s*(?:(?:#|\/\/).*)?$/;
const rKeyValue = /^\s*(?<key>.+?)\s*(:\s*(?<value>.*?)\s*)?$/;
const rContinuation = /\\\s*$/;


// Helper function to decode chart lines
function decodeChartLines(lines) {
    // Parse and URI-encode the chart model key/value pairs
    const keyValues = [];
    const lineContinuation = [];
    for (const linePart of lines) {
        // Line continuation?
        const linePartNoContinuation = linePart.replace(rContinuation, '');
        if (lineContinuation.length || linePartNoContinuation !== linePart) {
            lineContinuation.push(linePartNoContinuation);
        }
        if (linePartNoContinuation !== linePart) {
            continue;
        }
        let line;
        if (lineContinuation.length) {
            line = lineContinuation.join('');
            lineContinuation.length = 0;
        } else {
            line = linePart;
        }

        // Skip comment lines
        if (line.match(rComment) !== null) {
            continue;
        }

        // Split the key/value
        const {key, value = ''} = line.match(rKeyValue).groups;
        keyValues.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    }

    // Decode the chart model
    return decodeQueryString(keyValues.join('&'));
}
