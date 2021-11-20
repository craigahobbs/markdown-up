// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/dataTable */

import {compareValues, formatValue} from './util.js';
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

    // Generate the data table's element model
    return {
        'html': 'table',
        'elem': [
            // Table header
            {
                'html': 'tr',
                'elem': [
                    !('categoryFields' in dataTable) ? null
                        : dataTable.categoryFields.map((field) => ({'html': 'th', 'elem': {'text': field}})),
                    dataTable.fields.map((field) => ({'html': 'th', 'elem': {'text': field}}))
                ]
            },

            // Table data
            data.map((row, ixRow) => {
                const rowPrev = ixRow > 0 ? data[ixRow - 1] : null;
                let skip = rowPrev !== null;
                return {
                    'html': 'tr',
                    'elem': [
                        !('categoryFields' in dataTable) ? null
                            : dataTable.categoryFields.map((field) => {
                                const value = field in row ? row[field] : null;

                                // Skip this value?
                                if (skip) {
                                    const skipValue = field in row ? row[field] : null;
                                    const skipValuePrev = field in rowPrev ? rowPrev[field] : null;
                                    skip = (compareValues(skipValue, skipValuePrev) === 0);
                                }

                                return {'html': 'td', 'elem': skip ? null : {'text': formatValue(value, dataTable)}};
                            }),
                        dataTable.fields.map((field) => {
                            const value = field in row ? row[field] : null;
                            return {'html': 'td', 'elem': field === null ? null : {'text': formatValue(value, dataTable)}};
                        })
                    ]
                };
            })
        ]
    };
}
