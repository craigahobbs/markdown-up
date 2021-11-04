// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

import {loadChartData} from './data.js';


/**
 * Render a bar chart
 *
 * @param {Object} barChart - The bar chart model
 * @param {Object} options.window - The web browser window object
 * @param {string} [options.url] - Optional markdown file URL
 * @returns {Object} The bar chart element model
 */
export async function barChartElements(barChart, options = {}) {
    const {data} = await loadChartData(barChart, options);
    return {'html': 'pre', 'elem': {'text': JSON.stringify(data, null, 4)}};
}
