// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/dataTable */

import {chartCodeBlock, compareValues, formatValue} from './util.js';
import {loadChartData} from './data.js';
import {markdownElements} from '../markdown-model/lib/elements.js';
import {parseMarkdown} from '../markdown-model/lib/parser.js';
import {validateDataTable} from './model.js';


/**
 * Data table code block function
 *
 * @param {string} language - The code block language
 * @param {string[]} lines - The code block's text lines
 * @param {Object} [options=null] - The [markdown-script options]{@link module:lib/util~MarkdownScriptOptions}
 * @returns {Object} The data table element model
 */
export function dataTableCodeBlock(language, lines, options = null) {
    return chartCodeBlock(language, lines, options, validateDataTable, dataTableElements);
}


/**
 * Render a data table
 *
 * @param {Object} dataTable - The data table model
 * @param {Object} [options=null] - The [markdown-script options]{@link module:lib/util~MarkdownScriptOptions}
 * @returns {Object} The data table element model
 */
export async function dataTableElements(dataTable, options = null) {
    const {data, types} = await loadChartData(dataTable, options);

    // Create the markdownElements options
    const markdownElementsOptions = {};
    if (options !== null && 'urlFn' in options) {
        markdownElementsOptions.urlFn = options.urlFn;
    }

    // Generate the data table's element model
    const categoryFields = 'category' in dataTable ? dataTable.category : [];
    const fields = 'field' in dataTable
        ? dataTable.field
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

                            const fieldElements = 'markdown' in dataTable && dataTable.markdown.indexOf(field) !== -1
                                ? markdownElements(parseMarkdown(formatValue(value, dataTable)), markdownElementsOptions)
                                : {'text': formatValue(value, dataTable)};
                            return {'html': 'td', 'elem': skip ? null : fieldElements};
                        }),
                        fields.map((field) => {
                            const value = field in row ? row[field] : null;
                            const fieldElements = 'markdown' in dataTable && dataTable.markdown.indexOf(field) !== -1
                                ? markdownElements(parseMarkdown(formatValue(value, dataTable)), markdownElementsOptions)
                                : {'text': formatValue(value, dataTable)};
                            return {'html': 'td', 'elem': field === null ? null : fieldElements};
                        })
                    ]
                };
            })
        ]
    };
}
