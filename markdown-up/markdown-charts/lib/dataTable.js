// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/dataTable */

import {formatValue} from './util.js';
import {loadChartData} from './data.js';


/**
 * Render a data table
 *
 * @param {Object} dataTable - The data table model
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {Object} The data table element model
 */
export async function dataTableElements(dataTable, options = {}) {
    const {data} = await loadChartData(dataTable, options);
    return {
        'html': 'table',
        'elem': [
            // Table header
            {
                'html': 'tr',
                'elem': [
                    dataTable.categoryFields.map((field) => ({'html': 'th', 'elem': {'text': field}})),
                    dataTable.measureFields.map((field) => ({'html': 'th', 'elem': {'text': field}}))
                ]
            },

            // Table data
            data.map((row) => (
                {
                    'html': 'tr',
                    'elem': [
                        dataTable.categoryFields.map((field) => {
                            const value = field in row ? row[field] : null;
                            return {'html': 'td', 'elem': field === null ? null : {'text': formatValue(value, dataTable)}};
                        }),
                        dataTable.measureFields.map((field) => {
                            const value = field in row ? row[field] : null;
                            return {'html': 'td', 'elem': field === null ? null : {'text': formatValue(value, dataTable)}};
                        })
                    ]
                }
            ))
        ]
    };
}
