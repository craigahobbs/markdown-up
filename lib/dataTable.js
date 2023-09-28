// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-up/blob/main/LICENSE

/** @module lib/dataTable */

import {compareValues} from '../bare-script/lib/data.js';
import {formatValue} from './dataUtil.js';
import {markdownElements} from '../markdown-model/lib/elements.js';
import {parseMarkdown} from '../markdown-model/lib/parser.js';
import {parseSchemaMarkdown} from '../schema-markdown/lib/parser.js';
import {validateType} from '../schema-markdown/lib/schema.js';


// The data table model's Schema Markdown
export const dataTableTypes = parseSchemaMarkdown(`\
group "Data Table"


# A data table model
struct DataTable

    # The table's fields
    optional string[len > 0] fields

    # The table's category fields
    optional string[len > 0] categories

    # The field formatting for "categories" and "fields"
    optional DataTableFieldFormat{len > 0} formats

    # The numeric formatting precision (default is 2)
    optional int(>= 0) precision

    # The datetime format
    optional DataTableDatetimeFormat datetime

    # If true, trim formatted values (default is true)
    optional bool trim


# A data table field formatting model
struct DataTableFieldFormat

    # The field alignment
    optional DataTableFieldAlignment align

    # If true, don't wrap text
    optional bool nowrap

    # If true, format the field as Markdown
    optional bool markdown


# A field alignment
enum DataTableFieldAlignment
    left
    right
    center


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
 * @throws [ValidationError]{@link https://craigahobbs.github.io/schema-markdown-js/module-lib_schema.ValidationError.html}
 */
export function validateDataTable(dataTable) {
    return validateType(dataTableTypes, 'DataTable', dataTable);
}


/**
 * The data table options object
 *
 * @typedef {Object} DataTableOptions
 * @property {function} [urlFn] - The
 *     [Markdown URL modifier function]{@link https://craigahobbs.github.io/markdown-model/module-lib_elements.html#~URLFn}
 */


/**
 * Render a data table
 *
 * @param {Object[]} data - The data array
 * @param {?Object} [dataTable = null] - The
 *     [data table model]{@link https://craigahobbs.github.io/markdown-up/library/model.html#var.vName='DataTable'}
 * @param {?Object} [options = null] - The [data table options]{@link module:lib/dataTable~DataTableOptions}
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
    const fieldFormats = (dataTable !== null ? (dataTable.formats ?? null) : null);
    const markdownOptions = (options !== null && 'urlFn' in options ? {'urlFn': options.urlFn} : null);
    const formatPrecision = (dataTable !== null ? (dataTable.precision ?? null) : null);
    const formatDatetime = (dataTable !== null ? (dataTable.datetime ?? null) : null);
    const formatTrim = (dataTable !== null ? (dataTable.trim ?? null) : null);
    return {
        'html': 'table',
        'elem': [
            // Table header
            {
                'html': 'tr',
                'elem': [
                    categories.map((field) => {
                        const fieldFormat = (fieldFormats !== null ? (fieldFormats[field] ?? null) : null);
                        return {
                            'html': 'th',
                            'attr': createFieldAttr(fieldFormat),
                            'elem': {'text': field}
                        };
                    }),
                    tableFields.map((field) => {
                        const fieldFormat = (fieldFormats !== null ? (fieldFormats[field] ?? null) : null);
                        return {
                            'html': 'th',
                            'attr': createFieldAttr(fieldFormat),
                            'elem': {'text': field}
                        };
                    })
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

                            const fieldFormat = (fieldFormats !== null ? (fieldFormats[field] ?? null) : null);
                            const fieldElements = fieldFormat !== null && fieldFormat.markdown
                                ? markdownElements(parseMarkdown(`${value}`), markdownOptions)
                                : {'text': formatValue(value, formatPrecision, formatDatetime, formatTrim)};
                            return {
                                'html': 'td',
                                'attr': createFieldAttr(fieldFormat),
                                'elem': (skip ? null : fieldElements)
                            };
                        }),
                        tableFields.map((field) => {
                            const value = row[field] ?? null;
                            const fieldFormat = (fieldFormats !== null ? (fieldFormats[field] ?? null) : null);
                            const fieldElements = fieldFormat !== null && fieldFormat.markdown
                                ? markdownElements(parseMarkdown(`${value}`), markdownOptions)
                                : {'text': formatValue(value, formatPrecision, formatDatetime, formatTrim)};
                            return {
                                'html': 'td',
                                'attr': createFieldAttr(fieldFormat),
                                'elem': fieldElements
                            };
                        })
                    ]
                };
            })
        ]
    };
}


function createFieldAttr(fieldFormat) {
    const fieldStyles = [];
    if (fieldFormat !== null && 'align' in fieldFormat) {
        fieldStyles.push(`text-align: ${fieldFormat.align}`);
    }
    if (fieldFormat !== null && fieldFormat.nowrap) {
        fieldStyles.push('white-space: nowrap');
    }
    return (fieldStyles.length ? {'style': fieldStyles.join('; ')} : null);
}
