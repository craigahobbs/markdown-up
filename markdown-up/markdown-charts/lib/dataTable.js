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

    // Sort?
    if ('sort' in dataTable) {
        data.sort((row1, row2) => dataTable.sort.reduce((result, sort) => {
            if (result !== 0) {
                return result;
            }
            const value1 = sort.field in row1 ? row1[sort.field] : null;
            const value2 = sort.field in row2 ? row2[sort.field] : null;
            const compare = compareValues(value1, value2);
            return 'desc' in sort && sort.desc ? -compare : compare;
        }, 0));
    }

    // Generate the data table's element model
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
            data.map((row, ixRow) => {
                const rowPrev = ixRow > 0 ? data[ixRow - 1] : null;
                return {
                    'html': 'tr',
                    'elem': [
                        dataTable.categoryFields.map((field, ixField) => {
                            const value = field in row ? row[field] : null;

                            // Skip this value?
                            let skip = rowPrev !== null;
                            for (let ixSkip = 0; skip && ixSkip <= ixField; ixSkip++) {
                                const skipField = dataTable.categoryFields[ixSkip];
                                const skipValue = skipField in row ? row[skipField] : null;
                                const skipValuePrev = skipField in rowPrev ? rowPrev[skipField] : null;
                                skip = (compareValues(skipValue, skipValuePrev) === 0);
                            }

                            return {'html': 'td', 'elem': skip ? null : {'text': formatValue(value, dataTable)}};
                        }),
                        dataTable.measureFields.map((field) => {
                            const value = field in row ? row[field] : null;
                            return {'html': 'td', 'elem': field === null ? null : {'text': formatValue(value, dataTable)}};
                        })
                    ]
                };
            })
        ]
    };
}
