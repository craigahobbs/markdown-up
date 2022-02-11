// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/util */

import {decodeQueryString} from '../../schema-markdown/lib/encode.js';
import {renderElements} from '../../element-model/lib/elementModel.js';


// JSDoc typedefs

/**
 * @typedef {Object} ChartOptions
 * @property {module:lib/util~FetchFn} [fetchFn] - The URL fetch function
 * @property {number} [fontSize] - The chart font size, in points
 * @property {module:lib/util~HashFn} [hashFn] - The hash URL modifier function
 * @property {module:lib/util~LogFn} [logFn] - The log function
 * @property {number} [maxStatements] - The maximum number of statements, 0 for no maximum
 * @property {module:lib/util~NavigateTimeoutFn} [navigateTimeoutFn] - The navigate timeout function
 * @property {module:lib/script.MarkdownScriptRuntime} [runtime] - The markdown-script runtime state
 * @property {string} [url] - The markdown file URL
 * @property {Object} [variables] - The map of variable name to chart variable value
 */

/**
 * The URL fetch function
 *
 * @callback FetchFn
 * @param {string} url - The URL to fetch
 * @returns {Promise} The fetch promise
 */

/**
 * The hash modifier function
 *
 * @callback HashFn
 * @param {string} hashURL - The hash URL
 * @returns {string} The fixed-up hash URL
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
export function chartCodeBlock(language, lines, options, validationFn, renderFn) {
    // Decode and validate the chart model
    let chartModel;
    try {
        chartModel = validationFn(decodeChartLines(lines));
    } catch ({message}) {
        return {'html': 'p', 'elem': {'html': 'pre', 'elem': {'text': `Error: ${message}`}}};
    }

    // Render the chart asynchronously
    return {
        'html': 'p',
        'elem': !('width' in chartModel) ? null : {
            'svg': 'svg',
            'attr': {
                'width': chartModel.width,
                'height': chartModel.height
            }
        },
        'callback': (parent) => {
            renderFn(chartModel, options).
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
