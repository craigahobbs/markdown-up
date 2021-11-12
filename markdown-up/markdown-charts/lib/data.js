// Licensed under the MIT License
// https://github.com/craigahobbs/markdown-charts/blob/main/LICENSE

/** @module lib/data */

import {getBaseURL, isRelativeURL} from '../../../markdown-model/index.js';


/**
 * @typedef {Object} LoadChartDataResult
 * @property {Object[]} data - The data row object array
 * @property {Object} types - The map of field name to field type ("datetime", "number", "string")
 */


/**
 * Load the chart's data
 *
 * @param {Object} chart - The chart model
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {module:lib/data~LoadChartDataResult}
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
    let types = validateData(data, {csv});

    // Filter the data
    if ('filters' in chart) {
        data = filterData(chart, data, types, options);
    }

    // Aggregate the data
    if ('aggregation' in chart) {
        ({data, types} = aggregateData(chart, data, types));
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
 * Determine data field types and parse/validate field values
 *
 * @param {Object[]} data - The data array. Row objects are updated with parsed/validated values.
 * @param {boolean} [csv=false] - If true, parse number and null strings
 * @returns {Object} The map of field name to field type ("datetime", "number", "string")
 */
export function validateData(data, csv = false) {
    // Determine field types
    const types = {};
    for (const row of data) {
        for (const [field, value] of Object.entries(row)) {
            if (!(field in types)) {
                if (typeof value === 'number') {
                    types[field] = 'number';
                } else if (value instanceof Date) {
                    types[field] = 'datetime';
                } else if (typeof value === 'string' && (!csv || value !== 'null')) {
                    if (parseCSVDatetime(value) !== null) {
                        types[field] = 'datetime';
                    } else if (csv && parseCSVNumber(value) !== null) {
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
            if (csv && value === 'null') {
                row[field] = null;

            // Number field
            } else if (fieldType === 'number') {
                if (csv && typeof value === 'string') {
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
 * @param {Object} chart - The chart model
 * @param {Object[]} data - The data array. Row objects are updated with parsed/validated values.
 * @param {Object} types - The map of field name to field type ("datetime", "number", "string")
 * @param {module:lib/util~ChartOptions} [options={}] - Chart options object
 * @returns {Object[]} The filtered data array
 */
export function filterData(chart, data, types, options = {}) {
    const {filters} = chart;
    const variables = {
        ...('variables' in chart ? chart.variables : {}),
        ...('variables' in options ? options.variables : {})
    };

    // Filter the rows
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
 * @param {Object} chart - The chart model
 * @param {Object[]} data - The data array
 * @param {Object} types - The map of field name to field type ("datetime", "number", "string")
 * @returns {module:lib/data~LoadChartDataResult}
 */
export function aggregateData(chart, data, types) {
    const {aggregation} = chart;

    // Compute the aggregate field types
    const aggregateTypes = {};
    for (const category of aggregation.categories) {
        if (!(category.field in types)) {
            throw new Error(`Unknown aggregation category field "${category.field}"`);
        }
        aggregateTypes[getCategoryFieldName(category)] = types[category.field];
    }
    for (const measure of aggregation.measures) {
        if (!(measure.field in types)) {
            throw new Error(`Unknown aggregation category field "${measure.field}"`);
        }
        aggregateTypes[getMeasureFieldName(measure)] = types[measure.field];
    }

    // Create the aggregate rows
    const measureRows = {};
    for (const row of data) {
        // Compute the category values
        const categoryValues = aggregation.categories.map((category) => {
            const value = row[category.field];
            if (category.by === 'Year') {
                return new Date(value.getFullYear(), 1, 1);
            } else if (category.by === 'Month') {
                return new Date(value.getFullYear(), value.getMonth(), 1);
            } else if (category.by === 'Day') {
                return new Date(value.getFullYear(), value.getMonth(), value.getDate());
            } else if (category.by === 'Hour') {
                return new Date(value.getFullYear(), value.getMonth(), value.getDate(), value.getHours());
            }
            return value;
        });

        // Get or create the aggregate row
        let aggregateRow;
        const rowKey = categoryValues.join(', ');
        if (rowKey in measureRows) {
            aggregateRow = measureRows[rowKey];
        } else {
            aggregateRow = {};
            measureRows[rowKey] = aggregateRow;
            for (let ixCategory = 0; ixCategory < aggregation.categories.length; ixCategory++) {
                aggregateRow[getCategoryFieldName(aggregation.categories[ixCategory])] = categoryValues[ixCategory];
            }
        }

        // Add to the aggregate measure values
        for (const measure of aggregation.measures) {
            const measureFieldName = getMeasureFieldName(measure);
            const value = measure.field in row ? row[measure.field] : null;
            if (value !== null) {
                if (!(measureFieldName in aggregateRow)) {
                    aggregateRow[measureFieldName] = [];
                }
                aggregateRow[measureFieldName].push(value);
            }
        }
    }

    // Compute the measure values aggregate function value
    const aggregateRows = Object.values(measureRows);
    for (const aggregateRow of aggregateRows) {
        for (const measure of aggregation.measures) {
            const measureFieldName = getMeasureFieldName(measure);
            const measureValues = measureFieldName in aggregateRow ? aggregateRow[measureFieldName] : null;
            const measureFunction = measure.function;
            if (measureValues === null) {
                aggregateRow[measureFieldName] = null;
            } else if (measureFunction === 'Average') {
                aggregateRow[measureFieldName] = measureValues.reduce((sum, val) => sum + val) / measureValues.length;
            } else if (measureFunction === 'Count') {
                aggregateRow[measureFieldName] = measureValues.length;
            } else if (measureFunction === 'Max') {
                aggregateRow[measureFieldName] = measureValues.reduce((max, val) => (val > max ? val : max));
            } else if (measureFunction === 'Min') {
                aggregateRow[measureFieldName] = measureValues.reduce((min, val) => (val < min ? val : min));
            } else if (measureFunction === 'Sum') {
                aggregateRow[measureFieldName] = measureValues.reduce((sum, val) => sum + val);
            }
        }
    }

    return {'data': aggregateRows, 'types': aggregateTypes};
}


// Helper function to compute aggregation category field names
function getCategoryFieldName(category) {
    if ('by' in category) {
        return `${category.by.toUpperCase()}(${category.field})`;
    }
    return category.field;
}


// Helper function to compute aggregation measure field names
function getMeasureFieldName(measure) {
    return `${measure.function.toUpperCase()}(${measure.field})`;
}
