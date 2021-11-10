// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

import {getBaseURL, isRelativeURL} from '../../markdown-model/index.js';


/**
 * @typedef {Object} ChartOptions
 * @property {number} [fontSize] - The chart font size
 * @property {string} [url] - The markdown file URL
 * @property {ChartVariables} [variables] - The map of variable name to chart variable
 * @property {Window} [window] - The web browser's Window object
 */


/**
 * @typedef {Object.<string, ChartVariable>} ChartVariables
 */


/**
 * @typedef {Object} ChartVariable
 * @property {Date} [datetime] - The datetime variable value
 * @property {number} [number] - The number variable value
 * @property {string} [string] - The string variable value
 */


/**
 * @typedef {Object} LoadChartDataResult
 * @property {Object[]} data - The data row object array
 * @property {Object} types - The map of field name to field type ("datetime", "number", "string")
 */


/**
 * Load the chart's data
 *
 * @param {Object} chart - The chart model
 * @param {ChartOptions} [options={}] - Chart options object
 * @returns {LoadChartDataResult}
 */
export async function loadChartData(chart, options = {}) {
    // Fixup the data URL, if necessary
    let {dataURL} = chart;
    if ('url' in options && options.url !== null && isRelativeURL(dataURL)) {
        dataURL = `${getBaseURL(options.url)}${dataURL}`;
    }

    // Fetch the data file
    const dataResponse = await options.window.fetch(dataURL);
    if (!dataResponse.ok) {
        const status = dataResponse.statusText;
        throw new Error(`Could not fetch "${dataURL}"${status === '' ? '' : `, ${JSON.stringify(status)}`}`);
    }

    // CSV?
    let data;
    const csv = dataURL.endsWith('.csv');
    if (csv) {
        data = parseCSV(await dataResponse.text());
    } else {
        data = await dataResponse.json();
    }

    // Validate the data
    const types = validateData(data, {csv});

    // Filter the data
    if ('filters' in chart) {
        const variables = {
            ...('variables' in chart ? chart.variables : {}),
            ...('variables' in options ? options.variables : {})
        };
        data = filterData(data, types, chart.filters, variables);
    }

    // Aggregate the data
    if ('aggregation' in chart) {
        data = aggregateData(data, types, chart.aggregation);
    }

    return {data, types};
}


/**
 * Parse CSV text to a JSON data array
 *
 * @param {string} text - The CSV text
 * @returns {Object[]}
 */
export function parseCSV(text) {
    const data = [];
    const splitLines = text.split(rCSVLineSplit).map((line) => line.replace(rCSVLineScrub, '$1').split(rCSVFieldSplit));
    const [fields] = splitLines;
    for (let ixLine = 1; ixLine < splitLines.length; ixLine += 1) {
        const splitLine = splitLines[ixLine];
        if (splitLine.length > 1 || splitLine[0] !== '') {
            data.push(Object.fromEntries(fields.map(
                (field, ixField) => [field, ixField < splitLine.length ? splitLine[ixField] : 'null']
            )));
        }
    }
    return data;
}

const rCSVLineSplit = /\r?\n/;
const rCSVLineScrub = /^"?(.*?)"?$/;
const rCSVFieldSplit = /"?,"?/;


/**
 * @typedef {Object} ValidateDataOptions
 * @property {boolean} [csv] - If True, parse number and null strings
 */


/**
 * Determine data field types and parse/validate field values
 *
 * @param {Object[]} data - The data array. Row objects are updated with parsed/validated values.
 * @param {ValidateDataOptions} [options = {}] - The validation options
 * @returns {Object} The map of field name to field type ("datetime", "number", "string")
 */
export function validateData(data, options = {}) {
    // Determine field types
    const types = {};
    const optionCSV = 'csv' in options && options.csv;
    for (const row of data) {
        for (const [field, value] of Object.entries(row)) {
            if (!(field in types)) {
                if (typeof value === 'number') {
                    types[field] = 'number';
                } else if (value instanceof Date) {
                    types[field] = 'datetime';
                } else if (typeof value === 'string' && (!optionCSV || value !== 'null')) {
                    if (parseCSVDatetime(value) !== null) {
                        types[field] = 'datetime';
                    } else if (optionCSV && parseCSVNumber(value) !== null) {
                        types[field] = 'number';
                    } else {
                        types[field] = 'string';
                    }
                }
            }
        }
    }

    // Validate field values
    const throwFieldError = (field, fieldType, fieldValue) => {
        throw new Error(`Invalid "${field}" field value ${JSON.stringify(fieldValue)}, expected type ${fieldType}`);
    };
    for (const row of data) {
        for (const [field, value] of Object.entries(row)) {
            const fieldType = field in types ? types[field] : 'string';

            // Null string?
            if (optionCSV && value === 'null') {
                row[field] = null;

            // Number field
            } else if (fieldType === 'number') {
                if (optionCSV && typeof value === 'string') {
                    const numberValue = parseCSVNumber(value);
                    if (numberValue === null) {
                        throwFieldError(field, fieldType, value);
                    }
                    row[field] = numberValue;
                } else if (value !== null && typeof value !== 'number') {
                    throwFieldError(field, fieldType, value);
                }

            // Datetime field
            } else if (fieldType === 'datetime') {
                if (typeof value === 'string') {
                    const datetimeValue = parseCSVDatetime(value);
                    if (datetimeValue === null) {
                        throwFieldError(field, fieldType, value);
                    }
                    row[field] = datetimeValue;
                } else if (value !== null && !(value instanceof 'Date')) {
                    throwFieldError(field, fieldType, value);
                }

            // String field
            } else {
                if (value !== null && typeof value !== 'string') {
                    throwFieldError(field, fieldType, value);
                }
            }
        }
    }

    return types;
}


