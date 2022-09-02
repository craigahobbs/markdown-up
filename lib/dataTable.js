// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/dataTable */

import {compareValues, formatValue} from './data.js';
import {markdownElements} from 'markdown-model/lib/elements.js';
import {parseMarkdown} from 'markdown-model/lib/parser.js';
import {parseSchemaMarkdown} from 'schema-markdown/lib/parser.js';
import {validateType} from 'schema-markdown/lib/schema.js';


// The data table model's Schema Markdown
export const dataTableTypes = parseSchemaMarkdown(`\
group "Data Table"


# A data table model
struct DataTable

    # The table's fields
    optional string[len > 0] fields

    # The table's category fields
    optional string[len > 0] categories

    # The "categories" and "fields" to be rendered as Markdown text
    optional string[len > 0] markdown

    # The numeric formatting precision (default is 2)
    optional int(>= 0) precision

    # The datetime format
    optional DataTableDatetimeFormat datetime


# A datetime format
enum DataTableDatetimeFormat

    # ISO datetime year format
    year

    # ISO datetime month format
    month

    # ISO datetime day format
    day
`);


/**
 * Validate a data table model
 *
 * @param {Object} dataTable - The
 *     [data table model]{@link https://craigahobbs.github.io/markdown-up/library/model.html#var.vName='DataTable'}
 * @returns {Object}
 */
export function validateDataTable(dataTable) {
    return validateType(dataTableTypes, 'DataTable', dataTable);
}


/**
 * Render a data table
 *
 * @param {Object[]} data - The data array
 * @param {?Object} [dataTable = null] - The
 *     [data table model]{@link https://craigahobbs.github.io/markdown-up/library/model.html#var.vName='DataTable'}
 * @param {?Object} [options = null] - The [markdown-script options]{@link module:lib/script~MarkdownScriptOptions}
 * @returns {Object} The data table [element model]{@link https://github.com/craigahobbs/element-model#readme}
 */
export function dataTableElements(data, dataTable = null, options = null) {
    // Compute the table's field names
    const categories = (dataTable !== null ? (dataTable.categories ?? []) : []);
    let tableFields = (dataTable !== null ? (dataTable.fields ?? null) : null);
    if (tableFields === null) {
        const allFields = new Set();
        for (const row of data) {
            for (const fieldName of Object.keys(row)) {
                allFields.add(fieldName);
            }
        }
        tableFields = Array.from(allFields.values());
        if (categories !== null) {
            tableFields = tableFields.filter((key) => categories.indexOf(key) === -1);
        }
    }

    // Generate the data table's element model
    const markdown = (dataTable !== null ? (dataTable.markdown ?? null) : null);
    const markdownOptions = (markdown !== null && options !== null ? {'urlFn': options.urlFn} : null);
    const formatPrecision = (dataTable !== null ? (dataTable.precision ?? null) : null);
    const formatDatetime = (dataTable !== null ? (dataTable.datetime ?? null) : null);
    return {
        'html': 'table',
        'elem': [
            // Table header
            {
                'html': 'tr',
                'elem': [
                    categories.map((field) => ({'html': 'th', 'elem': {'text': field}})),
                    tableFields.map((field) => ({'html': 'th', 'elem': {'text': field}}))
                ]
            },

            // Table data
            data.map((row, ixRow) => {
                const rowPrev = ixRow > 0 ? data[ixRow - 1] : null;
                let skip = rowPrev !== null;
                return {
                    'html': 'tr',
                    'elem': [
                        categories.map((field) => {
                            const value = row[field] ?? null;

                            // Skip this value?
                            if (skip) {
                                skip = (compareValues(value, rowPrev[field] ?? null) === 0);
                            }

                            const fieldElements = markdown !== null && markdown.indexOf(field) !== -1
                                ? markdownElements(parseMarkdown(`${value}`), markdownOptions)
                                : {'text': formatValue(value, formatPrecision, formatDatetime)};
                            return {'html': 'td', 'elem': skip ? null : fieldElements};
                        }),
                        tableFields.map((field) => {
                            const value = row[field] ?? null;
                            const fieldElements = markdown !== null && markdown.indexOf(field) !== -1
                                ? markdownElements(parseMarkdown(`${value}`), markdownOptions)
                                : {'text': formatValue(value, formatPrecision, formatDatetime)};
                            return {'html': 'td', 'elem': fieldElements};
                        })
                    ]
                };
            })
        ]
    };
}
