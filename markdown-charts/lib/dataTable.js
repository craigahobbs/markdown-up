// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/dataTable */

import {compareValues, formatValue, formatVariables, getFieldValue} from './util.js';
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
                    if ('field' in linkText) {
                        if (!(linkText.field in types)) {
                            throw new Error(`Unknown "${link.name}" link field "${linkText.field}"`);
                        }
                        return linkText.field in row ? row[linkText.field] : null;
                    }
                    const value = getFieldValue(variables, linkText, null, null);
                    const valueText = formatValue(value, dataTable);
                    const valueVarText = formatVariables(dataTable, row, valueText, false);
                    return formatVariables(dataTable, variables, valueVarText);
                };
                if ('links' in dataTable) {
                    for (const link of dataTable.links) {
                        if (link.name in types) {
                            throw new Error(`Duplicate link name "${link.name}"`);
                        }
                        const linkText = getLinkText(link, link.text);
                        if (linkText === null) {
                            linkElements[link.name] = null;
                        } else {
                            row[link.name] = linkText;
                            if (!('url' in link)) {
                                linkElements[link.name] = {'text': linkText};
                            } else {
                                const urlText = getLinkText(link, link.url);
                                if (urlText === null) {
                                    linkElements[link.name] = null;
                                } else {
                                    linkElements[link.name] = {
                                        'html': 'a',
                                        'attr': {'href': urlText},
                                        'elem': {'text': linkText}
                                    };
                                }
                            }
                        }
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
