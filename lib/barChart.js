// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/barChart */

import {chartCodeBlock} from './util.js';
import {loadChartData} from './data.js';
import {validateBarChart} from './model.js';


/* c8 ignore start */


/**
 * Bar chart code block function
 *
 * @param {object} codeBlock - The code block model
 * @param {Object} [options=null] - The [markdown-script options]{@link module:lib/script~MarkdownScriptOptions}
 * @returns {Object} The bar chart element model
 */
export function barChartCodeBlock(codeBlock, options = null) {
    return chartCodeBlock(codeBlock, options, validateBarChart, barChartElements);
}


/**
 * Render a bar chart
 *
 * @param {Object} barChart - The bar chart model
 * @param {Object} [options=null] - The [markdown-script options]{@link module:lib/script~MarkdownScriptOptions}
 * @returns {Object} The bar chart element model
 */
export async function barChartElements(barChart, options = null) {
    const {data} = await loadChartData(barChart, options);
    return {'html': 'pre', 'elem': {'text': JSON.stringify(data, null, 4)}};
}
