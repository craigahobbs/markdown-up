// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/barChart */

import {loadChartData} from './data.js';


/**
 * Render a bar chart
 *
 * @param {Object} barChart - The bar chart model
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {Object} The bar chart element model
 */
export async function barChartElements(barChart, options = {}) {
    const {data} = await loadChartData(barChart, options);
    return {'html': 'pre', 'elem': {'text': JSON.stringify(data, null, 4)}};
}