// Helper function to parse a CSV number
function parseCSVNumber(text) {
    const value = Number.parseFloat(text);
    if (Number.isNaN(value) || !Number.isFinite(value)) {
        return null;
    }
    return value;
}


// Helper function to parse a CSV datetime
function parseCSVDatetime(text) {
    if (!rCSVDate.test(text) && !rCSVDatetime.test(text)) {
        return null;
    }
    return new Date(text);
}

const rCSVDate = /^\d{4}-\d{2}-\d{2}$/;
const rCSVDatetime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})$/;


/**
 * Filter data rows
 *
 * @param {Object[]} data - The data array. Row objects are updated with parsed/validated values.
 * @param {Object} types - The map of field name to field type ("datetime", "number", "string")
 * @param {Object} filters - The array of filter specifications
 * @param {ChartVariables} [variables={}] - The map of variable name to chart variable
 * @returns {Object[]} The filtered data array
 */
export function filterData(data, types, filters, variables = {}) {
    return data.filter((row) => filters.every((filter) => {
        // Get the filter field value - skip nulls
        if (!(filter.field in types)) {
            throw new Error(`Unknown filter field "${filter.field}"`);
        }
        const fieldName = filter.field;
        const fieldType = types[fieldName];
        const fieldValue = fieldName in row ? row[fieldName] : null;
        if (fieldValue === null) {
            return true;
        }

        // Test the field value
        return (!('lt' in filter) || fieldValue < validateFilterValue(filter.lt, fieldName, fieldType)) &&
            (!('lte' in filter) || fieldValue <= validateFilterValue(filter.lte, fieldName, fieldType)) &&
            (!('gt' in filter) || fieldValue > validateFilterValue(filter.gt, fieldName, fieldType)) &&
            (!('gte' in filter) || fieldValue >= validateFilterValue(filter.gte, fieldName, fieldType)) &&
            (!('vlt' in filter) || !(filter.vlt in variables) ||
             fieldValue < validateFilterValue(variables[filter.vlt], fieldName, fieldType)) &&
            (!('vlte' in filter) || !(filter.vlte in variables) ||
             fieldValue <= validateFilterValue(variables[filter.vlte], fieldName, fieldType)) &&
            (!('vgt' in filter) || !(filter.vgt in variables) ||
             fieldValue > validateFilterValue(variables[filter.vgt], fieldName, fieldType)) &&
            (!('vgte' in filter) || !(filter.vgte in variables) ||
             fieldValue >= validateFilterValue(variables[filter.vgte], fieldName, fieldType)) &&
            ((!('in' in filter) && !('vin' in filter)) ||
             (('in' in filter && filter.in.some(
                 (filterValue) => fieldValue === validateFilterValue(filterValue, fieldName, fieldType)
             )) || ('vin' in filter && filter.vin.some(
                 (varName) => varName in variables && fieldValue === validateFilterValue(variables[varName], fieldName, fieldType)
             )))) &&
            ((!('except' in filter) && !('vexcept' in filter)) ||
             (('except' in filter && !filter.except.some(
                 (filterValue) => fieldValue === validateFilterValue(filterValue, fieldName, fieldType)
             )) || ('vexcept' in filter && !filter.vexcept.some(
                 (varName) => varName in variables && fieldValue === validateFilterValue(variables[varName], fieldName, fieldType)
             ))));
    }));
}


// Helper function to validate filter values
function validateFilterValue(filterValue, fieldName, fieldType) {
    const filterType = 'datetime' in filterValue ? 'datetime' : ('number' in filterValue ? 'number' : 'string');
    if (filterType !== fieldType) {
        throw new Error(`Invalid filter value ${JSON.stringify(filterValue[filterType])} (type "${filterType}") ` +
                        `for filter field "${fieldName}" (type "${fieldType}")`);
    }
    return filterValue[filterType];
}


/**
 * Aggregate data rows
 *
 * @param {Object[]} data - The data array. Row objects are updated with parsed/validated values.
 * @param {Object} types - The map of field name to field type ("datetime", "number", "string")
 * @param {Object} filters - The array of filter specifications
 * @returns {Object[]} The filtered data array
 */
export function aggregateData(data, types, filters) {
    return types !== null && filters !== null ? data : data;
}
