// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/codeBlock */

import {validateBarChart, validateDataTable, validateLineChart} from './model.js';
import {barChartElements} from './barChart.js';
import {dataTableElements} from './dataTable.js';
import {decodeQueryString} from '../../schema-markdown/lib/encode.js';
import {lineChartElements} from './lineChart.js';
import {renderElements} from '../../element-model/lib/elementModel.js';


/**
 * Bar chart code block function
 *
 * @param {string} language - The code block language
 * @param {string[]} lines - The code block's text lines
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {Object} The bar chart element model
 */
export function barChartCodeBlock(language, lines, options = {}) {
    return chartCodeBlock(language, lines, options, validateBarChart, barChartElements);
}


/**
 * Data table code block function
 *
 * @param {string} language - The code block language
 * @param {string[]} lines - The code block's text lines
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {Object} The data table element model
 */
export function dataTableCodeBlock(language, lines, options = {}) {
    return chartCodeBlock(language, lines, options, validateDataTable, dataTableElements);
}


/**
 * Line chart code block function
 *
 * @param {string} language - The code block language
 * @param {string[]} lines - The code block's text lines
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {Object} The line chart element model
 */
export function lineChartCodeBlock(language, lines, options = {}) {
    return chartCodeBlock(language, lines, options, validateLineChart, lineChartElements);
}


// Generic code block helper function
function chartCodeBlock(language, lines, options, validationFn, renderFn) {
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
const rComment = /^\s*(?:#.*)?$/;
const rKeyValue = /^\s*(?<key>.+?)\s*(:\s*(?<value>.*?)\s*)?$/;


// Helper function to decode chart lines
function decodeChartLines(lines) {
    // Parse and URI-encode the chart model key/value pairs
    const keyValues = [];
    for (const line of lines) {
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
