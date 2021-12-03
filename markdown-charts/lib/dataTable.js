// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/dataTable */

import {compareValues, formatValue, formatVariables} from './util.js';
import {loadChartData} from './data.js';


/**
 * Render a data table
 *
 * @param {Object} dataTable - The data table model
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {Object} The data table element model
 */
export async function dataTableElements(dataTable, options = {}) {
    const {data, types} = await loadChartData(dataTable, options);

    // Compute the variables
    const variables = {
        ...('variables' in dataTable ? dataTable.variables : {}),
        ...('variables' in options ? options.variables : {})
    };

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

                // Compute the link field element models
                const linkElements = {};
                const getLinkText = (link, linkText) => {
                    if ('string' in linkText) {
                        const textRow = formatVariables(dataTable, row, linkText.string, false);
                        return formatVariables(dataTable, variables, textRow);
                    }
                    if (!(linkText.field in types)) {
                        throw new Error(`Unknown link "${link.name}" field "${linkText.field}"`);
                    }
                    return row[linkText.field];
                };
                if ('links' in dataTable) {
                    for (const link of dataTable.links) {
                        const linkText = getLinkText(link, link.text);
                        if (link.name in types) {
                            throw new Error(`Duplicate link name "${link.name}"`);
                        }
                        row[link.name] = linkText;
                        linkElements[link.name] = {
                            'html': 'a',
                            'attr': {'href': getLinkText(link, link.url)},
                            'elem': {'text': linkText}
                        };
                    }
                }

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

                            const fieldElements = field in linkElements ? linkElements[field] : {'text': formatValue(value, dataTable)};
                            return {'html': 'td', 'elem': skip ? null : fieldElements};
                        }),
                        fields.map((field) => {
                            const value = field in row ? row[field] : null;
                            const fieldElements = field in linkElements ? linkElements[field] : {'text': formatValue(value, dataTable)};
                            return {'html': 'td', 'elem': field === null ? null : fieldElements};
                        })
                    ]
                };
            })
        ]
    };
}
