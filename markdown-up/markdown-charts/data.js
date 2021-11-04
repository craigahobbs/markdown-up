// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

import {getBaseURL, isRelativeURL} from '../../markdown-model/index.js';


/**
 * @typedef {Object} LoadChartDataResult
 * @property {Object[]} data - The data row object array
 * @property {Object} types - The map of field name to field type ("datetime", "number", "string")
 */


/**
 * Load the chart's data
 *
 * @param {Object} chart - The chart model
 * @param {Object} options.window - The web browser window object
 * @param {string} [options.url] - Optional markdown file URL
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
        data = filterData(data, types, chart.filters);
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
 * Determine data field types and parse/validate field values
 *
 * @param {Object[]} data - The data array. Row objects are updated with parsed/validated values.
 * @param {boolean} [options.csv = false] - If True, parse numbers and null
 * @returns {Object} The map of field name to field type ("datetime", "number", "string")
 */
export function validateData(data, options = {'csv': false}) {
    // Determine field types
    const types = {};
    for (const row of data) {
        for (const [field, value] of Object.entries(row)) {
            if (!(field in types)) {
                if (typeof value === 'number') {
                    types[field] = 'number';
                } else if (value instanceof Date) {
                    types[field] = 'datetime';
                } else if (typeof value === 'string' && (!options.csv || value !== 'null')) {
                    if (parseCSVDatetime(value) !== null) {
                        types[field] = 'datetime';
                    } else if (options.csv && parseCSVNumber(value) !== null) {
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
            if (options.csv && value === 'null') {
                row[field] = null;

            // Number field
            } else if (fieldType === 'number') {
                if (options.csv && typeof value === 'string') {
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


/**
 * Filter data rows
 *
 * @param {Object[]} data - The data array. Row objects are updated with parsed/validated values.
 * @param {Object} types - The map of field name to field type ("datetime", "number", "string")
 * @param {Object} filters - The array of filter specifications
 * @returns {Object[]} The filtered data array
 */
export function filterData(data, types, filters) {
    const filteredData = [];
    for (const row of data) {
        if (filters.every((filterUnion) => {
            // Validate the filter type
            const filterType = 'datetime' in filterUnion ? 'datetime' : ('number' in filterUnion ? 'number' : 'string');
            const filter = filterUnion[filterType];
            if (!(filter.field in types)) {
                throw new Error(`Unknown filter field "${filter.field}"`);
            }
            if (filterType !== types[filter.field]) {
                throw new Error(`Filter type "${filterType}" does not match "${filter.field}" field type "${types[filter.field]}"`);
            }

            // Test the field value
            const filterValue = row[filter.field];
            return (!('in' in filter) || filter.in.indexOf(filterValue) !== -1) &&
                (!('except' in filter) || filter.except.indexOf(filterValue) === -1) &&
                (!('lt' in filter) || filterValue < filter.lt) &&
                (!('lte' in filter) || filterValue <= filter.lte) &&
                (!('gt' in filter) || filterValue > filter.gt) &&
                (!('gte' in filter) || filterValue >= filter.gte);
        })) {
            filteredData.push(row);
        }
    }
    return filteredData;
}
