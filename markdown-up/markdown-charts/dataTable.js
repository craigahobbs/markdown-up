// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

import {loadChartData} from './data.js';


/**
 * Render a data table
 *
 * @param {Object} dataTable - The data table model
 * @param {ChartOptions} [options={}] - Chart options object
 * @returns {Object} The data table element model
 */
export async function dataTableElements(dataTable, options = {}) {
    const {data} = await loadChartData(dataTable, options);
    return {'html': 'pre', 'elem': {'text': JSON.stringify(data, null, 4)}};
}
