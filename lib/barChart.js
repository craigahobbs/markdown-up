// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/barChart */

import {chartCodeBlock} from './util.js';
import {loadChartData} from './data.js';
import {validateBarChart} from './model.js';


/**
 * Bar chart code block function
 *
 * @param {string} language - The code block language
 * @param {string[]} lines - The code block's text lines
 * @param {Object} [options=null] - The [markdown-script options]{@link module:lib/util~MarkdownScriptOptions}
 * @returns {Object} The bar chart element model
 */
export function barChartCodeBlock(language, lines, options = null) {
    return chartCodeBlock(language, lines, options, validateBarChart, barChartElements);
}


/**
 * Render a bar chart
 *
 * @param {Object} barChart - The bar chart model
 * @param {Object} [options=null] - The [markdown-script options]{@link module:lib/util~MarkdownScriptOptions}
 * @returns {Object} The bar chart element model
 */
export async function barChartElements(barChart, options = null) {
    const {data} = await loadChartData(barChart, options);
    return {'html': 'pre', 'elem': {'text': JSON.stringify(data, null, 4)}};
}
