// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/dataTable */

import {chartCodeBlock, compareValues, formatValue} from './util.js';
import {loadChartData} from './data.js';
import {markdownElements} from '../../markdown-model/lib/elements.js';
import {parseMarkdown} from '../../markdown-model/lib/parser.js';
import {validateDataTable} from './model.js';


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
 * Render a data table
 *
 * @param {Object} dataTable - The data table model
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {Object} The data table element model
 */
export async function dataTableElements(dataTable, options = {}) {
    const {data, types} = await loadChartData(dataTable, options);

    // Generate the data table's element model
    const categoryFields = 'categoryFields' in dataTable ? dataTable.categoryFields : [];
    const fields = 'fields' in dataTable
        ? dataTable.fields
        : Object.keys(types).filter((key) => categoryFields.indexOf(key) === -1);
    return {
        'html': 'table',
        'elem': [
            // Table header
            {
                'html': 'tr',
                'elem': [
                    categoryFields.map((field) => ({'html': 'th', 'elem': {'text': field}})),
                    fields.map((field) => ({'html': 'th', 'elem': {'text': field}}))
                ]
            },

            // Table data
            data.map((row, ixRow) => {
                const rowPrev = ixRow > 0 ? data[ixRow - 1] : null;
                let skip = rowPrev !== null;

                return {
                    'html': 'tr',
                    'elem': [
                        categoryFields.map((field) => {
                            const value = field in row ? row[field] : null;

                            // Skip this value?
                            if (skip) {
                                const skipValue = field in row ? row[field] : null;
                                const skipValuePrev = field in rowPrev ? rowPrev[field] : null;
                                skip = (compareValues(skipValue, skipValuePrev) === 0);
                            }

                            const fieldElements = 'markdownFields' in dataTable && dataTable.markdownFields.indexOf(field) !== -1
                                ? markdownElements(parseMarkdown(formatValue(value, dataTable)))
                                : {'text': formatValue(value, dataTable)};
                            return {'html': 'td', 'elem': skip ? null : fieldElements};
                        }),
                        fields.map((field) => {
                            const value = field in row ? row[field] : null;
                            const fieldElements = 'markdownFields' in dataTable && dataTable.markdownFields.indexOf(field) !== -1
                                ? markdownElements(parseMarkdown(formatValue(value, dataTable)))
                                : {'text': formatValue(value, dataTable)};
                            return {'html': 'td', 'elem': field === null ? null : fieldElements};
                        })
                    ]
                };
            })
        ]
    };
}
